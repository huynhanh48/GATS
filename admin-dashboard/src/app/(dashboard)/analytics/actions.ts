"use server";

import { beFetch } from "@/lib/api/server";

export type AnalyticsOverview = {
  revenue: {
    totalRevenue: number;
    totalPaidOrders: number;
    last30dRevenue: number;
    last30dPaidOrders: number;
  };
  users: { total: number };
  enrollments: { active: number };
  certificates: { issued: number };
  coupons: { redemptions: number; totalDiscount: number };
  courses: { total: number };
  orders: Record<string, number>;
  leads: Record<string, number>;
  topCourses: Array<{
    courseId: string;
    title: string | null;
    sales: number;
    revenue: number;
  }>;
  revenueByDay: Array<{ date: string; revenue: number; orders: number }>;
};

export type DashboardMetrics = {
  orders: Record<string, number>;
  revenue: { total: number; thisMonth: number };
  leads: Record<string, number>;
  enrollments: { newLast7Days: number } & Record<string, number>;
  pendingSubmissions: number;
  unresolvedExceptions: number;
  generatedAt: string;
};

const emptyOverview: AnalyticsOverview = {
  revenue: { totalRevenue: 0, totalPaidOrders: 0, last30dRevenue: 0, last30dPaidOrders: 0 },
  users: { total: 0 },
  enrollments: { active: 0 },
  certificates: { issued: 0 },
  coupons: { redemptions: 0, totalDiscount: 0 },
  courses: { total: 0 },
  orders: {},
  leads: {},
  topCourses: [],
  revenueByDay: [],
};

export async function fetchAnalyticsOverview(days = 14): Promise<{
  data: AnalyticsOverview;
  error?: string | null;
}> {
  const result = await beFetch<{ data: AnalyticsOverview }>(
    `/analytics/overview?days=${days}`,
  );
  if (!result.ok || !result.data?.data) {
    return { data: emptyOverview, error: result.error ?? "Không tải được dữ liệu phân tích" };
  }
  return { data: result.data.data, error: null };
}

export async function fetchDashboardMetrics(): Promise<{
  data: DashboardMetrics | null;
  error?: string | null;
}> {
  const result = await beFetch<DashboardMetrics>("/admin/metrics");
  if (!result.ok || !result.data) {
    return { data: null, error: result.error ?? "Không tải được số liệu tổng quan" };
  }
  return { data: result.data, error: null };
}
