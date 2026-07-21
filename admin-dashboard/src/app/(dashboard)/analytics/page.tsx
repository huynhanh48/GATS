import type { Metadata } from "next";
import { AdminFetchError } from "@/components/Layouts/admin-fetch-error";
import { AdminPageHeader, AdminPanel } from "@/components/Layouts/admin-surface";
import { fetchAnalyticsOverview, fetchDashboardMetrics } from "./actions";
import { RevenueBarChart } from "./_components/revenue-bar-chart";

export const metadata: Metadata = {
  title: "Phân tích",
};

function currency(value: number) {
  return value.toLocaleString("vi-VN") + "đ";
}

export default async function AnalyticsPage() {
  const [{ data: overview, error: overviewError }, { data: metrics, error: metricsError }] =
    await Promise.all([fetchAnalyticsOverview(), fetchDashboardMetrics()]);

  const error = overviewError || metricsError;

  return (
    <div className="space-y-4">
      <AdminPageHeader
        eyebrow="Insights"
        title="Phân tích"
        description="Số liệu tổng quan doanh thu, đơn hàng, học viên và khóa học bán chạy."
        metrics={[
          { label: "Tổng doanh thu", value: currency(overview.revenue.totalRevenue), tone: "green" },
          { label: "Doanh thu 30 ngày", value: currency(overview.revenue.last30dRevenue), tone: "blue" },
          { label: "Tổng học viên", value: overview.users.total, tone: "slate" },
          { label: "Chứng chỉ đã cấp", value: overview.certificates.issued, tone: "orange" },
        ]}
      />

      {error ? <AdminFetchError message={error} retryHref="/analytics" /> : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminPanel title="Đơn hàng" bodyClassName="p-4">
          <dl className="space-y-1 text-sm">
            {Object.entries(overview.orders).map(([status, value]) => (
              <div key={status} className="flex items-center justify-between">
                <dt className="capitalize text-slate-500 dark:text-slate-400">{status}</dt>
                <dd className="font-semibold text-slate-950 dark:text-white">{value}</dd>
              </div>
            ))}
          </dl>
        </AdminPanel>

        <AdminPanel title="Ghi danh" bodyClassName="p-4">
          <dl className="space-y-1 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Đang hoạt động</dt>
              <dd className="font-semibold text-slate-950 dark:text-white">
                {overview.enrollments.active}
              </dd>
            </div>
            {metrics ? (
              <div className="flex items-center justify-between">
                <dt className="text-slate-500 dark:text-slate-400">Mới (7 ngày)</dt>
                <dd className="font-semibold text-slate-950 dark:text-white">
                  {metrics.enrollments.newLast7Days}
                </dd>
              </div>
            ) : null}
          </dl>
        </AdminPanel>

        <AdminPanel title="Mã giảm giá" bodyClassName="p-4">
          <dl className="space-y-1 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Lượt sử dụng</dt>
              <dd className="font-semibold text-slate-950 dark:text-white">
                {overview.coupons.redemptions}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Tổng giảm giá</dt>
              <dd className="font-semibold text-slate-950 dark:text-white">
                {currency(overview.coupons.totalDiscount)}
              </dd>
            </div>
          </dl>
        </AdminPanel>

        <AdminPanel title="Đăng ký tư vấn" bodyClassName="p-4">
          <dl className="space-y-1 text-sm">
            {Object.entries(overview.leads).map(([status, value]) => (
              <div key={status} className="flex items-center justify-between">
                <dt className="capitalize text-slate-500 dark:text-slate-400">{status}</dt>
                <dd className="font-semibold text-slate-950 dark:text-white">{value}</dd>
              </div>
            ))}
          </dl>
        </AdminPanel>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <AdminPanel
          title="Doanh thu 14 ngày qua"
          className="xl:col-span-2"
          bodyClassName="p-4"
        >
          <RevenueBarChart data={overview.revenueByDay} />
        </AdminPanel>

        <AdminPanel title="Khóa học bán chạy" bodyClassName="p-0">
          {overview.topCourses.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500">
              Chưa có dữ liệu bán hàng.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {overview.topCourses.map((course, idx) => (
                <li
                  key={course.courseId}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-950 dark:text-white">
                        {course.title ?? course.courseId}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {course.sales} lượt bán
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-slate-950 dark:text-white">
                    {currency(course.revenue)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </AdminPanel>
      </div>
    </div>
  );
}
