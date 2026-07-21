"use server";

import { revalidatePath } from "next/cache";
import { beFetch } from "@/lib/api/server";

export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "converted"
  | "lost"
  | "spam";

export type LeadListItem = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  source: string;
  status: LeadStatus;
  assigneeUserId: number | null;
  assigneeName: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LeadCounts = Record<LeadStatus, number> & { all: number };

export type LeadListResponse = {
  data: LeadListItem[];
  counts?: LeadCounts;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
  error?: string | null;
};

export async function fetchLeads(options: {
  page?: number;
  limit?: number;
  q?: string;
  status?: LeadStatus | "all";
}): Promise<LeadListResponse> {
  const page = options.page ?? 1;
  const limit = options.limit ?? 20;
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (options.q?.trim()) params.set("q", options.q.trim());
  if (options.status && options.status !== "all") {
    params.set("status", options.status);
  }

  const result = await beFetch<LeadListResponse>(`/leads?${params.toString()}`);

  if (!result.ok || !result.data) {
    return {
      data: [],
      counts: {
        all: 0,
        new: 0,
        contacted: 0,
        qualified: 0,
        converted: 0,
        lost: 0,
        spam: 0,
      },
      pagination: {
        page: 1,
        limit,
        total: 0,
        totalPages: 0,
        hasMore: false,
      },
      error: result.error ?? "Không kết nối được máy chủ leads",
    };
  }

  return { ...result.data, error: null };
}

export async function updateLead(
  id: string,
  patch: {
    status?: LeadStatus;
    notes?: string | null;
    assigneeUserId?: number | null;
  },
): Promise<{ ok: boolean; message?: string }> {
  const result = await beFetch<{ message?: string }>(`/leads/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });

  if (!result.ok) {
    return { ok: false, message: result.error ?? "Cập nhật thất bại" };
  }

  revalidatePath("/leads");
  return { ok: true, message: result.data?.message };
}

export type LeadAuditLogRow = {
  id: string;
  action: string;
  actorUserId: number | null;
  meta: Record<string, unknown> | null;
  createdAt: string;
};

export async function fetchLeadActivity(
  id: string,
): Promise<LeadAuditLogRow[]> {
  const result = await beFetch<{ auditLogs?: LeadAuditLogRow[] }>(
    `/leads/${id}`,
  );
  if (!result.ok || !result.data) return [];
  return result.data.auditLogs ?? [];
}

export type StaffUserOption = {
  id: number;
  userName: string;
  email: string;
};

/** Staff = admin | instructor, matching BE `requireStaff`. Used to populate the assignee picker. */
export async function fetchStaffUsers(): Promise<StaffUserOption[]> {
  const result = await beFetch<{
    data: Array<{ id: number; userName: string; email: string; roles: string[] }>;
  }>(`/admin/users?limit=100`);

  if (!result.ok || !result.data) return [];

  return result.data.data
    .filter((user) => user.roles.includes("admin") || user.roles.includes("instructor"))
    .map((user) => ({ id: user.id, userName: user.userName, email: user.email }));
}
