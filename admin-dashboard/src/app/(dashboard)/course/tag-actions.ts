"use server";

import { beFetch } from "@/lib/api/server";
import type {
  CreateTagInput,
  TagListResponse,
  TagWithCounts,
} from "@/lib/api/types";
import { revalidatePath } from "next/cache";

function mapTagError(
  result: { status: number; error?: string },
  fallback: string,
): string {
  if (result.status === 401) return "Phiên đăng nhập đã hết hạn";
  if (result.status === 403) return "Bạn không có quyền tạo tag khóa học";
  if (result.status === 409) return "Tag này đã tồn tại";
  return result.error ?? fallback;
}

export async function fetchCourseTags(): Promise<TagWithCounts[]> {
  const params = new URLSearchParams({
    type: "course",
    status: "active",
  });
  const result = await beFetch<TagListResponse>(
    `/tags?${params.toString()}`,
  );
  if (!result.ok || !result.data?.data) return [];
  return result.data.data;
}

export async function createCourseTag(
  name: string,
): Promise<{ ok: boolean; message: string; tag?: TagWithCounts }> {
  const trimmed = name.trim();
  if (!trimmed) {
    return { ok: false, message: "Tên tag không được để trống" };
  }

  const input: CreateTagInput = { name: trimmed, type: "course" };
  const result = await beFetch<{ tag: TagWithCounts }>("/tags", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!result.ok || !result.data?.tag) {
    return {
      ok: false,
      message: mapTagError(result, "Tạo tag thất bại"),
    };
  }

  revalidatePath("/course");
  revalidatePath("/course/new");
  return {
    ok: true,
    message: "Tạo tag thành công",
    tag: {
      ...result.data.tag,
      status: result.data.tag.status ?? "active",
      courseCount: result.data.tag.courseCount ?? 0,
      postCount: result.data.tag.postCount ?? 0,
    },
  };
}
