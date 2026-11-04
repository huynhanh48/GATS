"use client";

import { useId, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  requireReason?: boolean;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  destructive?: boolean;
  pending?: boolean;
  onConfirm: (reason: string) => void | Promise<void>;
};

export function ConfirmReasonDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
  requireReason = true,
  reasonLabel = "Lý do",
  reasonPlaceholder = "Nhập lý do thao tác…",
  destructive = false,
  pending = false,
  onConfirm,
}: Props) {
  const reasonId = useId();
  const [reason, setReason] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setReason("");
      setLocalError(null);
    }
    onOpenChange(next);
  };

  const handleConfirm = async () => {
    const trimmed = reason.trim();
    if (requireReason && trimmed.length < 3) {
      setLocalError("Vui lòng nhập lý do (tối thiểu 3 ký tự).");
      return;
    }
    setLocalError(null);
    await onConfirm(trimmed);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={!pending}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {requireReason ? (
          <div className="space-y-2">
            <label
              htmlFor={reasonId}
              className="text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              {reasonLabel}
              <span className="text-rose-600"> *</span>
            </label>
            <textarea
              id={reasonId}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              disabled={pending}
              placeholder={reasonPlaceholder}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#0070EB] dark:border-slate-700 dark:bg-slate-950"
              aria-invalid={!!localError}
              aria-describedby={localError ? `${reasonId}-error` : undefined}
            />
            {localError ? (
              <p id={`${reasonId}-error`} className="text-sm text-rose-600" role="alert">
                {localError}
              </p>
            ) : null}
          </div>
        ) : null}

        <DialogFooter>
          <button
            type="button"
            disabled={pending}
            onClick={() => handleOpenChange(false)}
            className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-900 disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => void handleConfirm()}
            className={`rounded-md px-3 py-2 text-sm font-medium text-white disabled:opacity-60 ${
              destructive
                ? "bg-rose-600 hover:bg-rose-500"
                : "bg-[#0070EB] hover:bg-[#0060c8]"
            }`}
          >
            {pending ? "Đang xử lý…" : confirmLabel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
