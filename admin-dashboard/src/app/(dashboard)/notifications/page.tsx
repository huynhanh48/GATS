import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader, AdminPanel } from "@/components/Layouts/admin-surface";
import { ComposeNotificationForm } from "./compose-notification-form";
import { fetchNotifications, type NotificationSource } from "./actions";

export const metadata: Metadata = {
  title: "Thông báo",
};

type SourceFilter = NotificationSource | "all";

type PageProps = {
  searchParams: Promise<{ page?: string; source?: string }>;
};

const TYPE_LABELS: Record<string, string> = {
  lead_created: "Tư vấn",
  course_created: "Khóa học",
  post_created: "Bài viết",
  post_published: "Xuất bản",
  order_paid: "Thanh toán",
  admin_broadcast: "Thông báo chung",
};

const SOURCE_LABELS: Record<SourceFilter, string> = {
  all: "Tất cả",
  system: "Hệ thống",
  admin: "Đã gửi (composer)",
};

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString("vi-VN", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return value;
  }
}

function parseSource(raw?: string): SourceFilter {
  if (raw === "system" || raw === "admin") return raw;
  return "all";
}

function buildHref(opts: { page?: number; source?: SourceFilter }) {
  const params = new URLSearchParams();
  if (opts.page && opts.page > 1) params.set("page", String(opts.page));
  if (opts.source && opts.source !== "all") params.set("source", opts.source);
  const qs = params.toString();
  return qs ? `/notifications?${qs}` : "/notifications";
}

export default async function NotificationsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const source = parseSource(params.source);
  const { data, pagination, unreadCount } = await fetchNotifications({
    page,
    limit: 30,
    source,
  });

  const sourceFilters: SourceFilter[] = ["all", "system", "admin"];

  return (
    <div className="space-y-4">
      <AdminPageHeader
        eyebrow="Hệ thống"
        title="Thông báo"
        description="Nhật ký sự kiện tự động và thông báo do quản trị viên gửi đi."
        metrics={[
          { label: "Chưa đọc", value: unreadCount, tone: "orange" },
          { label: "Đang hiển thị", value: data.length, tone: "blue" },
          { label: "Tổng", value: pagination.total, tone: "slate" },
        ]}
      />

      <AdminPanel
        title="Soạn thông báo"
        description="Gửi thông báo broadcast tới toàn bộ quản trị viên. Sẽ xuất hiện trong log gửi bên dưới."
        bodyClassName="p-0"
      >
        <ComposeNotificationForm />
      </AdminPanel>

      <AdminPanel
        title="Nhật ký thông báo"
        description="Click vào một dòng để mở đối tượng liên quan."
        bodyClassName="p-0"
      >
        <div className="flex flex-wrap gap-2 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          {sourceFilters.map((key) => {
            const active = source === key;
            return (
              <Link
                key={key}
                href={buildHref({ source: key })}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  active
                    ? "bg-[#0070EB] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                {SOURCE_LABELS[key]}
              </Link>
            );
          })}
        </div>

        {data.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Chưa có thông báo nào ở bộ lọc này.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href || "#"}
                  className={`flex flex-col gap-1 px-4 py-3 transition hover:bg-slate-50 dark:hover:bg-slate-900/50 sm:flex-row sm:items-start sm:justify-between ${
                    !item.isRead ? "bg-blue-50/40 dark:bg-blue-950/10" : ""
                  }`}
                >
                  <div className="min-w-0">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {TYPE_LABELS[item.type] ?? item.type}
                      </span>
                      {item.source === "admin" ? (
                        <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-purple-700 dark:bg-purple-500/10 dark:text-purple-300">
                          {item.audienceLabel || "Đã gửi"}
                        </span>
                      ) : null}
                      {!item.isRead ? (
                        <span className="text-[10px] font-semibold text-[#0070EB]">
                          Mới
                        </span>
                      ) : null}
                    </div>
                    <p className="font-semibold text-slate-950 dark:text-white">
                      {item.title}
                    </p>
                    {item.body ? (
                      <p className="mt-0.5 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                        {item.body}
                      </p>
                    ) : null}
                  </div>
                  <time className="shrink-0 text-xs text-slate-400 sm:pt-1">
                    {formatDate(item.createdAt)}
                  </time>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </AdminPanel>

      {pagination.totalPages > 1 ? (
        <div className="flex items-center justify-end gap-2 text-sm">
          {page > 1 ? (
            <Link
              href={buildHref({ page: page - 1, source })}
              className="rounded-md border border-slate-200 px-3 py-1.5 hover:bg-slate-50 dark:border-slate-700"
            >
              Trước
            </Link>
          ) : null}
          <span className="text-slate-500">
            {page} / {pagination.totalPages}
          </span>
          {page < pagination.totalPages ? (
            <Link
              href={buildHref({ page: page + 1, source })}
              className="rounded-md border border-slate-200 px-3 py-1.5 hover:bg-slate-50 dark:border-slate-700"
            >
              Sau
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
