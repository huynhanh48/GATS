"use server";

import { revalidatePath } from "next/cache";
import { beFetch } from "@/lib/api/server";

export type NotificationSource = "system" | "admin";

export type AdminNotification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  href: string | null;
  entityId: string | null;
  isRead: boolean;
  source: NotificationSource;
  createdByUserId: number | null;
  audienceLabel: string | null;
  createdAt: string;
};

export type NotificationsListResponse = {
  data: AdminNotification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
  unreadCount: number;
};

export async function fetchNotifications(options: {
  page?: number;
  limit?: number;
  source?: NotificationSource | "all";
}): Promise<NotificationsListResponse> {
  const page = options.page ?? 1;
  const limit = options.limit ?? 30;
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (options.source && options.source !== "all") {
    params.set("source", options.source);
  }
  const result = await beFetch<NotificationsListResponse>(
    `/notifications?${params.toString()}`,
  );

  if (!result.ok || !result.data) {
    return {
      data: [],
      pagination: {
        page: 1,
        limit,
        total: 0,
        totalPages: 0,
        hasMore: false,
      },
      unreadCount: 0,
    };
  }

  return result.data;
}

export async function composeNotification(input: {
  title: string;
  body?: string;
  href?: string;
  audienceLabel?: string;
}): Promise<{ ok: boolean; message?: string }> {
  const result = await beFetch<{ message?: string }>(`/notifications/compose`, {
    method: "POST",
    body: JSON.stringify({
      title: input.title.trim(),
      ...(input.body?.trim() ? { body: input.body.trim() } : {}),
      ...(input.href?.trim() ? { href: input.href.trim() } : {}),
      ...(input.audienceLabel?.trim()
        ? { audienceLabel: input.audienceLabel.trim() }
        : {}),
    }),
  });

  if (!result.ok) {
    return { ok: false, message: result.error ?? "Gửi thông báo thất bại" };
  }

  revalidatePath("/notifications");
  return { ok: true, message: result.data?.message };
}
