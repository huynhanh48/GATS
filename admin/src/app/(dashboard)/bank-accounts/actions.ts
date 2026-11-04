"use server";

import { revalidatePath } from "next/cache";
import { beFetch } from "@/lib/api/server";

export type BankAccount = {
  id: string;
  label: string;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountHolder: string;
  bankBranch: string | null;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type BankAccountInput = {
  label: string;
  bankName: string;
  bankCode?: string;
  accountNumber: string;
  accountHolder: string;
  bankBranch?: string;
  isDefault?: boolean;
  isActive?: boolean;
};

function mapError(
  result: { status: number; ok: boolean; error?: string },
  fallback: string,
): string {
  if (result.status === 401) return "Phiên đăng nhập đã hết hạn";
  if (result.status === 403) return "Bạn không có quyền thực hiện thao tác này";
  return result.error ?? fallback;
}

export async function fetchBankAccounts(): Promise<BankAccount[]> {
  const result = await beFetch<{ data: BankAccount[] }>("/bank-accounts");
  if (!result.ok || !result.data?.data) return [];
  return result.data.data;
}

export async function createBankAccount(
  input: BankAccountInput,
): Promise<{ ok: boolean; message: string }> {
  const result = await beFetch<{ bankAccount: BankAccount }>("/bank-accounts", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!result.ok) {
    return { ok: false, message: mapError(result, "Tạo tài khoản thất bại") };
  }
  revalidatePath("/bank-accounts");
  return { ok: true, message: "Đã thêm tài khoản ngân hàng" };
}

export async function updateBankAccount(
  id: string,
  input: Partial<BankAccountInput>,
): Promise<{ ok: boolean; message: string }> {
  const result = await beFetch<{ bankAccount: BankAccount }>(
    `/bank-accounts/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
  if (!result.ok) {
    return { ok: false, message: mapError(result, "Cập nhật thất bại") };
  }
  revalidatePath("/bank-accounts");
  return { ok: true, message: "Đã cập nhật tài khoản" };
}

export async function setDefaultBankAccount(
  id: string,
): Promise<{ ok: boolean; message: string }> {
  const result = await beFetch<{ bankAccount: BankAccount }>(
    `/bank-accounts/${id}/default`,
    { method: "POST" },
  );
  if (!result.ok) {
    return { ok: false, message: mapError(result, "Đặt mặc định thất bại") };
  }
  revalidatePath("/bank-accounts");
  return { ok: true, message: "Đã đặt làm tài khoản mặc định" };
}

export async function deleteBankAccount(
  id: string,
): Promise<{ ok: boolean; message: string }> {
  const result = await beFetch<{ message?: string }>(`/bank-accounts/${id}`, {
    method: "DELETE",
  });
  if (!result.ok) {
    return { ok: false, message: mapError(result, "Xóa thất bại") };
  }
  revalidatePath("/bank-accounts");
  return { ok: true, message: "Đã xóa tài khoản" };
}
