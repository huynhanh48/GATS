"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  createBankAccount,
  deleteBankAccount,
  setDefaultBankAccount,
  updateBankAccount,
  type BankAccount,
} from "../actions";

type Props = {
  accounts: BankAccount[];
};

const emptyForm = {
  label: "",
  bankName: "VietinBank",
  bankCode: "VietinBank",
  accountNumber: "",
  accountHolder: "",
  bankBranch: "",
  isDefault: false,
};

export function BankAccountManager({ accounts }: Props) {
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  function run(action: () => Promise<{ ok: boolean; message: string }>) {
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        toast.success(result.message);
        setForm(emptyForm);
        setEditingId(null);
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="space-y-6 p-4">
      <form
        className="grid gap-3 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          const payload = {
            label: form.label.trim(),
            bankName: form.bankName.trim(),
            bankCode: form.bankCode.trim() || form.bankName.trim(),
            accountNumber: form.accountNumber.trim(),
            accountHolder: form.accountHolder.trim(),
            bankBranch: form.bankBranch.trim() || undefined,
            isDefault: form.isDefault,
          };
          if (editingId) {
            run(() => updateBankAccount(editingId, payload));
          } else {
            run(() => createBankAccount(payload));
          }
        }}
      >
        <h3 className="sm:col-span-2 text-sm font-semibold text-slate-900 dark:text-white">
          {editingId ? "Sửa tài khoản" : "Thêm tài khoản"}
        </h3>
        {(
          [
            ["label", "Nhãn (VD: VietinBank chính)"],
            ["bankName", "Tên ngân hàng"],
            ["bankCode", "Mã NH / BIN (SePay)"],
            ["accountNumber", "Số tài khoản"],
            ["accountHolder", "Chủ tài khoản"],
            ["bankBranch", "Chi nhánh (tuỳ chọn)"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="block text-xs text-slate-500">
            {label}
            <input
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              value={form[key]}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, [key]: e.target.value }))
              }
              required={key !== "bankBranch"}
            />
          </label>
        ))}
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <input
            type="checkbox"
            checked={form.isDefault}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, isDefault: e.target.checked }))
            }
          />
          Đặt làm mặc định nhận tiền
        </label>
        <div className="flex gap-2 sm:col-span-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-[#0070EB] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {editingId ? "Lưu" : "Thêm"}
          </button>
          {editingId ? (
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm dark:border-slate-700"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
            >
              Hủy
            </button>
          ) : null}
        </div>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-800">
            <tr>
              <th className="px-2 py-2">Nhãn</th>
              <th className="px-2 py-2">Ngân hàng</th>
              <th className="px-2 py-2">Số TK</th>
              <th className="px-2 py-2">Chủ TK</th>
              <th className="px-2 py-2">Trạng thái</th>
              <th className="px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {accounts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-2 py-6 text-slate-500">
                  Chưa có tài khoản trong DB — hệ thống có thể dùng env{" "}
                  <code className="text-xs">BANK_*</code>.
                </td>
              </tr>
            ) : (
              accounts.map((account) => (
                <tr
                  key={account.id}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="px-2 py-3 font-medium">{account.label}</td>
                  <td className="px-2 py-3">
                    {account.bankName}
                    <div className="text-xs text-slate-400">{account.bankCode}</div>
                  </td>
                  <td className="px-2 py-3 font-mono text-xs">
                    {account.accountNumber}
                  </td>
                  <td className="px-2 py-3">{account.accountHolder}</td>
                  <td className="px-2 py-3">
                    {account.isDefault ? (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">
                        Mặc định
                      </span>
                    ) : null}{" "}
                    {account.isActive ? (
                      <span className="text-xs text-slate-500">Active</span>
                    ) : (
                      <span className="text-xs text-rose-500">Inactive</span>
                    )}
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="text-xs text-[#0070EB] hover:underline"
                        disabled={pending}
                        onClick={() => {
                          setEditingId(account.id);
                          setForm({
                            label: account.label,
                            bankName: account.bankName,
                            bankCode: account.bankCode,
                            accountNumber: account.accountNumber,
                            accountHolder: account.accountHolder,
                            bankBranch: account.bankBranch ?? "",
                            isDefault: account.isDefault,
                          });
                        }}
                      >
                        Sửa
                      </button>
                      {!account.isDefault ? (
                        <button
                          type="button"
                          className="text-xs text-slate-600 hover:underline"
                          disabled={pending}
                          onClick={() =>
                            run(() => setDefaultBankAccount(account.id))
                          }
                        >
                          Đặt mặc định
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="text-xs text-rose-600 hover:underline"
                        disabled={pending}
                        onClick={() => {
                          if (
                            confirm(
                              `Xóa tài khoản ${account.label}?`,
                            )
                          ) {
                            run(() => deleteBankAccount(account.id));
                          }
                        }}
                      >
                        Xóa
                      </button>
                      <button
                        type="button"
                        className="text-xs text-slate-500 hover:underline"
                        disabled={pending}
                        onClick={() =>
                          run(() =>
                            updateBankAccount(account.id, {
                              isActive: !account.isActive,
                            }),
                          )
                        }
                      >
                        {account.isActive ? "Tắt" : "Bật"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
