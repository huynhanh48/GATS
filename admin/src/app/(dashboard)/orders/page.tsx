import type { Metadata } from "next";
import Link from "next/link";
import { AdminFetchError } from "@/components/Layouts/admin-fetch-error";
import { AdminPageHeader, AdminPanel } from "@/components/Layouts/admin-surface";
import { formatVnDateTime } from "@/lib/datetime";
import { fetchOrders, type OrderStatus } from "./actions";
import { ExpireStaleButton } from "./expire-stale-button";

export const metadata: Metadata = {
  title: "Quản lý thanh toán",
};

type FilterKey = OrderStatus | "all" | "expired";

type OrdersPageProps = {
  searchParams: Promise<{
    page?: string;
    status?: string;
    q?: string;
  }>;
};

const STATUS_LABELS: Record<FilterKey, string> = {
  all: "Tất cả",
  pending: "Chờ thanh toán",
  paid: "Đã thanh toán",
  cancelled: "Đã hủy",
  refund_pending: "Chờ hoàn tiền",
  refunded: "Đã hoàn tiền",
  expired: "Pending quá hạn",
};

const STATUS_BADGE: Record<OrderStatus, string> = {
  pending:
    "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300",
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300",
  cancelled:
    "bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-800 dark:text-slate-300",
  refund_pending:
    "bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-500/10 dark:text-orange-300",
  refunded:
    "bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-300",
};

function formatDate(value: string) {
  return formatVnDateTime(value);
}

function formatMoney(amount: number) {
  return `${amount.toLocaleString("vi-VN")} đ`;
}

function parseStatus(raw?: string): FilterKey {
  if (
    raw === "pending" ||
    raw === "paid" ||
    raw === "cancelled" ||
    raw === "refund_pending" ||
    raw === "refunded" ||
    raw === "expired"
  ) {
    return raw;
  }
  return "all";
}

function buildHref(opts: {
  page?: number;
  status?: FilterKey;
  q?: string;
}) {
  const params = new URLSearchParams();
  if (opts.page && opts.page > 1) params.set("page", String(opts.page));
  if (opts.status && opts.status !== "all") params.set("status", opts.status);
  if (opts.q?.trim()) params.set("q", opts.q.trim());
  const qs = params.toString();
  return qs ? `/orders?${qs}` : "/orders";
}

/** CSV export only supports real order statuses (BE-side "expired" is a virtual filter). */
function buildCsvExportHref(status: FilterKey, q: string) {
  const params = new URLSearchParams();
  if (status !== "all" && status !== "expired") params.set("status", status);
  if (q.trim()) params.set("q", q.trim());
  const qs = params.toString();
  return `/api/be/orders/admin/export.csv${qs ? `?${qs}` : ""}`;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const status = parseStatus(params.status);
  const q = params.q?.trim() ?? "";

  const { data, pagination, counts, error } = await fetchOrders({
    page,
    limit: 20,
    status,
    q,
  });

  const filters: FilterKey[] = [
    "all",
    "pending",
    "paid",
    "cancelled",
    "refund_pending",
    "refunded",
    "expired",
  ];

  const expiredCount = counts.expiredPending ?? 0;
  const retryHref = buildHref({ page, status, q });

  return (
    <div className="space-y-4">
      <AdminPageHeader
        eyebrow="Thanh toán"
        title="Quản lý đơn hàng"
        description="Theo dõi tình trạng thanh toán, xác nhận chuyển khoản và hoàn tiền."
        metrics={[
          { label: "Tổng đơn", value: counts.all, tone: "slate" },
          { label: "Chờ TT", value: counts.pending, tone: "blue" },
          { label: "Đã TT", value: counts.paid, tone: "green" },
        ]}
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          href="/orders/exceptions"
          className="text-sm font-medium text-rose-600 hover:underline dark:text-rose-400"
        >
          Xem ngoại lệ thanh toán →
        </Link>
        <a
          href={buildCsvExportHref(status, q)}
          download
          className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
        >
          Xuất CSV
        </a>
      </div>

      {error ? <AdminFetchError message={error} retryHref={retryHref} /> : null}

      <AdminPanel
        title="Đơn hàng"
        description="Lọc theo trạng thái hoặc tìm theo email, SĐT, mã GD."
        bodyClassName="p-0"
      >
        <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {filters.map((key) => {
              const active = status === key;
              const count =
                key === "all"
                  ? counts.all
                  : key === "expired"
                    ? expiredCount
                    : (counts[key as OrderStatus] ?? 0);
              return (
                <Link
                  key={key}
                  href={buildHref({ status: key, q })}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    active
                      ? "bg-[#0070EB] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  }`}
                >
                  {STATUS_LABELS[key]} ({count})
                </Link>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ExpireStaleButton count={expiredCount} />
            <form className="flex gap-2" action="/orders" method="get">
              {status !== "all" ? (
                <input type="hidden" name="status" value={status} />
              ) : null}
              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder="Tìm email, SĐT, mã GD…"
                className="w-full min-w-[200px] rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-[#0070EB] dark:border-slate-700 dark:bg-slate-950 sm:w-64"
              />
              <button
                type="submit"
                className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
              >
                Tìm
              </button>
            </form>
          </div>
        </div>

        {error ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Không hiển thị danh sách vì lỗi tải dữ liệu.
          </div>
        ) : data.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Chưa có đơn hàng nào{status !== "all" ? ` ở trạng thái này` : ""}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">Thời gian</th>
                  <th className="px-4 py-3 font-semibold">Khách hàng</th>
                  <th className="px-4 py-3 font-semibold">Khóa học</th>
                  <th className="px-4 py-3 font-semibold">Số tiền</th>
                  <th className="px-4 py-3 font-semibold">Mã GD</th>
                  <th className="px-4 py-3 font-semibold">Trạng thái</th>
                  <th className="px-4 py-3 font-semibold" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.map((order) => (
                  <tr
                    key={order.id}
                    className="align-top hover:bg-slate-50/80 dark:hover:bg-slate-900/40"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500 dark:text-slate-400">
                      {formatDate(order.createdAt)}
                      {order.isExpiredPending ? (
                        <div className="text-xs text-amber-600">Quá hạn</div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-950 dark:text-white">
                        {order.customerName || order.userName || "—"}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {order.customerEmail || order.userEmail || "—"}
                      </div>
                      {order.customerPhone ? (
                        <div className="text-xs text-slate-500">
                          {order.customerPhone}
                        </div>
                      ) : null}
                    </td>
                    <td className="max-w-xs px-4 py-3 text-slate-600 dark:text-slate-300">
                      {order.items.length === 0 ? (
                        "—"
                      ) : (
                        <ul className="space-y-0.5">
                          {order.items.map((item) => (
                            <li key={item.id} className="line-clamp-1">
                              {item.courseName}
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-950 dark:text-white">
                      {formatMoney(order.totalAmount)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-300">
                      {order.txnRef || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_BADGE[order.status]}`}
                      >
                        {STATUS_LABELS[order.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/orders/${order.id}`}
                        className="text-sm font-medium text-[#0070EB] hover:underline"
                      >
                        Chi tiết
                      </Link>
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
              href={buildHref({ page: page - 1, status, q })}
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
              href={buildHref({ page: page + 1, status, q })}
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
