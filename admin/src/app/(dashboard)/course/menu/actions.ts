"use server";
import { revalidatePath } from "next/cache";
import { beFetch } from "@/lib/api/server";
import type { CategoryWithCounts, CourseMenuItem, TagWithCategoryCounts, TagWithCounts } from "@/lib/api/types";

const path = "/course/menu";

export async function getCourseMenu() {
  const result = await beFetch<{ data: CourseMenuItem[] }>("/admin/course-menu");
  return result.ok ? result.data?.data ?? [] : [];
}

export async function getCourseTags(): Promise<TagWithCounts[]> {
  const result = await beFetch<{ data: TagWithCounts[] }>("/tags?status=active");
  return result.ok ? result.data?.data ?? [] : [];
}

export async function getCourseCategories(): Promise<CategoryWithCounts[]> {
  const result = await beFetch<{ data: CategoryWithCounts[] }>("/categories?type=course&status=active");
  return result.ok ? result.data?.data ?? [] : [];
}

export async function getTagCountsByCategory(): Promise<TagWithCategoryCounts[]> {
  const result = await beFetch<{ data: TagWithCategoryCounts[] }>("/admin/course-menu/tag-counts");
  return result.ok ? result.data?.data ?? [] : [];
}

export async function getTagCountsByLevel(): Promise<any[]> {
  return getTagCountsByCategory();
}

async function mutation(url: string, method: string, body?: unknown) {
  const result = await beFetch(url, {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!result.ok) {
    return { ok: false, message: result.error ?? "Không thể cập nhật menu" };
  }
  revalidatePath(path);
  return { ok: true, message: "Đã cập nhật menu" };
}

export async function createMenuItem(input: Partial<CourseMenuItem>) {
  return mutation("/admin/course-menu", "POST", input);
}

export async function updateMenuItem(id: string, input: Partial<CourseMenuItem>) {
  return mutation(`/admin/course-menu/${id}`, "PATCH", input);
}

export async function deleteMenuItem(id: string) {
  return mutation(`/admin/course-menu/${id}`, "DELETE");
}

export async function reorderMenuItems(items: { id: string; sortOrder: number }[]) {
  return mutation("/admin/course-menu/reorder", "PUT", { items });
}

export async function seedCourseMenu() {
  return mutation("/admin/course-menu/seed-default", "POST");
}
