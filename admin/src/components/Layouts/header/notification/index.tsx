"use client";

import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { useIsMobile } from "@/hooks/use-mobile";
import { apiRequest } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { BellIcon } from "./icons";

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  href: string | null;
  entityId: string | null;
  isRead: boolean;
  createdAt: string;
};

type NotificationsResponse = {
  data: NotificationItem[];
  pagination: { total: number };
  unreadCount: number;
};

const TYPE_LABELS: Record<string, string> = {
  lead_created: "Tư vấn",
  course_created: "Khóa học",
  post_created: "Bài viết",
  post_published: "Xuất bản",
  order_paid: "Thanh toán",
  admin_broadcast: "Thông báo chung",
};

function formatRelative(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}

export function Notification() {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    const res = await apiRequest<NotificationsResponse>({
      url: "/notifications?page=1&limit=12",
      method: "GET",
    });
    if (res.data?.data) {
      setItems(res.data.data);
      setUnreadCount(res.data.unreadCount ?? 0);
    } else {
      setItems([]);
      setUnreadCount(0);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadNotifications();
    const timer = setInterval(() => {
      void loadNotifications();
    }, 60_000);
    return () => clearInterval(timer);
  }, [loadNotifications]);

  const markAllRead = useCallback(async () => {
    await apiRequest({
      url: "/notifications/read",
      method: "POST",
      data: {},
    });
    setUnreadCount(0);
    setItems((prev) => prev.map((item) => ({ ...item, isRead: true })));
  }, []);

  return (
    <Dropdown
      isOpen={isOpen}
      setIsOpen={(open) => {
        setIsOpen(open);
        if (open) {
          void (async () => {
            await loadNotifications();
            await markAllRead();
          })();
        }
      }}
    >
      <DropdownTrigger
        className="grid size-12 cursor-pointer place-items-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 outline-none transition hover:border-[#0070EB]/40 hover:text-[#0070EB] focus-visible:border-[#0070EB] focus-visible:text-[#0070EB] dark:border-slate-700 dark:bg-[#0f172a] dark:text-slate-200 dark:hover:bg-white/10"
        aria-label="View Notifications"
      >
        <span className="relative">
          <BellIcon />

          {unreadCount > 0 ? (
            <span
              className={cn(
                "absolute -top-0.5 -right-0.5 z-1 flex min-w-4 items-center justify-center rounded-full bg-[#FF7622] px-1 text-[10px] font-bold leading-4 text-white ring-2 ring-white dark:ring-[#0f172a]",
              )}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </span>
      </DropdownTrigger>

      <DropdownContent
        align={isMobile ? "end" : "center"}
        className="border border-slate-200 bg-white px-3.5 py-3 shadow-md min-[350px]:min-w-[22rem] dark:border-slate-800 dark:bg-[#0b1220]"
      >
        <div className="mb-1 flex items-center justify-between px-2 py-1.5">
          <span className="text-lg font-bold text-slate-950 dark:text-white">
            Thông báo
          </span>
          {unreadCount > 0 ? (
            <span className="rounded-md bg-[#0070EB] px-2.25 py-0.5 text-xs font-bold text-white">
              {unreadCount} mới
            </span>
          ) : null}
        </div>

        <ul className="mb-3 max-h-92 space-y-1.5 overflow-y-auto">
          {loading ? (
            <li className="px-2 py-6 text-center text-sm text-slate-500">
              Đang tải...
            </li>
          ) : items.length === 0 ? (
            <li className="px-2 py-6 text-center text-sm text-slate-500">
              Chưa có thông báo nào.
            </li>
          ) : (
            items.map((item) => (
              <li key={item.id} role="menuitem">
                <Link
                  href={item.href || "/notifications"}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex flex-col gap-0.5 rounded-lg px-2 py-2 outline-none hover:bg-slate-100 focus-visible:bg-slate-100 dark:hover:bg-slate-800 dark:focus-visible:bg-slate-800",
                    !item.isRead && "bg-blue-50/60 dark:bg-blue-950/20",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {TYPE_LABELS[item.type] ?? item.type}
                    </span>
                    <span className="text-xs text-slate-400">
                      {formatRelative(item.createdAt)}
                    </span>
                  </div>
                  <strong className="block text-sm font-bold text-slate-950 dark:text-white">
                    {item.title}
                  </strong>
                  {item.body ? (
                    <span className="line-clamp-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                      {item.body}
                    </span>
                  ) : null}
                </Link>
              </li>
            ))
          )}
        </ul>

        <Link
          href="/notifications"
          onClick={() => setIsOpen(false)}
          className="block rounded-lg border border-[#0070EB]/30 p-2 text-center text-sm font-bold tracking-wide text-[#0070EB] transition-colors outline-none hover:bg-[#eaf2ff] focus:bg-[#eaf2ff] focus-visible:border-[#0070EB] dark:border-[#0f2742] dark:text-[#7ab8ff] dark:hover:bg-[#0f2742]"
        >
          Xem tất cả
        </Link>
      </DropdownContent>
    </Dropdown>
  );
}
