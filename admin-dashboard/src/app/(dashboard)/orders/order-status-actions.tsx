"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ConfirmReasonDialog } from "@/components/Layouts/confirm-reason-dialog";
import {
  updateOrderStatus,
  type UpdateOrderStatusInput,
} from "./actions";
import {
  RefundRequestDialog,
  type RefundRequestPayload,
} from "./refund-request-dialog";

type Props = {
  orderId: string;
  status: "pending" | "paid" | "cancelled" | "refund_pending" | "refunded";
};

type ReasonAction = "paid" | "cancelled" | "confirm_refund" | "cancel_refund" | null;

const ACTION_COPY: Record<
  Exclude<ReasonAction, null>,
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
  confirm_refund: {
    title: "Xác nhận đã chuyển tiền",
    description:
      "Đánh dấu đã chuyển khoản hoàn tiền thủ công ngoài hệ thống. Đơn sẽ chuyển sang «Đã hoàn tiền».",
    confirmLabel: "Đã chuyển tiền",
    destructive: false,
  },
  cancel_refund: {
    title: "Hủy yêu cầu hoàn tiền",
    description:
      "Hủy yêu cầu hoàn tiền và khôi phục quyền học các khóa trong đơn (nếu còn enrollment).",
    confirmLabel: "Hủy yêu cầu",
    destructive: true,
  },
};

export function OrderStatusActions({ orderId, status }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [action, setAction] = useState<ReasonAction>(null);
  const [refundOpen, setRefundOpen] = useState(false);

  const runUpdate = (input: UpdateOrderStatusInput) => {
    setError(null);
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, input);
      if (!result.ok) {
        setError(result.message ?? "Cập nhật thất bại");
        return;
      }
      setAction(null);
      setRefundOpen(false);
      router.refresh();
    });
  };

  const runReasonAction = (next: Exclude<ReasonAction, null>, reason: string) => {
    if (next === "confirm_refund") {
      runUpdate({ status: "refunded", reason });
      return;
    }
    if (next === "cancel_refund") {
      runUpdate({ status: "paid", reason });
      return;
    }
    runUpdate({ status: next, reason });
  };

  const runRefundRequest = (payload: RefundRequestPayload) => {
    runUpdate({
      status: "refund_pending",
      reasonCode: payload.reasonCode,
      reasonNote: payload.reasonNote || undefined,
      bankName: payload.bankName,
      accountNumber: payload.accountNumber,
      accountHolder: payload.accountHolder,
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
            onClick={() => setRefundOpen(true)}
            className="rounded-md border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/40 disabled:opacity-60"
          >
            Yêu cầu hoàn tiền
          </button>
        ) : null}
        {status === "refund_pending" ? (
          <>
            <button
              type="button"
              disabled={pending}
              onClick={() => setAction("confirm_refund")}
              className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
            >
              Xác nhận đã chuyển tiền
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => setAction("cancel_refund")}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900 disabled:opacity-60"
            >
              Hủy yêu cầu hoàn tiền
            </button>
          </>
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
          onConfirm={(reason) => runReasonAction(action, reason)}
        />
      ) : null}

      <RefundRequestDialog
        open={refundOpen}
        onOpenChange={(open) => {
          if (!open && !pending) setRefundOpen(false);
        }}
        pending={pending}
        onConfirm={runRefundRequest}
      />
    </div>
  );
}
