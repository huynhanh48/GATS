"use server";

import { revalidatePath } from "next/cache";
import { beFetch } from "@/lib/api/server";
import {
  fetchUserDetail,
  fetchUsers,
  type AdminUserListItem,
} from "../users/actions";

export type CertificateStatus = "issued" | "revoked";

export type AdminCertificate = {
  id: string;
  certificateNumber: string;
  userId: number;
  userName: string | null;
  userEmail: string | null;
  courseId: string;
  courseTitle: string | null;
  status: CertificateStatus;
  issuedById: number | null;
  issuedAt: string;
  revokedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CertificateListResponse = {
  data: AdminCertificate[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
};

export type CertUserOption = {
  id: number;
  userName: string;
  email: string;
};

export type CertCourseOption = {
  courseId: string;
  courseTitle: string;
  percent: number;
  status: string;
};

function mapActionError(
  result: { status: number; ok: boolean; error?: string },
  fallback: string,
): string {
  if (result.status === 401) return "Phiên đăng nhập đã hết hạn";
  if (result.status === 403) return "Bạn không có quyền thực hiện thao tác này";
  return result.error ?? fallback;
}

export async function fetchCertificates(options: {
  page?: number;
  limit?: number;
  q?: string;
} = {}): Promise<CertificateListResponse> {
  const page = options.page ?? 1;
  const limit = options.limit ?? 50;
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (options.q?.trim()) params.set("q", options.q.trim());

  const result = await beFetch<CertificateListResponse>(
    `/certificates/admin?${params.toString()}`,
  );

  if (!result.ok || !result.data) {
    return {
      data: [],
      pagination: { page, limit, total: 0, totalPages: 0, hasMore: false },
    };
  }
  return result.data;
}

export async function searchCertUsers(
  q: string,
): Promise<CertUserOption[]> {
  const { data } = await fetchUsers({ page: 1, limit: 30, q: q || undefined });
  return data.map((u: AdminUserListItem) => ({
    id: u.id,
    userName: u.userName,
    email: u.email,
  }));
}

export async function fetchActiveEnrollmentsForUser(
  userId: number,
): Promise<CertCourseOption[]> {
  const detail = await fetchUserDetail(userId);
  if (!detail) return [];
  return detail.enrollments
    .filter((e) => e.status === "active")
    .map((e) => ({
      courseId: e.courseId,
      courseTitle: e.courseTitle ?? e.courseId,
      percent: e.percent,
      status: e.status,
    }));
}

export async function resolveCertPrefill(options: {
  userId: number;
  courseId?: string;
}): Promise<{
  user: CertUserOption | null;
  course: CertCourseOption | null;
  courses: CertCourseOption[];
}> {
  const detail = await fetchUserDetail(options.userId);
  if (!detail) {
    return { user: null, course: null, courses: [] };
  }
  const user: CertUserOption = {
    id: detail.user.id,
    userName: detail.user.userName,
    email: detail.user.email,
  };
  const courses = detail.enrollments
    .filter((e) => e.status === "active")
    .map((e) => ({
      courseId: e.courseId,
      courseTitle: e.courseTitle ?? e.courseId,
      percent: e.percent,
      status: e.status,
    }));
  const course =
    options.courseId != null
      ? (courses.find((c) => c.courseId === options.courseId) ?? null)
      : null;
  return { user, course, courses };
}

export async function issueCertificate(
  userId: number,
  courseId: string,
  reason?: string | null,
): Promise<{ ok: boolean; message: string }> {
  const result = await beFetch<{ data: AdminCertificate; reissued?: boolean }>(
    "/certificates/admin/issue",
    {
      method: "POST",
      body: JSON.stringify({
        userId,
        courseId,
        ...(reason?.trim() ? { reason: reason.trim() } : {}),
      }),
    },
  );

  if (!result.ok) {
    return { ok: false, message: mapActionError(result, "Cấp chứng chỉ thất bại") };
  }

  revalidatePath("/certificates");
  revalidatePath("/users");
  return {
    ok: true,
    message: result.data?.reissued
      ? "Đã cấp lại chứng chỉ"
      : "Đã cấp chứng chỉ",
  };
}

export async function reissueCertificate(
  id: string,
  reason?: string | null,
): Promise<{ ok: boolean; message: string }> {
  const result = await beFetch<{ data: AdminCertificate }>(
    `/certificates/admin/${id}/reissue`,
    {
      method: "POST",
      body: JSON.stringify({
        ...(reason?.trim() ? { reason: reason.trim() } : {}),
      }),
    },
  );

  if (!result.ok) {
    return {
      ok: false,
      message: mapActionError(result, "Cấp lại chứng chỉ thất bại"),
    };
  }

  revalidatePath("/certificates");
  return { ok: true, message: "Đã cấp lại chứng chỉ" };
}

export async function revokeCertificate(
  id: string,
): Promise<{ ok: boolean; message: string }> {
  const result = await beFetch<{ data: AdminCertificate }>(
    `/certificates/admin/${id}/revoke`,
    { method: "POST" },
  );

  if (!result.ok) {
    return { ok: false, message: mapActionError(result, "Thu hồi chứng chỉ thất bại") };
  }

  revalidatePath("/certificates");
  return { ok: true, message: "Đã thu hồi chứng chỉ" };
}
