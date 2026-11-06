import * as AssignmentSubmissionRepo from '@src/repos/AssignmentSubmissionRepo';
import * as EnrollmentRepo from '@src/repos/EnrollmentRepo';
import * as LeadRepo from '@src/repos/LeadRepo';
import * as OrderRepo from '@src/repos/OrderRepo';
import * as PaymentExceptionRepo from '@src/repos/PaymentExceptionRepo';

async function getDashboardMetrics() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    orderCounts,
    revenueTotal,
    revenueThisMonth,
    leadCounts,
    enrollmentCounts,
    newEnrollments7d,
    pendingSubmissions,
    unresolvedExceptions,
  ] = await Promise.all([
    OrderRepo.countByStatus(),
    OrderRepo.sumPaidAmount(),
    OrderRepo.sumPaidAmount(startOfMonth),
    LeadRepo.countByStatus(),
    EnrollmentRepo.countByStatus(),
    EnrollmentRepo.countCreatedSince(sevenDaysAgo),
    AssignmentSubmissionRepo.countByStatus('submitted'),
    PaymentExceptionRepo.countUnresolved(),
  ]);

  return {
    orders: orderCounts,
    revenue: {
      total: revenueTotal,
      thisMonth: revenueThisMonth,
    },
    leads: leadCounts,
    enrollments: {
      ...enrollmentCounts,
      newLast7Days: newEnrollments7d,
    },
    pendingSubmissions,
    unresolvedExceptions,
    generatedAt: now.toISOString(),
  };
}

export default {
  getDashboardMetrics,
};
