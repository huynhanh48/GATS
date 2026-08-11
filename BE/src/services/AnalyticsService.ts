import * as AnalyticsRepo from '@src/repos/AnalyticsRepo';
import * as CourseRepo from '@src/repos/CourseRepo';
import * as LeadRepo from '@src/repos/LeadRepo';
import * as OrderRepo from '@src/repos/OrderRepo';

function clampDays(raw: unknown, fallback = 14): number {
  const n = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(90, Math.max(7, Math.floor(n)));
}

async function getOverview(options?: { days?: number }) {
  const days = clampDays(options?.days, 14);
  const [
    revenue,
    userCount,
    enrollmentCount,
    certificateCount,
    couponSummary,
    topCourses,
    revenueByDay,
    orderCounts,
    courseCount,
    leadCounts,
  ] = await Promise.all([
    AnalyticsRepo.getRevenueSummary(),
    AnalyticsRepo.getUserCount(),
    AnalyticsRepo.getEnrollmentCount(),
    AnalyticsRepo.getCertificateCount(),
    AnalyticsRepo.getCouponRedemptionSummary(),
    AnalyticsRepo.getTopCoursesBySales(5),
    AnalyticsRepo.getRevenueByDay(days),
    OrderRepo.countByStatus(),
    CourseRepo.countAll(),
    LeadRepo.countByStatus(),
  ]);

  return {
    data: {
      revenue,
      users: { total: userCount },
      enrollments: { active: enrollmentCount },
      certificates: { issued: certificateCount },
      coupons: couponSummary,
      courses: { total: courseCount },
      orders: orderCounts,
      leads: leadCounts,
      topCourses,
      revenueByDay,
      rangeDays: days,
    },
  };
}

function csvEscape(value: unknown): string {
  const str = value == null ? '' : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

async function exportCsv(options?: { days?: number }) {
  const { data } = await getOverview(options);
  const days = data.rangeDays;
  const lines: string[] = [];

  lines.push(['section', 'key', 'value'].map(csvEscape).join(','));
  lines.push(['meta', 'rangeDays', days].map(csvEscape).join(','));
  lines.push(
    ['revenue', 'totalRevenue', data.revenue.totalRevenue].map(csvEscape).join(','),
  );
  lines.push(
    ['revenue', 'last30dRevenue', data.revenue.last30dRevenue]
      .map(csvEscape)
      .join(','),
  );
  lines.push(['users', 'total', data.users.total].map(csvEscape).join(','));
  lines.push(
    ['enrollments', 'active', data.enrollments.active].map(csvEscape).join(','),
  );
  lines.push(
    ['certificates', 'issued', data.certificates.issued]
      .map(csvEscape)
      .join(','),
  );
  lines.push(
    ['coupons', 'redemptions', data.coupons.redemptions]
      .map(csvEscape)
      .join(','),
  );
  lines.push(
    ['coupons', 'totalDiscount', data.coupons.totalDiscount]
      .map(csvEscape)
      .join(','),
  );
  lines.push(['courses', 'total', data.courses.total].map(csvEscape).join(','));

  for (const [status, value] of Object.entries(data.orders)) {
    lines.push(['orders', status, value].map(csvEscape).join(','));
  }
  for (const [status, value] of Object.entries(data.leads)) {
    lines.push(['leads', status, value].map(csvEscape).join(','));
  }
  for (const row of data.revenueByDay) {
    lines.push(
      ['revenueByDay', row.date, row.revenue].map(csvEscape).join(','),
    );
  }
  for (const course of data.topCourses) {
    lines.push(
      [
        'topCourse',
        course.title ?? course.courseId,
        `${course.sales}|${course.revenue}`,
      ]
        .map(csvEscape)
        .join(','),
    );
  }

  const stamp = new Date().toISOString().slice(0, 10);
  return {
    csv: `\uFEFF${lines.join('\n')}`,
    filename: `analytics-${days}d-${stamp}.csv`,
  };
}

export default {
  getOverview,
  exportCsv,
};
