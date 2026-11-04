"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ConfirmReasonDialog } from "@/components/Layouts/confirm-reason-dialog";
import { expireStalePendingOrders } from "./actions";

type Props = {
  count: number;
};

export function ExpireStaleButton({ count }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  if (count <= 0) return null;

  return (
    <div className="space-y-1">
      <button
        type="button"
        disabled={pending}
        onClick={() => setOpen(true)}
        className="rounded-md border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-800 hover:bg-amber-100 disabled:opacity-60 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
      >
        Hủy pending quá hạn ({count})
      </button>
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}

      <ConfirmReasonDialog
        open={open}
        onOpenChange={(next) => {
          if (!pending) setOpen(next);
        }}
        title="Hủy đơn pending quá hạn"
        description={`Sẽ hủy tối đa các đơn pending đã hết hạn thanh toán (ước lượng ${count} đơn trong bộ lọc hiện tại).`}
        confirmLabel="Hủy quá hạn"
        destructive
        pending={pending}
        onConfirm={() => {
          setError(null);
          startTransition(async () => {
            const result = await expireStalePendingOrders();
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
