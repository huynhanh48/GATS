import type { Metadata } from "next";
import Link from "next/link";
import { AdminFetchError } from "@/components/Layouts/admin-fetch-error";
import { AdminPageHeader, AdminPanel } from "@/components/Layouts/admin-surface";
import { formatVnDateTime } from "@/lib/datetime";
import { fetchModerationQueue, type CommentStatus } from "./actions";
import { CommentStatusActions } from "./comment-status-actions";

export const metadata: Metadata = {
  title: "Kiểm duyệt bình luận",
};

type StatusFilter = CommentStatus | "all";

type PageProps = {
  searchParams: Promise<{ page?: string; status?: string }>;
};

const STATUS_LABELS: Record<StatusFilter, string> = {
  all: "Cần xem lại (ẩn + đã xóa)",
  visible: "Đang hiển thị",
  hidden: "Đã ẩn",
  deleted: "Đã xóa",
};

const STATUS_BADGE: Record<CommentStatus, string> = {
  visible:
    "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300",
  hidden:
    "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300",
  deleted:
    "bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-300",
};

function formatDate(value: string) {
  return formatVnDateTime(value);
}

function parseStatus(raw?: string): StatusFilter {
  if (raw === "visible" || raw === "hidden" || raw === "deleted") return raw;
  return "all";
}

function buildHref(opts: { page?: number; status?: StatusFilter }) {
  const params = new URLSearchParams();
  if (opts.page && opts.page > 1) params.set("page", String(opts.page));
  if (opts.status && opts.status !== "all") params.set("status", opts.status);
  const qs = params.toString();
  return qs ? `/moderation?${qs}` : "/moderation";
}

export default async function ModerationPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const status = parseStatus(params.status);

  const { data, pagination, counts, error } = await fetchModerationQueue({
    page,
    limit: 20,
    status,
  });

  const retryHref = buildHref({ page, status });
  const statusFilters: StatusFilter[] = ["all", "hidden", "deleted", "visible"];

  return (
    <div className="space-y-4">
      <AdminPageHeader
        eyebrow="Nội dung"
        title="Kiểm duyệt bình luận"
        description="Duyệt lại các bình luận đã bị ẩn hoặc xóa, khôi phục nếu cần."
        metrics={[
          { label: "Tổng bình luận", value: counts.all, tone: "slate" },
          { label: "Đã ẩn", value: counts.hidden, tone: "orange" },
          { label: "Đã xóa", value: counts.deleted, tone: "orange" },
        ]}
      />

      {error ? <AdminFetchError message={error} retryHref={retryHref} /> : null}

      <AdminPanel
        title="Hàng đợi kiểm duyệt"
        description="Mặc định chỉ hiện các bình luận cần xem lại (ẩn/đã xóa)."
        bodyClassName="p-0"
      >
        <div className="flex flex-wrap gap-2 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          {statusFilters.map((key) => {
            const active = status === key;
            return (
              <Link
                key={key}
                href={buildHref({ status: key })}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  active
                    ? "bg-[#0070EB] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                {STATUS_LABELS[key]}
              </Link>
            );
          })}
        </div>

        {error ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Không hiển thị danh sách vì lỗi tải dữ liệu.
          </div>
        ) : data.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Không có bình luận nào cần xem lại.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">Thời gian</th>
                  <th className="px-4 py-3 font-semibold">Tác giả</th>
                  <th className="px-4 py-3 font-semibold">Nội dung</th>
                  <th className="px-4 py-3 font-semibold">Bài viết</th>
                  <th className="px-4 py-3 font-semibold">Trạng thái</th>
                  <th className="px-4 py-3 font-semibold" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.map((row) => (
                  <tr
                    key={row.id}
                    className="align-top hover:bg-slate-50/80 dark:hover:bg-slate-900/40"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500 dark:text-slate-400">
                      {formatDate(row.updatedAt)}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-950 dark:text-white">
                      {row.authorUserName || `#${row.authorId}`}
                    </td>
                    <td className="max-w-md px-4 py-3 text-slate-600 dark:text-slate-300">
                      <p className="line-clamp-3">{row.content}</p>
                      {row.likeCount > 0 ? (
                        <span className="text-xs text-slate-400">
                          {row.likeCount} lượt thích
                        </span>
                      ) : null}
                    </td>
                    <td className="max-w-xs px-4 py-3 text-slate-600 dark:text-slate-300">
                      <Link
                        href={`/post/${row.postId}/edit`}
                        className="line-clamp-2 hover:underline"
                      >
                        {row.postTitle || row.postId}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_BADGE[row.status]}`}
                      >
                        {STATUS_LABELS[row.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <CommentStatusActions commentId={row.id} status={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminPanel>

      {pagination.totalPages > 1 ? (
        <div className="flex items-center justify-end gap-2 text-sm">
          {page > 1 ? (
            <Link
              href={buildHref({ page: page - 1, status })}
              className="rounded-md border border-slate-200 px-3 py-1.5 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-900"
            >
              Trước
            </Link>
          ) : null}
          <span className="text-slate-500">
            {page} / {pagination.totalPages}
          </span>
          {page < pagination.totalPages ? (
            <Link
              href={buildHref({ page: page + 1, status })}
              className="rounded-md border border-slate-200 px-3 py-1.5 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-900"
            >
              Sau
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
