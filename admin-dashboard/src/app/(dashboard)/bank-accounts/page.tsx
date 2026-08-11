import type { Metadata } from "next";
import { AdminPageHeader, AdminPanel } from "@/components/Layouts/admin-surface";
import { fetchBankAccounts } from "./actions";
import { BankAccountManager } from "./_components/bank-account-manager";

export const metadata: Metadata = {
  title: "Tài khoản ngân hàng",
};

export default async function BankAccountsPage() {
  const accounts = await fetchBankAccounts();
  const active = accounts.filter((a) => a.isActive).length;
  const defaults = accounts.filter((a) => a.isDefault).length;

  return (
    <div className="space-y-4">
      <AdminPageHeader
        eyebrow="Thanh toán"
        title="Tài khoản ngân hàng"
        description="Tài khoản nhận tiền QR/SePay. Đối chiếu hàng ngày với đơn hàng theo quy trình vận hành."
        metrics={[
          { label: "Tổng TK", value: accounts.length, tone: "slate" },
          { label: "Đang dùng", value: active, tone: "green" },
          { label: "Mặc định", value: defaults, tone: "blue" },
        ]}
        actions={
          <a
            href="/api/be/bank-accounts/export.csv"
            className="inline-flex rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Export CSV
          </a>
        }
      />
      <AdminPanel
        title="Danh sách tài khoản"
        description="Ưu tiên tài khoản mặc định active; nếu trống hệ thống dùng env BANK_*."
        bodyClassName="p-0"
      >
        <BankAccountManager accounts={accounts} />
      </AdminPanel>
    </div>
  );
}
