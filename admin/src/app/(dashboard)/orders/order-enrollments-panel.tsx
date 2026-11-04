"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ConfirmReasonDialog } from "@/components/Layouts/confirm-reason-dialog";
import { repairOrderEnrollment, type EnrollmentRow } from "./actions";

const STATUS_LABEL: Record<EnrollmentRow["status"], string> = {
  active: "Active",
  missing: "Thiếu",
  revoked: "Đã thu hồi",
  expired: "Hết hạn",
};

const STATUS_BADGE: Record<EnrollmentRow["status"], string> = {
  active:
    "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300",
  missing:
    "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300",
  revoked:
    "bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-300",
  expired:
    "bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-800 dark:text-slate-300",
};

type Props = {
  orderId: string;
  orderStatus: string;
  enrollments: EnrollmentRow[];
};

export function OrderEnrollmentsPanel({
  orderId,
  orderStatus,
  enrollments,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const needsRepair = enrollments.some((e) => e.status !== "active");
  const canRepair = orderStatus === "paid" && needsRepair;

  const onRepair = (reason: string) => {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await repairOrderEnrollment(orderId, reason);
      if (!result.ok) {
        setError(result.message ?? "Thất bại");
        return;
      }
      setMessage(result.message ?? "OK");
      setConfirmOpen(false);
      router.refresh();
    });
  };

  return (
    <div className="space-y-3">
      {enrollments.length === 0 ? (
        <p className="text-sm text-slate-500">Không có khóa trong đơn.</p>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {enrollments.map((row) => (
            <li
              key={row.courseId}
              className="flex items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
            >
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {row.courseName}
                </p>
                <p className="text-xs text-slate-500">
                  {row.enrollmentId
                    ? `ID: ${row.enrollmentId.slice(0, 8)}…`
                    : "Chưa có enrollment"}
                  {row.source ? ` · ${row.source}` : ""}
                </p>
              </div>
              <span
                className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_BADGE[row.status]}`}
              >
                {STATUS_LABEL[row.status]}
              </span>
            </li>
          ))}
        </ul>
      )}

      {canRepair ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => setConfirmOpen(true)}
          className="rounded-md bg-[#0070EB] px-3 py-2 text-sm font-medium text-white hover:bg-[#0060c9] disabled:opacity-60"
        >
          Cấp lại quyền
        </button>
      ) : null}

      {pending ? (
        <p className="text-xs text-slate-500">Đang cấp lại…</p>
      ) : null}
      {message ? (
        <p className="text-sm text-emerald-600">{message}</p>
      ) : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <ConfirmReasonDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!pending) setConfirmOpen(open);
        }}
        title="Cấp lại quyền học"
        description="Cấp lại enrollment cho các khóa thiếu hoặc đã thu hồi. Không tạo bản ghi trùng nếu đã active."
        confirmLabel="Cấp lại"
        pending={pending}
        onConfirm={onRepair}
      />
    </div>
  );
}
