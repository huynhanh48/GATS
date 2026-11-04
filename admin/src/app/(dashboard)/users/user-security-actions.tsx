"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ConfirmReasonDialog } from "@/components/Layouts/confirm-reason-dialog";
import {
  lockUser,
  resendVerification,
  revokeSessions,
  sendPasswordReset,
  unlockUser,
} from "./actions";

type Props = {
  userId: number;
  verified: boolean;
  isLocked: boolean;
  hasPassword?: boolean;
};

type SensitiveAction = "lock" | "unlock" | "revoke" | null;

export function UserSecurityActions({
  userId,
  verified,
  isLocked,
  hasPassword,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [action, setAction] = useState<SensitiveAction>(null);

  const runSimple = (
    fn: (id: number) => Promise<{ ok: boolean; message?: string }>,
  ) => {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await fn(userId);
      if (!result.ok) {
        setError(result.message ?? "Thất bại");
        return;
      }
      setMessage(result.message ?? "OK");
      router.refresh();
    });
  };

  const runSensitive = async (reason: string) => {
    if (!action) return;
    setError(null);
    setMessage(null);
    startTransition(async () => {
      let result: { ok: boolean; message?: string };
      if (action === "lock") {
        result = await lockUser(userId, reason);
      } else if (action === "unlock") {
        result = await unlockUser(userId, reason);
      } else {
        result = await revokeSessions(userId, reason);
      }
      if (!result.ok) {
        setError(result.message ?? "Thất bại");
        return;
      }
      setMessage(result.message ?? "OK");
      setAction(null);
      router.refresh();
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {!verified ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => runSimple(resendVerification)}
            className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 disabled:opacity-60"
          >
            Gửi lại xác minh email
          </button>
        ) : null}
        {hasPassword !== false ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => runSimple(sendPasswordReset)}
            className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 disabled:opacity-60"
          >
            Gửi reset mật khẩu
          </button>
        ) : null}
        <button
          type="button"
          disabled={pending}
          onClick={() => setAction("revoke")}
          className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 disabled:opacity-60"
        >
          Thu hồi session
        </button>
        {isLocked ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => setAction("unlock")}
            className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
          >
            Mở khóa
          </button>
        ) : (
          <button
            type="button"
            disabled={pending}
            onClick={() => setAction("lock")}
            className="rounded-md border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-60"
          >
            Khóa tài khoản
          </button>
        )}
      </div>
      <p className="text-xs text-slate-500">
        Không hỗ trợ đặt mật khẩu thủ công — chỉ gửi link reset.
      </p>
      {pending ? (
        <p className="text-xs text-slate-500">Đang xử lý…</p>
      ) : null}
      {message ? (
        <p className="text-sm text-emerald-600">{message}</p>
      ) : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <ConfirmReasonDialog
        open={!!action}
        onOpenChange={(open) => {
          if (!open && !pending) setAction(null);
        }}
        title={
          action === "lock"
            ? "Khóa tài khoản"
            : action === "unlock"
              ? "Mở khóa tài khoản"
              : "Thu hồi phiên đăng nhập"
        }
        description={
          action === "lock"
            ? "User sẽ không đăng nhập được. Phiên hiện tại cũng bị thu hồi."
            : action === "unlock"
              ? "Cho phép user đăng nhập lại."
              : "Xóa cookie/session đang hoạt động của user này."
        }
        confirmLabel="Xác nhận"
        destructive={action === "lock" || action === "revoke"}
        pending={pending}
        onConfirm={runSensitive}
      />
    </div>
  );
}
