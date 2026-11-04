"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { type AccountRole, updateUserRole } from "./actions";

const ROLE_OPTIONS: Array<{
  value: AccountRole;
  label: string;
  description: string;
}> = [
  { value: "user", label: "Học viên", description: "Học và mua khóa học" },
  {
    value: "admin",
    label: "Quản trị viên",
    description: "Toàn quyền vận hành hệ thống",
  },
];

type Props = {
  userId: number;
  currentRole: AccountRole;
  isSelf: boolean;
};

export function UserRoleEditor({ userId, currentRole, isSelf }: Props) {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<AccountRole>(currentRole);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const selected = ROLE_OPTIONS.find((role) => role.value === selectedRole)!;
  const unchanged = selectedRole === currentRole;
  const selfDemotion = isSelf && currentRole === "admin" && selectedRole !== "admin";

  const save = () => {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await updateUserRole(userId, selectedRole);
      if (!result.ok) {
        setError(result.message ?? "Cập nhật role thất bại");
        return;
      }
      setConfirmOpen(false);
      setMessage(result.message ?? "Đã cập nhật role");
      router.refresh();
    });
  };

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="account-role" className="mb-1.5 block text-sm font-medium text-slate-900 dark:text-slate-100">
          Role tài khoản
        </label>
        <select
          id="account-role"
          value={selectedRole}
          disabled={pending}
          onChange={(event) => {
            setSelectedRole(event.target.value as AccountRole);
            setError(null);
            setMessage(null);
          }}
          className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#0070EB] focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
        >
          {ROLE_OPTIONS.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>
        <p className="mt-1.5 text-xs leading-5 text-slate-500">{selected.description}</p>
      </div>

      {selfDemotion ? (
        <p className="text-sm text-amber-700 dark:text-amber-400" role="alert">
          Bạn không thể tự hạ quyền admin của tài khoản đang đăng nhập.
        </p>
      ) : null}

      <button
        type="button"
        disabled={pending || unchanged || selfDemotion}
        onClick={() => setConfirmOpen(true)}
        className="min-h-11 w-full rounded-lg bg-[#0070EB] px-4 text-sm font-semibold text-white transition hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Đang cập nhật…" : "Cập nhật role"}
      </button>

      <p className="text-xs leading-5 text-slate-500">
        Sau khi thay đổi, phiên đăng nhập hiện tại của người dùng sẽ bị thu hồi.
        Mentor được phân công riêng theo từng khóa học ở mục bên dưới.
      </p>
      {message ? <p className="text-sm text-emerald-600" role="status">{message}</p> : null}
      {error ? <p className="text-sm text-rose-600" role="alert">{error}</p> : null}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận thay đổi role</AlertDialogTitle>
            <AlertDialogDescription>
              Đổi role tài khoản sang <strong>{selected.label}</strong>? Người
              dùng sẽ phải đăng nhập lại để nhận quyền mới.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Hủy</AlertDialogCancel>
            <AlertDialogAction disabled={pending} onClick={save}>
              {pending ? "Đang cập nhật…" : "Xác nhận"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
