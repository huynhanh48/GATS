"use server";

import { revalidatePath } from "next/cache";
import { beFetch } from "@/lib/api/server";

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

export async function issueCertificate(
  userId: number,
  courseId: string,
): Promise<{ ok: boolean; message: string }> {
  const result = await beFetch<{ data: AdminCertificate }>(
    "/certificates/admin/issue",
    {
      method: "POST",
      body: JSON.stringify({ userId, courseId }),
    },
  );

  if (!result.ok) {
    return { ok: false, message: mapActionError(result, "Cấp chứng chỉ thất bại") };
  }

  revalidatePath("/certificates");
  return { ok: true, message: "Đã cấp chứng chỉ" };
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
