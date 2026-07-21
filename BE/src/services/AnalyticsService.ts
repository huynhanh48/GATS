import * as AnalyticsRepo from '@src/repos/AnalyticsRepo';
import * as CourseRepo from '@src/repos/CourseRepo';
import * as LeadRepo from '@src/repos/LeadRepo';
import * as OrderRepo from '@src/repos/OrderRepo';

async function getOverview() {
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
    AnalyticsRepo.getRevenueByDay(14),
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
    },
  };
}

export default {
  getOverview,
};
