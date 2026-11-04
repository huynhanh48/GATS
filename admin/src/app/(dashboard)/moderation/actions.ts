"use server";

import { revalidatePath } from "next/cache";
import { beFetch } from "@/lib/api/server";

export type CommentStatus = "visible" | "hidden" | "deleted";

export type ModerationQueueRow = {
  id: string;
  postId: string;
  postTitle: string | null;
  parentId: string | null;
  content: string;
  status: CommentStatus;
  createdAt: string;
  updatedAt: string;
  authorId: number;
  authorUserName: string | null;
  likeCount: number;
};

export type ModerationCounts = Record<CommentStatus, number> & { all: number };

export type ModerationQueueResponse = {
  data: ModerationQueueRow[];
  counts: ModerationCounts;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
  error?: string | null;
};

const emptyCounts: ModerationCounts = {
  visible: 0,
  hidden: 0,
  deleted: 0,
  all: 0,
};

function emptyResponse(limit: number, error?: string | null): ModerationQueueResponse {
  return {
    data: [],
    counts: emptyCounts,
    pagination: { page: 1, limit, total: 0, totalPages: 0, hasMore: false },
    error: error ?? null,
  };
}

export async function fetchModerationQueue(options: {
  page?: number;
  limit?: number;
  status?: CommentStatus | "all";
}): Promise<ModerationQueueResponse> {
  const page = options.page ?? 1;
  const limit = options.limit ?? 20;
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (options.status && options.status !== "all") {
    params.set("status", options.status);
  }

  const result = await beFetch<ModerationQueueResponse>(
    `/moderation/comments?${params.toString()}`,
  );

  if (!result.ok || !result.data) {
    return emptyResponse(
      limit,
      result.error ?? "Không tải được hàng đợi kiểm duyệt",
    );
  }

  return { ...result.data, error: null };
}

export async function updateCommentStatus(
  commentId: string,
  status: CommentStatus,
): Promise<{ ok: boolean; message?: string }> {
  const result = await beFetch<{ message?: string }>(
    `/moderation/comments/${commentId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
  );

  if (!result.ok) {
    return { ok: false, message: result.error ?? "Cập nhật thất bại" };
  }

  revalidatePath("/moderation");
  return { ok: true, message: result.data?.message };
}
