"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ConfirmReasonDialog } from "@/components/Layouts/confirm-reason-dialog";
import { updateOrderStatus } from "./actions";

type Props = {
  orderId: string;
  status: "pending" | "paid" | "cancelled" | "refunded";
};

type PendingAction = "paid" | "cancelled" | "refunded" | null;

const ACTION_COPY: Record<
  Exclude<PendingAction, null>,
  { title: string; description: string; confirmLabel: string; destructive: boolean }
> = {
  paid: {
    title: "Xác nhận đã thanh toán",
    description:
      "Học viên sẽ được ghi danh vào các khóa trong đơn. Nhập lý do xác nhận (vd: đã nhận CK / thanh toán trễ sau khi hết hạn QR).",
    confirmLabel: "Xác nhận đã TT",
    destructive: false,
  },
  cancelled: {
    title: "Hủy đơn hàng",
    description: "Hủy đơn đang chờ thanh toán. Thao tác này không thể hoàn tác trên UI.",
    confirmLabel: "Hủy đơn",
    destructive: true,
  },
  refunded: {
    title: "Hoàn tiền & thu hồi quyền",
    description:
      "Hoàn tiền đơn đã thanh toán và thu hồi enrollment các khóa trong đơn.",
    confirmLabel: "Hoàn tiền",
    destructive: true,
  },
};

export function OrderStatusActions({ orderId, status }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [action, setAction] = useState<PendingAction>(null);

  const run = (next: Exclude<PendingAction, null>, reason: string) => {
    setError(null);
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, next, reason);
      if (!result.ok) {
        setError(result.message ?? "Cập nhật thất bại");
        return;
      }
      setAction(null);
      router.refresh();
    });
  };

  if (status === "refunded") {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Đơn đã hoàn tiền — không còn thao tác.
      </p>
    );
  }

  const copy = action ? ACTION_COPY[action] : null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {status === "pending" ? (
          <>
            <button
              type="button"
              disabled={pending}
              onClick={() => setAction("paid")}
              className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
            >
              Xác nhận đã thanh toán
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => setAction("cancelled")}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900 disabled:opacity-60"
            >
              Hủy đơn
            </button>
          </>
        ) : null}
        {status === "cancelled" ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => setAction("paid")}
            className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
          >
            Khôi phục — xác nhận đã thanh toán
          </button>
        ) : null}
        {status === "paid" ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => setAction("refunded")}
            className="rounded-md border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/40 disabled:opacity-60"
          >
            Hoàn tiền & thu hồi quyền
          </button>
        ) : null}
      </div>
      {pending ? (
        <p className="text-xs text-slate-500">Đang cập nhật…</p>
      ) : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      {copy && action ? (
        <ConfirmReasonDialog
          open={!!action}
          onOpenChange={(open) => {
            if (!open && !pending) setAction(null);
          }}
          title={copy.title}
          description={copy.description}
          confirmLabel={copy.confirmLabel}
          destructive={copy.destructive}
          pending={pending}
          onConfirm={(reason) => run(action, reason)}
        />
      ) : null}
    </div>
  );
}
