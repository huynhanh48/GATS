type Props = {
  data: Array<{ date: string; revenue: number; orders: number }>;
};

function currency(value: number) {
  return value.toLocaleString("vi-VN") + "đ";
}

function formatDay(date: string) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}

/** Lightweight CSS bar chart — avoids pulling in a client-side chart lib for MVP. */
export function RevenueBarChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-slate-500">
        Chưa có doanh thu trong khoảng thời gian này.
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <div className="flex h-56 items-end gap-1.5 overflow-x-auto pb-1">
      {data.map((day) => {
        const heightPct = Math.max(2, Math.round((day.revenue / max) * 100));
        return (
          <div
            key={day.date}
            className="group relative flex min-w-[28px] flex-1 flex-col items-center justify-end gap-1"
          >
            <div className="pointer-events-none absolute -top-9 z-10 hidden whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-white group-hover:block dark:bg-slate-700">
              {currency(day.revenue)} · {day.orders} đơn
            </div>
            <div
              className="w-full rounded-t-md bg-[#0070EB] transition-colors group-hover:bg-[#0060c8]"
              style={{ height: `${heightPct}%`, minHeight: 4 }}
            />
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              {formatDay(day.date)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
