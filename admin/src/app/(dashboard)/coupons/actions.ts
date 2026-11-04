"use server";

import { revalidatePath } from "next/cache";
import { beFetch } from "@/lib/api/server";

export type CouponType = "percent" | "fixed";

export type AdminCoupon = {
  id: string;
  code: string;
  description: string | null;
  type: CouponType;
  value: number;
  maxUses: number | null;
  usedCount: number;
  minOrderAmount: number;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
  createdById: number | null;
  createdAt: string;
  updatedAt: string;
};

export type CouponListResponse = {
  data: AdminCoupon[];
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

export async function fetchCoupons(): Promise<AdminCoupon[]> {
  const result = await beFetch<CouponListResponse>("/coupons?limit=100");
  if (!result.ok || !result.data?.data) return [];
  return result.data.data;
}

export type CouponInput = {
  code: string;
  description?: string;
  type: CouponType;
  value: number;
  maxUses?: number | null;
  minOrderAmount: number;
  startsAt?: string | null;
  endsAt?: string | null;
  isActive: boolean;
};

export async function createCoupon(
  input: CouponInput,
): Promise<{ ok: boolean; message: string }> {
  const result = await beFetch<{ data: AdminCoupon }>("/coupons", {
    method: "POST",
    body: JSON.stringify(input),
  });

  if (!result.ok) {
    return { ok: false, message: mapActionError(result, "Tạo mã giảm giá thất bại") };
  }

  revalidatePath("/coupons");
  return { ok: true, message: "Tạo mã giảm giá thành công" };
}

export async function updateCoupon(
  id: string,
  input: Partial<CouponInput>,
): Promise<{ ok: boolean; message: string }> {
  const result = await beFetch<{ data: AdminCoupon }>(`/coupons/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });

  if (!result.ok) {
    return { ok: false, message: mapActionError(result, "Cập nhật mã giảm giá thất bại") };
  }

  revalidatePath("/coupons");
  return { ok: true, message: "Cập nhật mã giảm giá thành công" };
}

export async function deleteCoupon(
  id: string,
): Promise<{ ok: boolean; message: string }> {
  const result = await beFetch(`/coupons/${id}`, { method: "DELETE" });

  if (!result.ok) {
    return { ok: false, message: mapActionError(result, "Xóa mã giảm giá thất bại") };
  }

  revalidatePath("/coupons");
  return { ok: true, message: "Xóa mã giảm giá thành công" };
}
