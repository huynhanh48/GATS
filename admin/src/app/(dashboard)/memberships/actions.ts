"use server";

import { revalidatePath } from "next/cache";
import { beFetch } from "@/lib/api/server";

export type BillingInterval = "lifetime" | "monthly" | "yearly";
export type MembershipStatus = "active" | "cancelled" | "expired" | "revoked";

export type MembershipPlan = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  monthlyPrice: number | null;
  yearlyPrice: number | null;
  monthlyDurationDays: number | null;
  yearlyDurationDays: number | null;
  aiDailyLimit: number;
  mentorReviewsPerMonth: number;
  features: string[];
  isActive: boolean;
  displayOrder: number;
  activeMembers: number;
};

export type AdminMembership = {
  id: string;
  userId: number;
  userName: string;
  userEmail: string;
  planId: string;
  planCode: string;
  planName: string;
  billingInterval: BillingInterval;
  status: MembershipStatus;
  source: string;
  startedAt: string;
  currentPeriodEnd: string | null;
  priceSnapshot: number;
  grantReason: string | null;
};

type ActionResult = { ok: boolean; message: string };

function errorMessage(result: { status: number; error?: string }, fallback: string) {
  if (result.status === 401) return "Phiên đăng nhập đã hết hạn";
  if (result.status === 403) return "Bạn không có quyền thực hiện thao tác này";
  return result.error ?? fallback;
}

export async function fetchMembershipPlans(): Promise<MembershipPlan[]> {
  const result = await beFetch<{ data: MembershipPlan[] }>("/admin/memberships/plans");
  return result.ok ? result.data?.data ?? [] : [];
}

export async function fetchMemberships(): Promise<AdminMembership[]> {
  const result = await beFetch<{ data: AdminMembership[] }>(
    "/admin/memberships/members?limit=100",
  );
  return result.ok ? result.data?.data ?? [] : [];
}

export type PlanInput = {
  code?: string;
  name: string;
  description?: string | null;
  monthlyPrice?: number | null;
  yearlyPrice?: number | null;
  monthlyDurationDays?: number | null;
  yearlyDurationDays?: number | null;
  aiDailyLimit: number;
  mentorReviewsPerMonth: number;
  features: string[];
  isActive: boolean;
  displayOrder: number;
};

export async function saveMembershipPlan(id: string | null, input: PlanInput): Promise<ActionResult> {
  const result = await beFetch(
    id ? `/admin/memberships/plans/${id}` : "/admin/memberships/plans",
    { method: id ? "PATCH" : "POST", body: JSON.stringify(input) },
  );
  if (!result.ok) return { ok: false, message: errorMessage(result, "Không thể lưu gói hội viên") };
  revalidatePath("/memberships");
  return { ok: true, message: id ? "Đã cập nhật gói hội viên" : "Đã tạo gói hội viên" };
}

export async function grantMembership(input: {
  userId: number;
  planId: string;
  billingInterval: BillingInterval;
  endsAt?: string | null;
  source: "admin_granted" | "promotion" | "compensation";
  reason: string;
}): Promise<ActionResult> {
  const result = await beFetch("/admin/memberships/grant", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!result.ok) return { ok: false, message: errorMessage(result, "Không thể cấp membership") };
  revalidatePath("/memberships");
  return { ok: true, message: "Đã cấp membership cho người dùng" };
}

export async function extendMembership(id: string, days: number, reason: string): Promise<ActionResult> {
  const result = await beFetch(`/admin/memberships/${id}/extend`, {
    method: "PATCH",
    body: JSON.stringify({ days, reason }),
  });
  if (!result.ok) return { ok: false, message: errorMessage(result, "Không thể gia hạn membership") };
  revalidatePath("/memberships");
  return { ok: true, message: `Đã gia hạn thêm ${days} ngày` };
}

export async function revokeMembership(id: string, reason: string): Promise<ActionResult> {
  const result = await beFetch(`/admin/memberships/${id}/revoke`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
  if (!result.ok) return { ok: false, message: errorMessage(result, "Không thể thu hồi membership") };
  revalidatePath("/memberships");
  return { ok: true, message: "Đã thu hồi membership" };
}
