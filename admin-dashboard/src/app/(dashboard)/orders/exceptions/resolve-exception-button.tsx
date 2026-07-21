"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ConfirmReasonDialog } from "@/components/Layouts/confirm-reason-dialog";
import { resolvePaymentException } from "../actions";

type Props = {
  exceptionId: string;
};

export function ResolveExceptionButton({ exceptionId }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-1">
      <button
        type="button"
        disabled={pending}
        onClick={() => setOpen(true)}
        className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-60 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
      >
        Đánh dấu đã xử lý
      </button>
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}

      <ConfirmReasonDialog
        open={open}
        onOpenChange={(next) => {
          if (!pending) setOpen(next);
        }}
        title="Xử lý ngoại lệ thanh toán"
        description="Ghi chú lại cách bạn đã xử lý ngoại lệ này (đối chiếu thủ công, liên hệ khách hàng, v.v.)."
        confirmLabel="Xác nhận đã xử lý"
        requireReason={false}
        reasonLabel="Ghi chú (không bắt buộc)"
        reasonPlaceholder="VD: Đã xác nhận với khách qua điện thoại, số tiền khớp."
        pending={pending}
        onConfirm={(note) => {
          setError(null);
          startTransition(async () => {
            const result = await resolvePaymentException(exceptionId, note);
            if (!result.ok) {
              setError(result.message ?? "Thất bại");
              return;
            }
            setOpen(false);
            router.refresh();
          });
        }}
      />
    </div>
  );
}
