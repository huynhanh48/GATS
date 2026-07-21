import type { Metadata } from "next";
import Link from "next/link";
import { AdminFetchError } from "@/components/Layouts/admin-fetch-error";
import { AdminPageHeader, AdminPanel } from "@/components/Layouts/admin-surface";
import { fetchLeads, fetchStaffUsers, type LeadStatus } from "./actions";
import { LeadsTable } from "./leads-table";

export const metadata: Metadata = {
  title: "Đăng ký tư vấn",
};

type FilterKey = LeadStatus | "all";

type LeadsPageProps = {
  searchParams: Promise<{ page?: string; status?: string; q?: string }>;
};

const STATUS_LABELS: Record<FilterKey, string> = {
  all: "Tất cả",
  new: "Mới",
  contacted: "Đã liên hệ",
  qualified: "Đủ ĐK",
  converted: "Chuyển đổi",
  lost: "Mất",
  spam: "Spam",
};

function parseStatus(raw?: string): FilterKey {
  if (
    raw === "new" ||
    raw === "contacted" ||
    raw === "qualified" ||
    raw === "converted" ||
    raw === "lost" ||
    raw === "spam"
  ) {
    return raw;
  }
  return "all";
}

function buildHref(opts: { page?: number; status?: FilterKey; q?: string }) {
  const params = new URLSearchParams();
  if (opts.page && opts.page > 1) params.set("page", String(opts.page));
  if (opts.status && opts.status !== "all") params.set("status", opts.status);
  if (opts.q?.trim()) params.set("q", opts.q.trim());
  const qs = params.toString();
  return qs ? `/leads?${qs}` : "/leads";
}

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const status = parseStatus(params.status);
  const q = params.q?.trim() ?? "";

  const [{ data, pagination, counts, error }, staffUsers] = await Promise.all([
    fetchLeads({ page, limit: 20, status, q }),
    fetchStaffUsers(),
  ]);

  const filters: FilterKey[] = [
    "all",
    "new",
    "contacted",
    "qualified",
    "converted",
    "lost",
    "spam",
  ];

  const retryHref = buildHref({ page, status, q });

  return (
    <div className="space-y-4">
      <AdminPageHeader
        eyebrow="CRM"
        title="Đăng ký tư vấn"
        description="Theo dõi và chăm sóc lead từ form tư vấn trên website."
        metrics={[
          { label: "Tổng", value: counts?.all ?? pagination.total, tone: "slate" },
          { label: "Mới", value: counts?.new ?? 0, tone: "blue" },
          { label: "Đang hiển thị", value: data.length, tone: "green" },
        ]}
      />

      {error ? <AdminFetchError message={error} retryHref={retryHref} /> : null}
      <AdminPanel
        title="Tin nhắn đăng ký"
        description="Lọc theo trạng thái, tìm theo tên / SĐT / email."
        bodyClassName="p-0 overflow-x-auto"
      >
        <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {filters.map((key) => {
              const active = status === key;
              const count =
                key === "all"
                  ? (counts?.all ?? pagination.total)
                  : (counts?.[key] ?? 0);
              return (
                <Link
                  key={key}
                  href={buildHref({ status: key, q })}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    active
                      ? "bg-[#0070EB] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {STATUS_LABELS[key]} ({count})
                </Link>
              );
            })}
          </div>
          <form className="flex gap-2" action="/leads" method="get">
            {status !== "all" ? (
              <input type="hidden" name="status" value={status} />
            ) : null}
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Tìm tên, SĐT, email…"
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

        {error ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Không hiển thị danh sách vì lỗi tải dữ liệu.
          </div>
        ) : data.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Chưa có tin nhắn nào{status !== "all" ? " ở trạng thái này" : ""}.
          </div>
        ) : (
          <LeadsTable leads={data} staffUsers={staffUsers} />
        )}
      </AdminPanel>

      {pagination.totalPages > 1 ? (
        <div className="flex items-center justify-end gap-2 text-sm">
          {page > 1 ? (
            <Link
              href={buildHref({ page: page - 1, status, q })}
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
              href={buildHref({ page: page + 1, status, q })}
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
