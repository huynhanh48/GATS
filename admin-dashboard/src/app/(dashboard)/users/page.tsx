import type { Metadata } from "next";
import Link from "next/link";
import { AdminFetchError } from "@/components/Layouts/admin-fetch-error";
import { AdminPageHeader, AdminPanel } from "@/components/Layouts/admin-surface";
import { fetchUsers } from "./actions";

export const metadata: Metadata = {
  title: "Người dùng",
};

type UsersPageProps = {
  searchParams: Promise<{
    page?: string;
    q?: string;
    verified?: string;
    locked?: string;
  }>;
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

function buildHref(opts: {
  page?: number;
  q?: string;
  verified?: string;
  locked?: string;
}) {
  const params = new URLSearchParams();
  if (opts.page && opts.page > 1) params.set("page", String(opts.page));
  if (opts.q?.trim()) params.set("q", opts.q.trim());
  if (opts.verified === "1" || opts.verified === "0") {
    params.set("verified", opts.verified);
  }
  if (opts.locked === "1" || opts.locked === "0") {
    params.set("locked", opts.locked);
  }
  const qs = params.toString();
  return qs ? `/users?${qs}` : "/users";
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const q = params.q?.trim() ?? "";
  const verified =
    params.verified === "1" || params.verified === "0"
      ? params.verified
      : "all";
  const locked =
    params.locked === "1" || params.locked === "0" ? params.locked : "all";

  const { data, pagination, error } = await fetchUsers({
    page,
    limit: 20,
    q,
    verified,
    locked,
  });

  const retryHref = buildHref({ page, q, verified, locked });

  return (
    <div className="space-y-4">
      <AdminPageHeader
        eyebrow="Hệ thống"
        title="Người dùng"
        description="Tìm kiếm, xem hồ sơ và thao tác bảo mật (khóa, reset, thu hồi session)."
        metrics={[
          { label: "Tổng", value: pagination.total, tone: "slate" },
          { label: "Trang", value: page, tone: "blue" },
          { label: "Đang hiển thị", value: data.length, tone: "green" },
        ]}
      />

      {error ? <AdminFetchError message={error} retryHref={retryHref} /> : null}
      <AdminPanel title="Danh sách" bodyClassName="p-0 overflow-x-auto">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2 text-xs">
            <Link
              href={buildHref({ q, locked })}
              className={`rounded-md px-2.5 py-1 font-medium ${verified === "all" ? "bg-[#0070EB] text-white" : "bg-slate-100 text-slate-600"}`}
            >
              Tất cả
            </Link>
            <Link
              href={buildHref({ q, verified: "1", locked })}
              className={`rounded-md px-2.5 py-1 font-medium ${verified === "1" ? "bg-[#0070EB] text-white" : "bg-slate-100 text-slate-600"}`}
            >
              Đã xác minh
            </Link>
            <Link
              href={buildHref({ q, verified: "0", locked })}
              className={`rounded-md px-2.5 py-1 font-medium ${verified === "0" ? "bg-[#0070EB] text-white" : "bg-slate-100 text-slate-600"}`}
            >
              Chưa xác minh
            </Link>
            <Link
              href={buildHref({ q, verified, locked: "1" })}
              className={`rounded-md px-2.5 py-1 font-medium ${locked === "1" ? "bg-[#0070EB] text-white" : "bg-slate-100 text-slate-600"}`}
            >
              Đã khóa
            </Link>
          </div>
          <form className="flex gap-2" action="/users" method="get">
            {verified !== "all" ? (
              <input type="hidden" name="verified" value={verified} />
            ) : null}
            {locked !== "all" ? (
              <input type="hidden" name="locked" value={locked} />
            ) : null}
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Tìm email hoặc username…"
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
            Không tìm thấy người dùng.
          </div>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-900/50">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Roles</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Tạo lúc</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40">
                  <td className="px-4 py-3 text-slate-500">{user.id}</td>
                  <td className="px-4 py-3 font-medium">{user.userName}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {user.roles.join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {user.isLocked ? (
                      <span className="text-rose-600">Khóa</span>
                    ) : user.verified ? (
                      <span className="text-emerald-600">OK</span>
                    ) : (
                      <span className="text-amber-600">Chưa xác minh</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/users/${user.id}`}
                      className="font-medium text-[#0070EB] hover:underline"
                    >
                      Chi tiết
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </AdminPanel>

      {pagination.totalPages > 1 ? (
        <div className="flex items-center justify-end gap-2 text-sm">
          {page > 1 ? (
            <Link
              href={buildHref({ page: page - 1, q, verified, locked })}
              className="rounded-md border border-slate-200 px-3 py-1.5"
            >
              Trước
            </Link>
          ) : null}
          <span className="text-slate-500">
            {page} / {pagination.totalPages}
          </span>
          {page < pagination.totalPages ? (
            <Link
              href={buildHref({ page: page + 1, q, verified, locked })}
              className="rounded-md border border-slate-200 px-3 py-1.5"
            >
              Sau
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
