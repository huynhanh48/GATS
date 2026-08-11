"use server";

import { revalidatePath } from "next/cache";
import { beFetch } from "@/lib/api/server";

export type OrderStatus =
  | "pending"
  | "paid"
  | "cancelled"
  | "refund_pending"
  | "refunded";

export type AdminOrderItem = {
  id: string;
  orderId: string;
  courseId: string;
  courseName: string;
  price: number;
  quantity: number;
  createdAt: string;
};

export type AdminOrderListItem = {
  id: string;
  userId: number;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: string | null;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  notes: string | null;
  paidAt: string | null;
  refundReasonCode?: string | null;
  refundReasonNote?: string | null;
  refundBankName?: string | null;
  refundAccountNumber?: string | null;
  refundAccountHolder?: string | null;
  refundRequestedAt?: string | null;
  refundCompletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  items: AdminOrderItem[];
  userName: string | null;
  userEmail: string | null;
  txnRef: string | null;
  txnStatus: string | null;
  expiresAt?: string;
  isExpiredPending?: boolean;
};

export type OrderCounts = {
  all: number;
  pending: number;
  paid: number;
  cancelled: number;
  refund_pending: number;
  refunded: number;
  expiredPending?: number;
};

export type AdminOrderListResponse = {
  data: AdminOrderListItem[];
  counts: OrderCounts;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
  error?: string | null;
};

export type EnrollmentRow = {
  courseId: string;
  courseName: string;
  enrollmentId: string | null;
  status: "active" | "missing" | "revoked" | "expired";
  source: string | null;
};

export type TimelineEvent = {
  type: string;
  at: string;
  label: string;
};

export type AuditLogRow = {
  id: string;
  action: string;
  actorUserId: number | null;
  meta: Record<string, unknown> | null;
  createdAt: string;
};

export type AdminOrderDetailResponse = {
  order: AdminOrderListItem & { items: AdminOrderItem[] };
  transaction: {
    id: string;
    orderId: string;
    txnRef: string;
    amount: number;
    paymentMethod: string | null;
    status: string;
    gatewayResponse: unknown;
    paidAt: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;
  user: {
    id: number;
    userName: string;
    email: string;
    isLocked?: boolean;
  } | null;
  enrollments?: EnrollmentRow[];
  timeline?: TimelineEvent[];
  auditLogs?: AuditLogRow[];
};

const emptyList = (
  limit: number,
  error?: string | null,
): AdminOrderListResponse => ({
  data: [],
  counts: {
    all: 0,
    pending: 0,
    paid: 0,
    cancelled: 0,
    refund_pending: 0,
    refunded: 0,
    expiredPending: 0,
  },
  pagination: {
    page: 1,
    limit,
    total: 0,
    totalPages: 0,
    hasMore: false,
  },
  error: error ?? null,
});

export async function fetchOrders(options: {
  page?: number;
  limit?: number;
  status?: OrderStatus | "all" | "expired";
  q?: string;
}): Promise<AdminOrderListResponse> {
  const page = options.page ?? 1;
  const limit = options.limit ?? 20;
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (options.status === "expired") {
    params.set("expiredPending", "1");
  } else if (options.status && options.status !== "all") {
    params.set("status", options.status);
  }
  if (options.q?.trim()) {
    params.set("q", options.q.trim());
  }

  const result = await beFetch<AdminOrderListResponse>(
    `/orders/admin?${params.toString()}`,
  );

  if (!result.ok || !result.data) {
    return emptyList(
      limit,
      result.error ?? "Không kết nối được máy chủ đơn hàng",
    );
  }

  return { ...result.data, error: null };
}

export async function fetchOrderDetail(
  orderId: string,
): Promise<AdminOrderDetailResponse | null> {
  const result = await beFetch<AdminOrderDetailResponse>(
    `/orders/admin/${orderId}`,
  );
  if (!result.ok || !result.data) return null;
  return result.data;
}

export type OrderReceiptResponse = {
  data: {
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
};

export async function fetchOrderReceipt(
  orderId: string,
): Promise<OrderReceiptResponse["data"] | null> {
  const result = await beFetch<OrderReceiptResponse>(
    `/orders/admin/${orderId}/receipt`,
  );
  if (!result.ok || !result.data?.data) return null;
  return result.data.data;
}

export type UpdateOrderStatusInput = {
  status: "paid" | "cancelled" | "refund_pending" | "refunded";
  reason?: string;
  reasonCode?: string;
  reasonNote?: string;
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
};

export async function updateOrderStatus(
  orderId: string,
  input: UpdateOrderStatusInput,
): Promise<{ ok: boolean; message?: string }> {
  const body: Record<string, string> = { status: input.status };
  if (input.reason?.trim()) body.reason = input.reason.trim();
  if (input.reasonCode) body.reasonCode = input.reasonCode;
  if (input.reasonNote?.trim()) body.reasonNote = input.reasonNote.trim();
  if (input.bankName?.trim()) body.bankName = input.bankName.trim();
  if (input.accountNumber?.trim())
    body.accountNumber = input.accountNumber.trim();
  if (input.accountHolder?.trim())
    body.accountHolder = input.accountHolder.trim();

  const result = await beFetch<{ message?: string }>(
    `/orders/admin/${orderId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    },
  );

  if (!result.ok) {
    return { ok: false, message: result.error ?? "Cập nhật thất bại" };
  }

  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
  return { ok: true, message: result.data?.message };
}

export async function repairOrderEnrollment(
  orderId: string,
  reason?: string,
): Promise<{ ok: boolean; message?: string }> {
  const result = await beFetch<{ message?: string }>(
    `/orders/admin/${orderId}/repair-enrollment`,
    {
      method: "POST",
      body: JSON.stringify({
        ...(reason?.trim() ? { reason: reason.trim() } : {}),
      }),
    },
  );

  if (!result.ok) {
    return { ok: false, message: result.error ?? "Cấp lại quyền thất bại" };
  }

  revalidatePath(`/orders/${orderId}`);
  return { ok: true, message: result.data?.message };
}

export async function expireStalePendingOrders(): Promise<{
  ok: boolean;
  message?: string;
}> {
  const result = await beFetch<{ message?: string }>(
    `/orders/admin/expire-stale`,
    { method: "POST" },
  );

  if (!result.ok) {
    return { ok: false, message: result.error ?? "Hủy đơn quá hạn thất bại" };
  }

  revalidatePath("/orders");
  return { ok: true, message: result.data?.message };
}

export type PaymentExceptionType =
  | "amount_mismatch"
  | "txn_ref_not_found"
  | "txn_ref_mismatch"
  | "txn_not_found"
  | "late_payment_recovered";

export type PaymentExceptionRow = {
  id: string;
  type: PaymentExceptionType;
  orderId: string | null;
  txnRef: string | null;
  expectedAmount: number | null;
  actualAmount: number | null;
  rawPayload: unknown;
  resolved: boolean;
  resolvedById: number | null;
  resolvedAt: string | null;
  resolutionNote: string | null;
  createdAt: string;
  orderCustomerName: string | null;
  orderCustomerEmail: string | null;
  orderTotalAmount: number | null;
};

export type AdminExceptionListResponse = {
  data: PaymentExceptionRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
  error?: string | null;
};

const emptyExceptionList = (
  limit: number,
  error?: string | null,
): AdminExceptionListResponse => ({
  data: [],
  pagination: { page: 1, limit, total: 0, totalPages: 0, hasMore: false },
  error: error ?? null,
});

export async function fetchPaymentExceptions(options: {
  page?: number;
  limit?: number;
  type?: PaymentExceptionType | "all";
  resolved?: "all" | "true" | "false";
}): Promise<AdminExceptionListResponse> {
  const page = options.page ?? 1;
  const limit = options.limit ?? 20;
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (options.type && options.type !== "all") {
    params.set("type", options.type);
  }
  if (options.resolved && options.resolved !== "all") {
    params.set("resolved", options.resolved);
  }

  const result = await beFetch<AdminExceptionListResponse>(
    `/orders/admin/exceptions?${params.toString()}`,
  );

  if (!result.ok || !result.data) {
    return emptyExceptionList(
      limit,
      result.error ?? "Không tải được danh sách ngoại lệ thanh toán",
    );
  }

  return { ...result.data, error: null };
}

export async function resolvePaymentException(
  exceptionId: string,
  note?: string,
): Promise<{ ok: boolean; message?: string }> {
  const result = await beFetch<{ message?: string }>(
    `/orders/admin/exceptions/${exceptionId}/resolve`,
    {
      method: "POST",
      body: JSON.stringify(note?.trim() ? { note: note.trim() } : {}),
    },
  );

  if (!result.ok) {
    return { ok: false, message: result.error ?? "Đánh dấu xử lý thất bại" };
  }

  revalidatePath("/orders/exceptions");
  return { ok: true, message: result.data?.message };
}
