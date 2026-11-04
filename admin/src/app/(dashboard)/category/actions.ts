"use server";

import { beFetch } from "@/lib/api/server";
import type {
  CategoryListResponse,
  CategoryType,
  CategoryWithCounts,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/lib/api/types";
import { revalidatePath } from "next/cache";

function mapActionError(
  result: { status: number; ok: boolean; error?: string },
  fallback: string,
): string {
  if (result.status === 401) return "Phiên đăng nhập đã hết hạn";
  if (result.status === 403) return "Bạn không có quyền thực hiện thao tác này";
  if (result.status === 409) {
    return "Danh mục đang được sử dụng. Hãy chuyển nội dung sang danh mục khác trước khi xóa.";
  }
  return result.error ?? fallback;
}

function revalidateCategoryPaths(type: CategoryType) {
  revalidatePath("/course/category");
  revalidatePath("/post/category");
  if (type === "course") {
    revalidatePath("/course");
    revalidatePath("/course/new");
  } else {
    revalidatePath("/post");
    revalidatePath("/post/new");
  }
}

export async function fetchCategories(
  type: CategoryType,
  status?: "active" | "inactive",
): Promise<CategoryWithCounts[]> {
  const params = new URLSearchParams({ type });
  if (status) params.set("status", status);

  const result = await beFetch<CategoryListResponse>(
    `/categories?${params.toString()}`,
  );

  if (!result.ok || !result.data?.data) return [];
  return result.data.data;
}

export async function createCategory(
  input: CreateCategoryInput,
): Promise<{ ok: boolean; message: string; category?: CategoryWithCounts }> {
  const result = await beFetch<{ category: CategoryWithCounts }>(
    "/categories",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );

  if (!result.ok || !result.data?.category) {
    return {
      ok: false,
      message: mapActionError(result, "Tạo danh mục thất bại"),
    };
  }

  revalidateCategoryPaths(input.type);
  return {
    ok: true,
    message: "Tạo danh mục thành công",
    category: result.data.category,
  };
}

export async function updateCategory(
  id: string,
  type: CategoryType,
  input: UpdateCategoryInput,
): Promise<{ ok: boolean; message: string }> {
  const result = await beFetch<{ category: CategoryWithCounts }>(
    `/categories/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );

  if (!result.ok) {
    return {
      ok: false,
      message: mapActionError(result, "Cập nhật danh mục thất bại"),
    };
  }

  revalidateCategoryPaths(type);
  return { ok: true, message: "Cập nhật danh mục thành công" };
}

export async function deleteCategory(
  id: string,
  type: CategoryType,
): Promise<{ ok: boolean; message: string }> {
  const result = await beFetch(`/categories/${id}`, { method: "DELETE" });

  if (!result.ok) {
    return {
      ok: false,
      message: mapActionError(result, "Xóa danh mục thất bại"),
    };
  }

  revalidateCategoryPaths(type);
  return { ok: true, message: "Xóa danh mục thành công" };
}

export async function reorderCategories(
  type: CategoryType,
  items: { id: string; sortOrder: number }[],
): Promise<{ ok: boolean; message: string }> {
  const result = await beFetch("/categories/reorder", {
    method: "PUT",
    body: JSON.stringify({ type, items }),
  });

  if (!result.ok) {
    return {
      ok: false,
      message: mapActionError(result, "Sắp xếp danh mục thất bại"),
    };
  }

  revalidateCategoryPaths(type);
  return { ok: true, message: "Cập nhật thứ tự thành công" };
}
