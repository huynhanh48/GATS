"use client";

export type OrderReceiptData = {
  orderId: string;
  status: string;
  paidAt: string | null;
  createdAt: string;
  receiptNumber: string;
  customer: {
    name: string | null;
    email: string | null;
    phone: string | null;
  };
  items: Array<{
    courseName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  discountAmount: number;
  couponCode: string | null;
  totalAmount: number;
  payment: {
    method: string | null;
    txnRef: string | null;
  };
  seller: {
    name: string;
    address: string | null;
    email: string | null;
    phone: string | null;
    taxCode: string | null;
  };
};

const METHOD_LABELS: Record<string, string> = {
  bank_transfer: "Chuyển khoản / QR",
  vnpay: "VNPay",
  momo: "MoMo",
  wallet: "Ví",
};

function formatMoney(amount: number) {
  return `${amount.toLocaleString("vi-VN")} đ`;
}

function formatDate(value: string | null) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
    });
  } catch {
    return value;
  }
}

type Props = {
  receipt: OrderReceiptData;
  backHref?: string;
};

/** Printable payment receipt (biên lai). Use with window.print(). */
export function OrderReceiptView({ receipt, backHref }: Props) {
  const subtotal = receipt.items.reduce((sum, i) => sum + i.lineTotal, 0);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex flex-wrap items-center gap-2 print:hidden">
        {backHref ? (
          <a
            href={backHref}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
          >
            ← Quay lại
          </a>
        ) : null}
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
        >
          In hóa đơn
        </button>
      </div>

      <article
        id="receipt-print"
        className="rounded-xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm print:border-0 print:shadow-none sm:p-8"
      >
        <header className="border-b border-slate-200 pb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Biên lai thanh toán
          </p>
          <h1 className="mt-1 text-2xl font-bold">{receipt.seller.name}</h1>
          <div className="mt-2 space-y-0.5 text-sm text-slate-600">
            {receipt.seller.address ? <p>{receipt.seller.address}</p> : null}
            {receipt.seller.email ? <p>{receipt.seller.email}</p> : null}
            {receipt.seller.phone ? <p>{receipt.seller.phone}</p> : null}
            {receipt.seller.taxCode ? (
              <p>MST: {receipt.seller.taxCode}</p>
            ) : null}
          </div>
        </header>

        <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase text-slate-500">Số biên lai</p>
            <p className="font-mono font-semibold">{receipt.receiptNumber}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-slate-500">Ngày thanh toán</p>
            <p className="font-medium">{formatDate(receipt.paidAt)}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-slate-500">Mã đơn</p>
            <p className="break-all font-mono text-xs">{receipt.orderId}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-slate-500">Mã giao dịch</p>
            <p className="font-mono text-xs">
              {receipt.payment.txnRef ?? "—"}
            </p>
          </div>
        </div>

        <section className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Người mua
          </h2>
          <div className="mt-2 space-y-0.5 text-sm">
            <p className="font-medium">{receipt.customer.name ?? "—"}</p>
            <p className="text-slate-600">{receipt.customer.email ?? "—"}</p>
            {receipt.customer.phone ? (
              <p className="text-slate-600">{receipt.customer.phone}</p>
            ) : null}
          </div>
        </section>

        <section className="mt-6">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <th className="py-2 pr-2 font-medium">Nội dung</th>
                <th className="py-2 px-2 text-right font-medium">SL</th>
                <th className="py-2 px-2 text-right font-medium">Đơn giá</th>
                <th className="py-2 pl-2 text-right font-medium">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {receipt.items.map((item, idx) => (
                <tr key={`${item.courseName}-${idx}`} className="border-b border-slate-100">
                  <td className="py-2.5 pr-2 font-medium">{item.courseName}</td>
                  <td className="py-2.5 px-2 text-right">{item.quantity}</td>
                  <td className="py-2.5 px-2 text-right">
                    {formatMoney(item.unitPrice)}
                  </td>
                  <td className="py-2.5 pl-2 text-right">
                    {formatMoney(item.lineTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mt-4 space-y-1 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Tạm tính</span>
            <span>{formatMoney(subtotal)}</span>
          </div>
          {receipt.discountAmount > 0 ? (
            <div className="flex justify-between text-slate-600">
              <span>
                Giảm giá
                {receipt.couponCode ? ` (${receipt.couponCode})` : ""}
              </span>
              <span>-{formatMoney(receipt.discountAmount)}</span>
            </div>
          ) : null}
          <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold">
            <span>Tổng thanh toán</span>
            <span>{formatMoney(receipt.totalAmount)}</span>
          </div>
          <p className="pt-2 text-xs text-slate-500">
            Phương thức:{" "}
            {receipt.payment.method
              ? (METHOD_LABELS[receipt.payment.method] ??
                receipt.payment.method)
              : "—"}
          </p>
        </section>

        <footer className="mt-8 border-t border-slate-200 pt-4 text-xs text-slate-500">
          Đây là biên lai thanh toán điện tử do {receipt.seller.name} cấp. Không
          phải hóa đơn GTGT. Vui lòng liên hệ{" "}
          {receipt.seller.email ?? "gatsvn@gmail.com"} nếu cần hỗ trợ.
        </footer>
      </article>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          body * { visibility: hidden !important; }
          #receipt-print, #receipt-print * { visibility: visible !important; }
          #receipt-print {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `,
        }}
      />
    </div>
  );
}
