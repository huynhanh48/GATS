"use server";

import { revalidatePath } from "next/cache";
import { beFetch } from "@/lib/api/server";

export type BannedWord = {
  id: string;
  word: string;
  isActive: boolean;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

function mapError(
  result: { status: number; ok: boolean; error?: string },
  fallback: string,
): string {
  if (result.status === 401) return "Phiên đăng nhập đã hết hạn";
  if (result.status === 403) return "Bạn không có quyền thực hiện thao tác này";
  if (result.status === 409) return result.error ?? "Từ cấm đã tồn tại";
  return result.error ?? fallback;
}

export async function fetchBannedWords(): Promise<BannedWord[]> {
  const result = await beFetch<{ data: BannedWord[] }>("/banned-words");
  if (!result.ok || !result.data?.data) return [];
  return result.data.data;
}

export async function createBannedWord(input: {
  word: string;
  note?: string;
  isActive?: boolean;
}): Promise<{ ok: boolean; message: string }> {
  const result = await beFetch<{ bannedWord: BannedWord }>("/banned-words", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!result.ok) {
    return { ok: false, message: mapError(result, "Thêm từ cấm thất bại") };
  }
  revalidatePath("/moderation/banned-words");
  return { ok: true, message: "Đã thêm từ cấm" };
}

export async function updateBannedWord(
  id: string,
  input: { word?: string; note?: string | null; isActive?: boolean },
): Promise<{ ok: boolean; message: string }> {
  const result = await beFetch<{ bannedWord: BannedWord }>(
    `/banned-words/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
  if (!result.ok) {
    return { ok: false, message: mapError(result, "Cập nhật thất bại") };
  }
  revalidatePath("/moderation/banned-words");
  return { ok: true, message: "Đã cập nhật từ cấm" };
}

export async function deleteBannedWord(
  id: string,
): Promise<{ ok: boolean; message: string }> {
  const result = await beFetch<{ message?: string }>(`/banned-words/${id}`, {
    method: "DELETE",
  });
  if (!result.ok) {
    return { ok: false, message: mapError(result, "Xóa thất bại") };
  }
  revalidatePath("/moderation/banned-words");
  return { ok: true, message: "Đã xóa từ cấm" };
}
