"use server";

import { beFetch } from "@/lib/api/server";

export type OrderStatusCounts = {
  pending: number;
  paid: number;
  cancelled: number;
  refund_pending: number;
  refunded: number;
  all: number;
};

export type LeadStatusCounts = {
  new: number;
  contacted: number;
  qualified: number;
  converted: number;
  lost: number;
  spam: number;
  all: number;
};

export type EnrollmentStatusCounts = {
  active: number;
  expired: number;
  cancelled: number;
  all: number;
  newLast7Days: number;
};

export type DashboardMetrics = {
  orders: OrderStatusCounts;
  revenue: { total: number; thisMonth: number };
  leads: LeadStatusCounts;
  enrollments: EnrollmentStatusCounts;
  pendingSubmissions: number;
  unresolvedExceptions: number;
  generatedAt: string;
};

const emptyMetrics: DashboardMetrics = {
  orders: {
    pending: 0,
    paid: 0,
    cancelled: 0,
    refund_pending: 0,
    refunded: 0,
    all: 0,
  },
  revenue: { total: 0, thisMonth: 0 },
  leads: {
    new: 0,
    contacted: 0,
    qualified: 0,
    converted: 0,
    lost: 0,
    spam: 0,
    all: 0,
  },
  enrollments: { active: 0, expired: 0, cancelled: 0, all: 0, newLast7Days: 0 },
  pendingSubmissions: 0,
  unresolvedExceptions: 0,
  generatedAt: new Date(0).toISOString(),
};

export async function fetchDashboardMetrics(): Promise<{
  metrics: DashboardMetrics;
  error: string | null;
}> {
  const result = await beFetch<DashboardMetrics>(`/admin/metrics`);

  if (!result.ok || !result.data) {
    return {
      metrics: emptyMetrics,
      error: result.error ?? "Không tải được số liệu tổng quan",
    };
  }

  return { metrics: result.data, error: null };
}
