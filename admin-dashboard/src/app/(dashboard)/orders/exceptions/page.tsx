import type { Metadata } from "next";
import Link from "next/link";
import { AdminFetchError } from "@/components/Layouts/admin-fetch-error";
import { AdminPageHeader, AdminPanel } from "@/components/Layouts/admin-surface";
import {
  fetchPaymentExceptions,
  type PaymentExceptionType,
} from "../actions";
import { ResolveExceptionButton } from "./resolve-exception-button";

export const metadata: Metadata = {
  title: "Ngoại lệ thanh toán",
};

type TypeFilter = PaymentExceptionType | "all";
type ResolvedFilter = "all" | "true" | "false";

type ExceptionsPageProps = {
  searchParams: Promise<{
    page?: string;
    type?: string;
    resolved?: string;
  }>;
};

const TYPE_LABELS: Record<TypeFilter, string> = {
  all: "Tất cả loại",
  amount_mismatch: "Sai số tiền",
  txn_ref_not_found: "Không tìm thấy mã GD",
  txn_ref_mismatch: "Sai mã GD",
  txn_not_found: "Không tìm thấy giao dịch",
};

const RESOLVED_LABELS: Record<ResolvedFilter, string> = {
  all: "Tất cả",
  false: "Chưa xử lý",
  true: "Đã xử lý",
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

function formatMoney(amount: number | null) {
  if (amount === null || amount === undefined) return "—";
  return `${amount.toLocaleString("vi-VN")} đ`;
}

function parseType(raw?: string): TypeFilter {
  if (
    raw === "amount_mismatch" ||
    raw === "txn_ref_not_found" ||
    raw === "txn_ref_mismatch" ||
    raw === "txn_not_found"
  ) {
    return raw;
  }
  return "all";
}

function parseResolved(raw?: string): ResolvedFilter {
  if (raw === "true" || raw === "false") return raw;
  return "all";
}

function buildHref(opts: {
  page?: number;
  type?: TypeFilter;
  resolved?: ResolvedFilter;
}) {
  const params = new URLSearchParams();
  if (opts.page && opts.page > 1) params.set("page", String(opts.page));
  if (opts.type && opts.type !== "all") params.set("type", opts.type);
  if (opts.resolved && opts.resolved !== "all")
    params.set("resolved", opts.resolved);
  const qs = params.toString();
  return qs ? `/orders/exceptions?${qs}` : "/orders/exceptions";
}

export default async function OrderExceptionsPage({
  searchParams,
}: ExceptionsPageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const type = parseType(params.type);
  // Default view: show unresolved exceptions unless explicitly filtered.
  const resolved = parseResolved(params.resolved);

  const { data, pagination, error } = await fetchPaymentExceptions({
    page,
    limit: 20,
    type,
    resolved: params.resolved ? resolved : "false",
  });

  const effectiveResolved = params.resolved ? resolved : "false";
  const retryHref = buildHref({ page, type, resolved: effectiveResolved });

  const typeFilters: TypeFilter[] = [
    "all",
    "amount_mismatch",
    "txn_ref_not_found",
    "txn_ref_mismatch",
    "txn_not_found",
  ];
  const resolvedFilters: ResolvedFilter[] = ["false", "true", "all"];

  return (
    <div className="space-y-4">
      <AdminPageHeader
        eyebrow="Thanh toán"
        title="Ngoại lệ thanh toán"
        description="Các trường hợp sai lệch số tiền hoặc mã giao dịch cần đối chiếu thủ công."
      />

      <div className="flex items-center justify-between">
        <Link
          href="/orders"
          className="text-sm font-medium text-[#0070EB] hover:underline"
        >
          ← Quay lại danh sách đơn hàng
        </Link>
      </div>

      {error ? <AdminFetchError message={error} retryHref={retryHref} /> : null}

      <AdminPanel
        title="Danh sách ngoại lệ"
        description="Lọc theo loại lỗi hoặc trạng thái xử lý."
        bodyClassName="p-0"
      >
        <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {resolvedFilters.map((key) => {
              const active = effectiveResolved === key;
              return (
                <Link
                  key={key}
                  href={buildHref({ type, resolved: key })}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    active
                      ? "bg-[#0070EB] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  }`}
                >
                  {RESOLVED_LABELS[key]}
                </Link>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-2">
            {typeFilters.map((key) => {
              const active = type === key;
              return (
                <Link
                  key={key}
                  href={buildHref({ type: key, resolved: effectiveResolved })}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    active
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  }`}
                >
                  {TYPE_LABELS[key]}
                </Link>
              );
            })}
          </div>
        </div>

        {error ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Không hiển thị danh sách vì lỗi tải dữ liệu.
          </div>
        ) : data.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Không có ngoại lệ nào phù hợp với bộ lọc.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">Thời gian</th>
                  <th className="px-4 py-3 font-semibold">Loại lỗi</th>
                  <th className="px-4 py-3 font-semibold">Khách hàng</th>
                  <th className="px-4 py-3 font-semibold">Mã GD</th>
                  <th className="px-4 py-3 font-semibold">Kỳ vọng</th>
                  <th className="px-4 py-3 font-semibold">Thực tế</th>
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
                      {formatDate(row.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 ring-1 ring-inset ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-300">
                        {TYPE_LABELS[row.type]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-950 dark:text-white">
                        {row.orderCustomerName || "—"}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {row.orderCustomerEmail || "—"}
                      </div>
                      {row.orderId ? (
                        <Link
                          href={`/orders/${row.orderId}`}
                          className="text-xs font-medium text-[#0070EB] hover:underline"
                        >
                          Xem đơn hàng
                        </Link>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-300">
                      {row.txnRef || "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600 dark:text-slate-300">
                      {formatMoney(row.expectedAmount ?? row.orderTotalAmount)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600 dark:text-slate-300">
                      {formatMoney(row.actualAmount)}
                    </td>
                    <td className="px-4 py-3">
                      {row.resolved ? (
                        <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                          Đã xử lý
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300">
                          Chưa xử lý
                        </span>
                      )}
                      {row.resolutionNote ? (
                        <div className="mt-1 max-w-[220px] text-xs text-slate-500 dark:text-slate-400">
                          {row.resolutionNote}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {row.resolved ? null : (
                        <ResolveExceptionButton exceptionId={row.id} />
                      )}
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
              href={buildHref({ page: page - 1, type, resolved: effectiveResolved })}
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
              href={buildHref({ page: page + 1, type, resolved: effectiveResolved })}
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
