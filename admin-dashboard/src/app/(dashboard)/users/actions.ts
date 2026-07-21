"use server";

import { revalidatePath } from "next/cache";
import { beFetch } from "@/lib/api/server";

export type AdminUserListItem = {
  id: number;
  userName: string;
  email: string;
  verified: boolean;
  type: string;
  isLocked: boolean;
  roles: string[];
  createdAt: string;
  updatedAt: string;
};

export type AdminUserListResponse = {
  data: AdminUserListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
  error?: string | null;
};

export type AdminUserDetailResponse = {
  user: AdminUserListItem & { hasPassword?: boolean };
  recentOrders: Array<{
    id: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    paidAt: string | null;
  }>;
  enrollments: Array<{
    id: string;
    courseId: string;
    courseTitle: string | null;
    courseSlug: string | null;
    status: string;
    source: string;
    expiredAt: string | null;
    createdAt: string;
    completedLessons: number;
    totalLessons: number;
    percent: number;
    lastActivityAt: string | null;
  }>;
  enrollmentsSummary: {
    total: number;
    active: number;
    cancelled: number;
    expired: number;
  };
  auditLogs: Array<{
    id: string;
    action: string;
    actorUserId: number | null;
    meta: Record<string, unknown> | null;
    createdAt: string;
  }>;
};

export async function fetchUsers(options: {
  page?: number;
  limit?: number;
  q?: string;
  verified?: "all" | "1" | "0";
  locked?: "all" | "1" | "0";
}): Promise<AdminUserListResponse> {
  const page = options.page ?? 1;
  const limit = options.limit ?? 20;
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (options.q?.trim()) params.set("q", options.q.trim());
  if (options.verified === "1" || options.verified === "0") {
    params.set("verified", options.verified);
  }
  if (options.locked === "1" || options.locked === "0") {
    params.set("locked", options.locked);
  }

  const result = await beFetch<AdminUserListResponse>(
    `/admin/users?${params.toString()}`,
  );

  if (!result.ok || !result.data) {
    return {
      data: [],
      pagination: {
        page: 1,
        limit,
        total: 0,
        totalPages: 0,
        hasMore: false,
      },
      error: result.error ?? "Không kết nối được máy chủ users",
    };
  }

  return { ...result.data, error: null };
}

export async function fetchUserDetail(
  id: number,
): Promise<AdminUserDetailResponse | null> {
  const result = await beFetch<AdminUserDetailResponse>(`/admin/users/${id}`);
  if (!result.ok || !result.data) return null;
  return result.data;
}

async function postAction(
  id: number,
  path: string,
  method: "POST" | "PATCH" = "POST",
  reason?: string,
): Promise<{ ok: boolean; message?: string }> {
  const result = await beFetch<{ message?: string }>(
    `/admin/users/${id}${path}`,
    {
      method,
      body:
        reason !== undefined
          ? JSON.stringify({ reason: reason.trim() })
          : undefined,
    },
  );
  if (!result.ok) {
    return { ok: false, message: result.error ?? "Thất bại" };
  }
  revalidatePath("/users");
  revalidatePath(`/users/${id}`);
  return { ok: true, message: result.data?.message };
}

export async function resendVerification(id: number) {
  return postAction(id, "/resend-verification");
}

export async function sendPasswordReset(id: number) {
  return postAction(id, "/send-password-reset");
}

export async function revokeSessions(id: number, reason?: string) {
  return postAction(id, "/revoke-sessions", "POST", reason);
}

export async function lockUser(id: number, reason?: string) {
  return postAction(id, "/lock", "PATCH", reason);
}

export async function unlockUser(id: number, reason?: string) {
  return postAction(id, "/unlock", "PATCH", reason);
}
