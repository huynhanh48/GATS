import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHeader, AdminPanel } from "@/components/Layouts/admin-surface";
import { formatVnDateTime } from "@/lib/datetime";
import { REFUND_REASON_LABELS, type RefundReasonCode } from "@/lib/refund";
import { fetchOrderDetail, type OrderStatus } from "../actions";
import { OrderEnrollmentsPanel } from "../order-enrollments-panel";
import { OrderStatusActions } from "../order-status-actions";

export const metadata: Metadata = {
  title: "Chi tiết đơn hàng",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Chờ thanh toán",
  paid: "Đã thanh toán",
  cancelled: "Đã hủy",
  refund_pending: "Chờ hoàn tiền",
  refunded: "Đã hoàn tiền",
};

const METHOD_LABELS: Record<string, string> = {
  bank_transfer: "Chuyển khoản / QR",
  vnpay: "VNPay",
  momo: "MoMo",
  wallet: "Ví",
};

function formatDate(value: string | null) {
  return formatVnDateTime(value);
}

function formatMoney(amount: number) {
  return `${amount.toLocaleString("vi-VN")} đ`;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-slate-100 py-3 last:border-0 sm:grid-cols-[160px_1fr] sm:gap-4 dark:border-slate-800">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </dt>
      <dd className="text-sm text-slate-900 dark:text-slate-100">{children}</dd>
    </div>
  );
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const detail = await fetchOrderDetail(id);
  if (!detail) notFound();

  const {
    order,
    transaction,
    user,
    enrollments = [],
    timeline = [],
    auditLogs = [],
  } = detail;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/orders" className="hover:text-[#0070EB] hover:underline">
          ← Đơn hàng
        </Link>
      </div>

      <AdminPageHeader
        eyebrow="Thanh toán"
        title={`Đơn #${order.id.slice(0, 8)}…`}
        description={`${STATUS_LABELS[order.status]} · ${formatMoney(order.totalAmount)}`}
        metrics={[
          {
            label: "Trạng thái",
            value: STATUS_LABELS[order.status],
            tone:
              order.status === "paid"
                ? "green"
                : order.status === "pending"
                  ? "blue"
                  : order.status === "refund_pending"
                    ? "blue"
                    : "slate",
          },
          {
            label: "Số tiền",
            value: formatMoney(order.totalAmount),
            tone: "slate",
          },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <AdminPanel title="Thông tin đơn" bodyClassName="px-4 py-1">
            <dl>
              <Row label="Mã đơn">
                <span className="font-mono text-xs break-all">{order.id}</span>
              </Row>
              <Row label="Tạo lúc">{formatDate(order.createdAt)}</Row>
              <Row label="Thanh toán lúc">{formatDate(order.paidAt)}</Row>
              <Row label="Phương thức">
                {order.paymentMethod
                  ? (METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod)
                  : "—"}
              </Row>
              <Row label="Ghi chú">{order.notes || "—"}</Row>
            </dl>
          </AdminPanel>

          {order.refundReasonCode ||
          order.refundBankName ||
          order.status === "refund_pending" ||
          order.status === "refunded" ? (
            <AdminPanel title="Thông tin hoàn tiền" bodyClassName="px-4 py-1">
              <dl>
                <Row label="Lý do">
                  {order.refundReasonCode
                    ? (REFUND_REASON_LABELS[
                        order.refundReasonCode as RefundReasonCode
                      ] ?? order.refundReasonCode)
                    : "—"}
                </Row>
                <Row label="Ghi chú">{order.refundReasonNote || "—"}</Row>
                <Row label="Ngân hàng">{order.refundBankName || "—"}</Row>
                <Row label="Số TK">{order.refundAccountNumber || "—"}</Row>
                <Row label="Chủ TK">{order.refundAccountHolder || "—"}</Row>
                <Row label="Yêu cầu lúc">
                  {formatDate(order.refundRequestedAt ?? null)}
                </Row>
                <Row label="Hoàn tất lúc">
                  {formatDate(order.refundCompletedAt ?? null)}
                </Row>
              </dl>
            </AdminPanel>
          ) : null}

          <AdminPanel title="Khóa học trong đơn" bodyClassName="p-0 overflow-x-auto">
            {order.items.length === 0 ? (
              <div className="p-6 text-sm text-slate-500">Không có item.</div>
            ) : (
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-900/50">
                  <tr>
                    <th className="px-4 py-3">Khóa học</th>
                    <th className="px-4 py-3">Giá</th>
                    <th className="px-4 py-3">SL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 font-medium">{item.courseName}</td>
                      <td className="px-4 py-3">{formatMoney(item.price)}</td>
                      <td className="px-4 py-3">{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </AdminPanel>

          <AdminPanel title="Quyền học" bodyClassName="p-4">
            <OrderEnrollmentsPanel
              orderId={order.id}
              orderStatus={order.status}
              enrollments={enrollments}
            />
          </AdminPanel>

          <AdminPanel title="Giao dịch" bodyClassName="px-4 py-1">
            {transaction ? (
              <dl>
                <Row label="Mã GD">
                  <span className="font-mono text-xs break-all">
                    {transaction.txnRef}
                  </span>
                </Row>
                <Row label="Số tiền">{formatMoney(transaction.amount)}</Row>
                <Row label="Trạng thái GD">{transaction.status}</Row>
                <Row label="Thanh toán lúc">
                  {formatDate(transaction.paidAt)}
                </Row>
              </dl>
            ) : (
              <p className="py-4 text-sm text-slate-500">
                Chưa có transaction gắn với đơn.
              </p>
            )}
          </AdminPanel>

          <AdminPanel title="Timeline" bodyClassName="p-4">
            {timeline.length === 0 ? (
              <p className="text-sm text-slate-500">Chưa có sự kiện.</p>
            ) : (
              <ol className="space-y-2">
                {timeline.map((ev) => (
                  <li
                    key={`${ev.type}-${ev.at}`}
                    className="flex gap-3 text-sm"
                  >
                    <span className="shrink-0 text-slate-500">
                      {formatDate(ev.at)}
                    </span>
                    <span className="text-slate-900 dark:text-slate-100">
                      {ev.label}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </AdminPanel>
        </div>

        <div className="space-y-4">
          <AdminPanel title="Khách hàng" bodyClassName="px-4 py-1">
            <dl>
              <Row label="Họ tên">
                {order.customerName || user?.userName || "—"}
              </Row>
              <Row label="Email">
                {order.customerEmail || user?.email || "—"}
              </Row>
              <Row label="SĐT">{order.customerPhone || "—"}</Row>
              <Row label="User ID">
                <Link
                  href={`/users/${order.userId}`}
                  className="text-[#0070EB] hover:underline"
                >
                  {order.userId}
                </Link>
              </Row>
            </dl>
          </AdminPanel>

          <AdminPanel title="Thao tác" bodyClassName="p-4">
            <OrderStatusActions orderId={order.id} status={order.status} />
          </AdminPanel>

          <AdminPanel title="Nhật ký" bodyClassName="p-4">
            {auditLogs.length === 0 ? (
              <p className="text-sm text-slate-500">Chưa có audit log.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {auditLogs.map((log) => (
                  <li key={log.id} className="border-b border-slate-100 pb-2 last:border-0 dark:border-slate-800">
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      {log.action}
                    </div>
                    <div className="text-xs text-slate-500">
                      {formatDate(log.createdAt)}
                      {log.actorUserId ? ` · actor #${log.actorUserId}` : ""}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </AdminPanel>
        </div>
      </div>
    </div>
  );
}
