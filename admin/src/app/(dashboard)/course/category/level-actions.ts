"use server";

import { revalidatePath } from "next/cache";
import { beFetch } from "@/lib/api/server";
import type { LevelListResponse, LevelMetadata } from "@/lib/api/types";

export async function fetchLevels(): Promise<LevelMetadata[]> {
  const result = await beFetch<LevelListResponse>("/levels");
  return result.ok ? (result.data?.data ?? []) : [];
}

export async function updateLevel(
  code: LevelMetadata["code"],
  input: Pick<LevelMetadata, "name" | "description" | "status">,
): Promise<{ ok: boolean; message: string }> {
  const result = await beFetch(`/levels/${code}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  if (!result.ok) {
    return { ok: false, message: result.error ?? "Cập nhật cấp độ thất bại" };
  }
  revalidatePath("/course/category");
  return { ok: true, message: "Cập nhật cấp độ thành công" };
}
