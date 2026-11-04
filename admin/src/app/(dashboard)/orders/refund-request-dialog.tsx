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
import {
  REFUND_REASON_OPTIONS,
  type RefundReasonCode,
} from "@/lib/refund";

export type RefundRequestPayload = {
  reasonCode: RefundReasonCode;
  reasonNote: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pending?: boolean;
  onConfirm: (payload: RefundRequestPayload) => void | Promise<void>;
};

const emptyForm = {
  reasonCode: "wrong_course" as RefundReasonCode,
  reasonNote: "",
  bankName: "",
  accountNumber: "",
  accountHolder: "",
};

export function RefundRequestDialog({
  open,
  onOpenChange,
  pending = false,
  onConfirm,
}: Props) {
  const formId = useId();
  const [form, setForm] = useState(emptyForm);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setForm(emptyForm);
      setLocalError(null);
    }
    onOpenChange(next);
  };

  const handleConfirm = async () => {
    const reasonNote = form.reasonNote.trim();
    const bankName = form.bankName.trim();
    const accountNumber = form.accountNumber.trim();
    const accountHolder = form.accountHolder.trim();

    if (!bankName || bankName.length < 2) {
      setLocalError("Vui lòng nhập tên ngân hàng.");
      return;
    }
    if (!accountNumber || accountNumber.length < 4) {
      setLocalError("Vui lòng nhập số tài khoản (tối thiểu 4 ký tự).");
      return;
    }
    if (!accountHolder || accountHolder.length < 2) {
      setLocalError("Vui lòng nhập tên chủ tài khoản.");
      return;
    }
    if (form.reasonCode === "other" && reasonNote.length < 3) {
      setLocalError("Với lý do «Khác», vui lòng ghi chú chi tiết (tối thiểu 3 ký tự).");
      return;
    }

    setLocalError(null);
    await onConfirm({
      reasonCode: form.reasonCode,
      reasonNote,
      bankName,
      accountNumber,
      accountHolder,
    });
  };

  const fieldClass =
    "w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#0070EB] dark:border-slate-700 dark:bg-slate-950 disabled:opacity-60";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg" showCloseButton={!pending}>
        <DialogHeader>
          <DialogTitle>Yêu cầu hoàn tiền</DialogTitle>
          <DialogDescription>
            Nhập lý do trong chính sách và STK nhận hoàn. Quyền học sẽ bị thu hồi
            ngay; sau khi chuyển tiền tay, xác nhận hoàn tất trên đơn.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-2">
            <label
              htmlFor={`${formId}-reason`}
              className="text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Lý do hoàn tiền
              <span className="text-rose-600"> *</span>
            </label>
            <select
              id={`${formId}-reason`}
              value={form.reasonCode}
              disabled={pending}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  reasonCode: e.target.value as RefundReasonCode,
                }))
              }
              className={fieldClass}
            >
              {REFUND_REASON_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor={`${formId}-note`}
              className="text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Ghi chú
              {form.reasonCode === "other" ? (
                <span className="text-rose-600"> *</span>
              ) : null}
            </label>
            <textarea
              id={`${formId}-note`}
              value={form.reasonNote}
              disabled={pending}
              rows={2}
              placeholder="Chi tiết thêm (bắt buộc nếu chọn Khác)…"
              onChange={(e) =>
                setForm((prev) => ({ ...prev, reasonNote: e.target.value }))
              }
              className={fieldClass}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor={`${formId}-bank`}
              className="text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Ngân hàng
              <span className="text-rose-600"> *</span>
            </label>
            <input
              id={`${formId}-bank`}
              value={form.bankName}
              disabled={pending}
              placeholder="VD: Vietcombank"
              onChange={(e) =>
                setForm((prev) => ({ ...prev, bankName: e.target.value }))
              }
              className={fieldClass}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor={`${formId}-account`}
                className="text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Số tài khoản
                <span className="text-rose-600"> *</span>
              </label>
              <input
                id={`${formId}-account`}
                value={form.accountNumber}
                disabled={pending}
                placeholder="Số TK nhận hoàn"
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    accountNumber: e.target.value,
                  }))
                }
                className={fieldClass}
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor={`${formId}-holder`}
                className="text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Chủ tài khoản
                <span className="text-rose-600"> *</span>
              </label>
              <input
                id={`${formId}-holder`}
                value={form.accountHolder}
                disabled={pending}
                placeholder="Họ tên trên STK"
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    accountHolder: e.target.value,
                  }))
                }
                className={fieldClass}
              />
            </div>
          </div>

          {localError ? (
            <p className="text-sm text-rose-600" role="alert">
              {localError}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <button
            type="button"
            disabled={pending}
            onClick={() => handleOpenChange(false)}
            className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-900 disabled:opacity-60"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => void handleConfirm()}
            className="rounded-md bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-500 disabled:opacity-60"
          >
            {pending ? "Đang xử lý…" : "Yêu cầu hoàn tiền"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
