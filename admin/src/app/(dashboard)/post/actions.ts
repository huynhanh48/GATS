"use server";

import { beFetch } from "@/lib/api/server";
import type {
  CreatePostInput,
  PostDetail,
  PostListItem,
  PostListResponse,
  UpdatePostInput,
} from "@/lib/api/types";
import { revalidatePath } from "next/cache";

function mapActionError(
  result: { status: number; ok: boolean; error?: string },
  fallback: string,
): string {
  if (result.status === 401) return "Phiên đăng nhập đã hết hạn";
  if (result.status === 403) return "Bạn không có quyền thực hiện thao tác này";
  return result.error ?? fallback;
}

function revalidatePostPaths(id?: string) {
  revalidatePath("/post");
  revalidatePath("/post/trash");
  if (id) {
    revalidatePath(`/post/${id}/edit`);
  }
}

export async function fetchPosts(
  page = 1,
  limit = 10,
  options: {
    deleted?: "without" | "with" | "only";
    status?: string;
  } = {},
): Promise<PostListResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (options.deleted) {
    params.set("deleted", options.deleted);
  }
  if (options.status) {
    params.set("status", options.status);
  }

  const result = await beFetch<PostListResponse>(`/posts?${params.toString()}`);

  if (!result.ok || !result.data) {
    return {
      data: [],
      pagination: {
        skip: 0,
        take: limit,
        total: 0,
        hasMore: false,
        page: 1,
        totalPages: 0,
      },
    };
  }

  return result.data;
}

export async function fetchTrashPosts(
  page = 1,
  limit = 10,
): Promise<PostListResponse> {
  return fetchPosts(page, limit, { deleted: "only" });
}

export async function getPostDetail(id: string): Promise<PostDetail | null> {
  const result = await beFetch<{ post: PostDetail }>(`/posts/${id}`);
  if (!result.ok || !result.data?.post) return null;
  return result.data.post;
}

export async function createPost(
  input: CreatePostInput,
): Promise<{ ok: boolean; message: string; postId?: string }> {
  const result = await beFetch<{ post: { id: string } }>("/posts", {
    method: "POST",
    body: JSON.stringify(input),
  });

  if (!result.ok || !result.data?.post?.id) {
    return {
      ok: false,
      message: mapActionError(result, "Tạo bài viết thất bại"),
    };
  }

  revalidatePostPaths(result.data.post.id);
  return {
    ok: true,
    message: "Tạo bài viết thành công",
    postId: result.data.post.id,
  };
}

export async function updatePost(
  id: string,
  input: UpdatePostInput,
): Promise<{ ok: boolean; message: string }> {
  const result = await beFetch<{ post: PostListItem }>(`/posts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });

  if (!result.ok) {
    return {
      ok: false,
      message: mapActionError(result, "Cập nhật bài viết thất bại"),
    };
  }

  revalidatePostPaths(id);
  return { ok: true, message: "Cập nhật bài viết thành công" };
}

export async function publishPost(
  id: string,
): Promise<{ ok: boolean; message: string }> {
  const result = await beFetch(`/posts/${id}/publish`, { method: "PATCH" });

  if (!result.ok) {
    return {
      ok: false,
      message: mapActionError(result, "Xuất bản bài viết thất bại"),
    };
  }

  revalidatePostPaths(id);
  return { ok: true, message: "Xuất bản bài viết thành công" };
}

export async function unpublishPost(
  id: string,
): Promise<{ ok: boolean; message: string }> {
  const result = await beFetch(`/posts/${id}/unpublish`, { method: "PATCH" });

  if (!result.ok) {
    return {
      ok: false,
      message: mapActionError(result, "Gỡ xuất bản thất bại"),
    };
  }

  revalidatePostPaths(id);
  return { ok: true, message: "Đã chuyển bài viết về bản nháp" };
}

export async function deletePost(
  id: string,
): Promise<{ ok: boolean; message: string }> {
  const result = await beFetch(`/posts/${id}`, { method: "DELETE" });

  if (!result.ok) {
    return {
      ok: false,
      message: mapActionError(result, "Xóa bài viết thất bại"),
    };
  }

  revalidatePostPaths(id);
  return { ok: true, message: "Đã chuyển bài viết vào thùng rác" };
}

export async function deletePosts(
  ids: string[],
): Promise<{ ok: boolean; message: string }> {
  if (ids.length === 0) {
    return { ok: false, message: "Chưa chọn bài viết nào" };
  }

  const results = await Promise.all(
    ids.map((id) => beFetch(`/posts/${id}`, { method: "DELETE" })),
  );
  const failed = results.filter((r) => !r.ok).length;

  revalidatePostPaths();

  if (failed > 0) {
    return {
      ok: false,
      message: `Xóa thất bại ${failed}/${ids.length} bài viết`,
    };
  }

  return {
    ok: true,
    message: `Đã chuyển ${ids.length} bài viết vào thùng rác`,
  };
}

export async function restorePost(
  id: string,
): Promise<{ ok: boolean; message: string }> {
  const result = await beFetch<{ post: PostListItem }>(`/posts/${id}/restore`, {
    method: "POST",
  });

  if (!result.ok) {
    return {
      ok: false,
      message: mapActionError(result, "Khôi phục bài viết thất bại"),
    };
  }

  revalidatePostPaths(id);
  return { ok: true, message: "Khôi phục bài viết thành công" };
}

export async function restorePosts(
  ids: string[],
): Promise<{ ok: boolean; message: string }> {
  if (ids.length === 0) {
    return { ok: false, message: "Chưa chọn bài viết nào" };
  }

  const results = await Promise.all(
    ids.map((id) =>
      beFetch<{ post: PostListItem }>(`/posts/${id}/restore`, {
        method: "POST",
      }),
    ),
  );
  const failed = results.filter((r) => !r.ok).length;

  revalidatePostPaths();

  if (failed > 0) {
    return {
      ok: false,
      message: `Khôi phục thất bại ${failed}/${ids.length} bài viết`,
    };
  }

  return {
    ok: true,
    message: `Đã khôi phục ${ids.length} bài viết`,
  };
}

export async function permanentlyDeletePost(
  id: string,
): Promise<{ ok: boolean; message: string }> {
  const result = await beFetch(`/posts/${id}?mode=hard`, {
    method: "DELETE",
  });

  if (!result.ok) {
    return {
      ok: false,
      message: mapActionError(result, "Xóa vĩnh viễn thất bại"),
    };
  }

  revalidatePostPaths();
  return { ok: true, message: "Đã xóa vĩnh viễn bài viết" };
}

export async function permanentlyDeletePosts(
  ids: string[],
): Promise<{ ok: boolean; message: string }> {
  if (ids.length === 0) {
    return { ok: false, message: "Chưa chọn bài viết nào" };
  }

  const results = await Promise.all(
    ids.map((id) => beFetch(`/posts/${id}?mode=hard`, { method: "DELETE" })),
  );
  const failed = results.filter((r) => !r.ok).length;

  revalidatePostPaths();

  if (failed > 0) {
    return {
      ok: false,
      message: `Xóa vĩnh viễn thất bại ${failed}/${ids.length} bài viết`,
    };
  }

  return {
    ok: true,
    message: `Đã xóa vĩnh viễn ${ids.length} bài viết`,
  };
}
