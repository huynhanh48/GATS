import Link from "next/link";
import { compactFormat } from "@/lib/format-number";
import { fetchDashboardMetrics } from "../../metrics-actions";
import * as icons from "./icons";
import { StatCard } from "./stat-card";

function formatMoney(amount: number) {
  return `${amount.toLocaleString("vi-VN")} đ`;
}

export async function RealOverviewCardsGroup() {
  const { metrics, error } = await fetchDashboardMetrics();

  return (
    <div className="space-y-2">
      {error ? (
        <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
          {error} — đang hiển thị số liệu rỗng.
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        <StatCard
          label="Doanh thu tháng này"
          value={formatMoney(metrics.revenue.thisMonth)}
          hint={`Tổng cộng: ${formatMoney(metrics.revenue.total)}`}
          Icon={icons.Profit}
        />

        <StatCard
          label="Đơn hàng"
          value={compactFormat(metrics.orders.all)}
          hint={`${metrics.orders.pending} chờ thanh toán · ${metrics.orders.paid} đã thanh toán`}
          Icon={icons.Views}
        />

        <StatCard
          label="Lead tư vấn"
          value={compactFormat(metrics.leads.all)}
          hint={`${metrics.leads.new} mới · ${metrics.leads.converted} đã chuyển đổi`}
          Icon={icons.Users}
        />

        <StatCard
          label="Đăng ký học đang hoạt động"
          value={compactFormat(metrics.enrollments.active)}
          hint={`+${metrics.enrollments.newLast7Days} trong 7 ngày qua`}
          Icon={icons.Product}
        />
      </div>

      {metrics.pendingSubmissions > 0 || metrics.unresolvedExceptions > 0 ? (
        <div className="flex flex-wrap gap-3 text-sm">
          {metrics.pendingSubmissions > 0 ? (
            <Link
              href="/course"
              className="rounded-md bg-amber-50 px-3 py-1.5 font-medium text-amber-700 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-300"
            >
              {metrics.pendingSubmissions} bài tập chờ chấm điểm
            </Link>
          ) : null}
          {metrics.unresolvedExceptions > 0 ? (
            <Link
              href="/orders/exceptions"
              className="rounded-md bg-rose-50 px-3 py-1.5 font-medium text-rose-700 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-300"
            >
              {metrics.unresolvedExceptions} ngoại lệ thanh toán chưa xử lý
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
