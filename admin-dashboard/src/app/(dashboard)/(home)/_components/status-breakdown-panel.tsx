import { AdminPanel } from "@/components/Layouts/admin-surface";
import { fetchDashboardMetrics } from "../metrics-actions";

type Row = { label: string; value: number; colorClass: string };

function Bars({ rows, total }: { rows: Row[]; total: number }) {
  return (
    <div className="space-y-3">
      {rows.map((row) => {
        const pct = total > 0 ? Math.round((row.value / total) * 100) : 0;
        return (
          <div key={row.label}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-300">{row.label}</span>
              <span className="font-medium text-slate-950 dark:text-white">
                {row.value}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className={`h-full rounded-full ${row.colorClass}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export async function StatusBreakdownPanels() {
  const { metrics } = await fetchDashboardMetrics();

  const orderRows: Row[] = [
    { label: "Chờ thanh toán", value: metrics.orders.pending, colorClass: "bg-amber-500" },
    { label: "Đã thanh toán", value: metrics.orders.paid, colorClass: "bg-emerald-500" },
    { label: "Đã hủy", value: metrics.orders.cancelled, colorClass: "bg-slate-400" },
    { label: "Hoàn tiền", value: metrics.orders.refunded, colorClass: "bg-rose-500" },
  ];

  const leadRows: Row[] = [
    { label: "Mới", value: metrics.leads.new, colorClass: "bg-blue-500" },
    { label: "Đã liên hệ", value: metrics.leads.contacted, colorClass: "bg-amber-500" },
    { label: "Đủ điều kiện", value: metrics.leads.qualified, colorClass: "bg-purple-500" },
    { label: "Đã chuyển đổi", value: metrics.leads.converted, colorClass: "bg-emerald-500" },
    { label: "Mất", value: metrics.leads.lost, colorClass: "bg-slate-400" },
    { label: "Spam", value: metrics.leads.spam, colorClass: "bg-rose-500" },
  ];

  const enrollmentRows: Row[] = [
    { label: "Đang hoạt động", value: metrics.enrollments.active, colorClass: "bg-emerald-500" },
    { label: "Hết hạn", value: metrics.enrollments.expired, colorClass: "bg-amber-500" },
    { label: "Đã hủy", value: metrics.enrollments.cancelled, colorClass: "bg-slate-400" },
  ];

  return (
    <>
      <AdminPanel
        title="Đơn hàng theo trạng thái"
        description={`Tổng ${metrics.orders.all} đơn`}
        className="col-span-12 xl:col-span-4"
      >
        <Bars rows={orderRows} total={metrics.orders.all} />
      </AdminPanel>

      <AdminPanel
        title="Lead theo trạng thái"
        description={`Tổng ${metrics.leads.all} lead`}
        className="col-span-12 xl:col-span-4"
      >
        <Bars rows={leadRows} total={metrics.leads.all} />
      </AdminPanel>

      <AdminPanel
        title="Đăng ký học theo trạng thái"
        description={`Tổng ${metrics.enrollments.all} đăng ký`}
        className="col-span-12 xl:col-span-4"
      >
        <Bars rows={enrollmentRows} total={metrics.enrollments.all} />
      </AdminPanel>
    </>
  );
}
