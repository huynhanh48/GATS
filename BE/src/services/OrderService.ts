import { randomBytes } from 'crypto';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import EnvVars from '@src/common/constants/env';
import {
  getOrderPaymentExpiresAt,
  isOrderPaymentExpired,
  ORDER_PAYMENT_TTL_MS,
} from '@src/common/constants/order-payment';
import { RouteError } from '@src/common/utils/route-errors';
import { toSepayTransferContent } from '@src/common/utils/sepay';
import {
  buildSepayCheckoutFields,
  getSepayCheckoutInitUrl,
  isSepayPgConfigured,
} from '@src/common/utils/sepay-pg';
import type { PaymentBankAccount } from '@src/models/BankAccount.model';
import type {
  CreateOrderInput,
  OrderDetail,
  OrderStatus,
} from '@src/models/Order.model';
import type { PaymentExceptionType } from '@src/db/schema/payment-exception';
import * as AuditLogRepo from '@src/repos/AuditLogRepo';
import * as CartRepo from '@src/repos/CartRepo';
import * as CourseRepo from '@src/repos/CourseRepo';
import * as EnrollmentRepo from '@src/repos/EnrollmentRepo';
import * as OrderRepo from '@src/repos/OrderRepo';
import * as PaymentExceptionRepo from '@src/repos/PaymentExceptionRepo';
import * as TransactionRepo from '@src/repos/TransactionRepo';
import * as UserRepo from '@src/repos/UserRepo';
import BankAccountService from '@src/services/BankAccountService';
import CartService from '@src/services/CartService';
import CouponService from '@src/services/CouponService';
import EnrollmentService from '@src/services/EnrollmentService';
import NotificationService from '@src/services/NotificationService';
import { mailService } from '@src/common/utils/mail';
import logger from 'jet-logger';

function frontendOrigin(): string {
  return EnvVars.FrontendUrl.split(',')[0]?.trim().replace(/\/$/, '') || '';
}

async function sendOrderLifecycleEmail(
  kind: 'created' | 'paid' | 'expired',
  order: {
    id: string;
    userId: number;
    totalAmount: number;
    customerEmail?: string | null;
    items?: Array<{ courseName?: string | null; courseId: string }>;
  },
) {
  try {
    const user = await UserRepo.findById(order.userId);
    const to = order.customerEmail || user?.email;
    if (!to) return;

    const courseNames =
      order.items
        ?.map((item) => item.courseName || item.courseId)
        .filter(Boolean)
        .join(', ') || 'Khóa học';
    const amountLabel = `${order.totalAmount.toLocaleString('vi-VN')} đ`;
    const userName = user?.userName || 'học viên';
    const origin = frontendOrigin();

    if (kind === 'created') {
      await mailService.sendOrderEmail({
        to,
        userName,
        subject: 'Đơn hàng đang chờ thanh toán - GATS Academy',
        templateName: 'order-created.html',
        orderId: order.id,
        amountLabel,
        courseNames,
      });
      return;
    }

    if (kind === 'paid') {
      await mailService.sendOrderEmail({
        to,
        userName,
        subject: 'Thanh toán thành công - GATS Academy',
        templateName: 'order-paid.html',
        orderId: order.id,
        amountLabel,
        courseNames,
        actionUrl: `${origin}/learning`,
      });
      return;
    }

    await mailService.sendOrderEmail({
      to,
      userName,
      subject: 'Đơn hàng hết hạn thanh toán - GATS Academy',
      templateName: 'order-expired.html',
      orderId: order.id,
      amountLabel,
      courseNames,
      actionUrl: `${origin}/cart`,
    });
  } catch (error) {
    logger.err(`Failed to send order ${kind} email`);
    logger.err(error);
  }
}

const Errors = {
  EMPTY_CART: 'Cart is empty',
  COURSE_NOT_FOUND: 'Course not found',
  NOT_PUBLISHED: 'Course is not published',
  NOT_PAID_COURSE: 'Course is not a paid course',
  ALREADY_ENROLLED: 'Already enrolled in this course',
  ORDER_NOT_FOUND: 'Order not found',
  FORBIDDEN: 'Forbidden',
  NOT_PENDING: 'Only pending orders can be cancelled',
  INVALID_ITEMS: 'Order items are required',
  INVALID_STATUS_TRANSITION: 'Invalid status transition',
  PAYMENT_EXPIRED: 'Payment window expired',
} as const;

/** Alphanumeric txnRef so bank/Sepay SEVQR matching stays stable. */
function generateTxnRef(): string {
  return `ORD${Date.now()}${randomBytes(3).toString('hex').toUpperCase()}`;
}

/**
 * Same QR builder pattern as Web_HuynhAnh Ecommerce:
 * des=SEVQR{txnRef}
 * Bank account: DB default if configured, else env BANK_*.
 */
function buildSepayQrUrl(
  amount: number,
  txnRef: string,
  bank: PaymentBankAccount,
): string {
  const transferContent = toSepayTransferContent(txnRef);
  const params = new URLSearchParams({
    bank: bank.bankCode,
    acc: bank.accountNumber,
    template: 'compact',
    amount: String(amount),
    des: transferContent,
  });
  return `https://qr.sepay.vn/img?${params.toString()}`;
}

async function resolveCheckoutItems(
  userId: number,
  input: CreateOrderInput,
): Promise<Array<{ courseId: string; quantity: number }>> {
  if (input.items && input.items.length > 0) {
    return input.items.map((item) => ({
      courseId: item.courseId,
      quantity: 1,
    }));
  }

  if (!input.fromCart) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.INVALID_ITEMS);
  }

  const cart = await CartRepo.findOrCreateCart(userId);
  const items = await CartRepo.listItemsByCartId(cart.id);
  if (items.length === 0) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.EMPTY_CART);
  }

  return items.map((item) => ({
    courseId: item.courseId,
    quantity: 1,
  }));
}

async function createOrder(userId: number, input: CreateOrderInput) {
  const checkoutItems = await resolveCheckoutItems(userId, input);

  const prepared: Array<{
    courseId: string;
    courseName: string;
    price: number;
    quantity: number;
  }> = [];

  for (const item of checkoutItems) {
    const course = await CourseRepo.findById(item.courseId);
    if (!course) {
      throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.COURSE_NOT_FOUND);
    }
    if (course.status !== 'published') {
      throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.NOT_PUBLISHED);
    }

    const unit = CartService.finalPrice(course.price, course.salePrice);
    if (unit <= 0) {
      throw new RouteError(
        HttpStatusCodes.BAD_REQUEST,
        Errors.NOT_PAID_COURSE,
      );
    }

    const enrolled = await EnrollmentRepo.findActive(userId, item.courseId);
    if (enrolled) {
      throw new RouteError(HttpStatusCodes.CONFLICT, Errors.ALREADY_ENROLLED);
    }

    prepared.push({
      courseId: course.id,
      courseName: course.title,
      price: unit,
      quantity: 1,
    });
  }

  const subtotal = prepared.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  let discountAmount = 0;
  let appliedCouponId: string | null = null;
  let appliedCouponCode: string | null = null;
  if (input.couponCode) {
    const { coupon, discountAmount: computed } = await CouponService.validate(
      input.couponCode,
      subtotal,
    );
    discountAmount = computed;
    appliedCouponId = coupon.id;
    appliedCouponCode = coupon.code;
  }

  const totalAmount = Math.max(0, subtotal - discountAmount);

  const order = await OrderRepo.createOrderWithItems(
    {
      userId,
      totalAmount,
      status: 'pending',
      paymentMethod: input.paymentMethod,
      customerName: input.customerName ?? null,
      customerEmail: input.customerEmail ?? null,
      customerPhone: input.customerPhone ?? null,
      notes: input.notes ?? null,
      couponId: appliedCouponId,
      couponCode: appliedCouponCode,
      discountAmount,
    },
    prepared.map((item) => ({
      courseId: item.courseId,
      courseName: item.courseName,
      price: item.price,
      quantity: item.quantity,
    })),
  );

  if (appliedCouponId) {
    await CouponService.commitRedemption(
      appliedCouponId,
      discountAmount,
      order.id,
      userId,
    );
  }

  const cart = await CartRepo.findCartByUserId(userId);
  if (cart) {
    await CartRepo.removeItemsByCourseIds(
      cart.id,
      prepared.map((item) => item.courseId),
    );
    await CartRepo.touchCart(cart.id);
  }

  const txnRef = generateTxnRef();
  const transaction = await TransactionRepo.create({
    orderId: order.id,
    txnRef,
    amount: totalAmount,
    paymentMethod: input.paymentMethod,
    status: 'pending',
  });

  if (input.paymentMethod === 'wallet') {
    const paid = await processSuccessfulPayment(order.id, {
      txnRef,
      gatewayResponse: { source: 'wallet' },
    });
    return {
      order: paid.order,
      transaction: paid.transaction,
      payment: {
        method: 'wallet' as const,
        status: 'success' as const,
      },
    };
  }

  if (input.paymentMethod === 'bank_transfer') {
    const expiresAt = getOrderPaymentExpiresAt(order.createdAt);
    void sendOrderLifecycleEmail('created', {
      ...order,
      items: prepared.map((item) => ({
        courseId: item.courseId,
        courseName: item.courseName,
      })),
    });

    // SePay Payment Gateway (merchant_id + secret_key) — redirect checkout
    if (isSepayPgConfigured()) {
      const frontend = EnvVars.FrontendUrl.replace(/\/$/, '');
      const successUrl = `${frontend}/checkout/result?status=paid&orderId=${order.id}&txnRef=${encodeURIComponent(txnRef)}`;
      const errorUrl = `${frontend}/checkout/result?status=failed&orderId=${order.id}&txnRef=${encodeURIComponent(txnRef)}`;
      const cancelUrl = `${frontend}/checkout/result?status=cancelled&orderId=${order.id}&txnRef=${encodeURIComponent(txnRef)}`;
      const courseLabel =
        prepared.map((p) => p.courseName).join(', ').slice(0, 200) ||
        'GATS Academy';
      const checkoutFields = buildSepayCheckoutFields({
        invoiceNumber: txnRef,
        amount: totalAmount,
        description: `Thanh toan ${courseLabel}`,
        customerId: String(userId),
        successUrl,
        errorUrl,
        cancelUrl,
      });

      return {
        order,
        transaction,
        payment: {
          method: 'bank_transfer' as const,
          status: 'pending' as const,
          provider: 'sepay_pg' as const,
          txnRef,
          amount: totalAmount,
          checkoutUrl: getSepayCheckoutInitUrl(),
          checkoutFields,
          expiresAt: expiresAt.toISOString(),
          expiresInMs: ORDER_PAYMENT_TTL_MS,
        },
      };
    }

    // Legacy: VietQR image + SEVQR content (requires bank account + optional SEPAY_API_KEY)
    const bank = await BankAccountService.resolvePaymentBankAccount();
    const transferContent = toSepayTransferContent(txnRef);
    return {
      order,
      transaction,
      payment: {
        method: 'bank_transfer' as const,
        status: 'pending' as const,
        provider: 'sepay_qr' as const,
        txnRef,
        amount: totalAmount,
        qrUrl: buildSepayQrUrl(totalAmount, txnRef, bank),
        transferContent,
        expiresAt: expiresAt.toISOString(),
        expiresInMs: ORDER_PAYMENT_TTL_MS,
        bankAccountId: bank.id,
        bankAccountSource: bank.source,
        bankAccountNumber: bank.accountNumber,
        bankName: bank.bankName,
        bankAccountName: bank.accountHolder,
        bankLabel: bank.label,
      },
    };
  }

  // VNPay / MoMo placeholders — full gateway integration later
  return {
    order,
    transaction,
    payment: {
      method: input.paymentMethod,
      status: 'pending' as const,
      txnRef,
      amount: totalAmount,
      paymentUrl: null as string | null,
      message:
        input.paymentMethod === 'vnpay'
          ? 'VNPay integration pending — use bank_transfer for now'
          : 'MoMo integration pending — use bank_transfer for now',
    },
  };
}

async function processSuccessfulPayment(
  orderId: string,
  data: {
    txnRef?: string;
    gatewayResponse?: unknown;
    /** Admin manual confirm may ignore the 30-minute QR window */
    skipExpiryCheck?: boolean;
    /**
     * SePay webhook/poll: allow completing a cancelled order when bank credit
     * already matched SEVQR + exact amount (late payment after TTL).
     */
    allowLatePayment?: boolean;
  } = {},
) {
  const order = await OrderRepo.findByIdWithItems(orderId);
  if (!order) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.ORDER_NOT_FOUND);
  }

  if (order.status === 'paid') {
    const transaction = data.txnRef
      ? await TransactionRepo.findByTxnRef(data.txnRef)
      : await TransactionRepo.findByOrderId(orderId);
    return { order, transaction, lateRecovered: false as const };
  }

  const isLateCancelled =
    order.status === 'cancelled' && Boolean(data.allowLatePayment);

  if (order.status !== 'pending' && !isLateCancelled) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      'Order is not payable',
    );
  }

  if (order.status === 'pending' && !data.skipExpiryCheck && !data.allowLatePayment) {
    await assertPaymentWindowOpen(orderId);
  }

  const updatedOrder = await OrderRepo.markPaid(
    orderId,
    order.paymentMethod ?? undefined,
  );

  let transaction = data.txnRef
    ? await TransactionRepo.findByTxnRef(data.txnRef)
    : await TransactionRepo.findByOrderId(orderId);

  if (transaction) {
    transaction = await TransactionRepo.markSuccess(
      transaction.txnRef,
      data.gatewayResponse,
    );
  }

  for (const item of order.items) {
    try {
      await EnrollmentService.createPaidEnrollment(order.userId, item.courseId);
    } catch (err) {
      // Ignore already-enrolled to keep payment idempotent
      if (
        !(err instanceof RouteError) ||
        err.status !== HttpStatusCodes.CONFLICT
      ) {
        throw err;
      }
    }
  }

  const courseTitles = order.items
    .map((item) => item.courseName || item.courseId)
    .join(', ');
  void NotificationService.notify({
    type: 'order_paid',
    title: `Đơn hàng đã thanh toán`,
    body: `${order.totalAmount.toLocaleString('vi-VN')} đ · ${courseTitles}`,
    href: `/orders/${orderId}`,
    entityId: orderId,
  });

  void sendOrderLifecycleEmail('paid', {
    ...order,
    totalAmount: order.totalAmount,
  });

  const fresh = await OrderRepo.findByIdWithItems(orderId);
  return {
    order: fresh ?? ({ ...order, ...updatedOrder } as OrderDetail),
    transaction,
    lateRecovered: isLateCancelled,
  };
}

async function listOrders(userId: number) {
  const orders = await OrderRepo.listByUserId(userId);
  const items = await OrderRepo.listItemsByOrderIds(orders.map((o) => o.id));
  const byOrder = new Map<string, typeof items>();
  for (const item of items) {
    const list = byOrder.get(item.orderId) ?? [];
    list.push(item);
    byOrder.set(item.orderId, list);
  }

  const withTxn = await Promise.all(
    orders.map(async (order) => {
      const transaction = await TransactionRepo.findByOrderId(order.id);
      return {
        ...order,
        items: byOrder.get(order.id) ?? [],
        txnRef: transaction?.txnRef ?? null,
        txnStatus: transaction?.status ?? null,
        expiresAt: getOrderPaymentExpiresAt(order.createdAt).toISOString(),
      };
    }),
  );

  return { data: withTxn };
}

async function getOrderById(userId: number, orderId: string) {
  const order = await OrderRepo.findByIdWithItems(orderId);
  if (!order) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.ORDER_NOT_FOUND);
  }
  if (order.userId !== userId) {
    throw new RouteError(HttpStatusCodes.FORBIDDEN, Errors.FORBIDDEN);
  }

  const transaction = await TransactionRepo.findByOrderId(orderId);
  return { order, transaction: transaction ?? null };
}

async function cancelOrder(userId: number, orderId: string) {
  const order = await OrderRepo.findById(orderId);
  if (!order) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.ORDER_NOT_FOUND);
  }
  if (order.userId !== userId) {
    throw new RouteError(HttpStatusCodes.FORBIDDEN, Errors.FORBIDDEN);
  }
  if (order.status !== 'pending') {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.NOT_PENDING);
  }

  const cancelled = await OrderRepo.cancelIfPending(orderId, userId);
  if (!cancelled) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.NOT_PENDING);
  }

  const transaction = await TransactionRepo.findByOrderId(orderId);
  if (transaction && transaction.status === 'pending') {
    await TransactionRepo.updateByTxnRef(transaction.txnRef, {
      status: 'failed',
      gatewayResponse: { reason: 'order_cancelled' },
    });
  }

  return { order: cancelled };
}

/**
 * Cancel pending order if payment window (30m) has passed.
 * Returns cancelled order, or null if still valid / not pending.
 */
async function expirePendingOrderIfNeeded(orderId: string) {
  const order = await OrderRepo.findByIdWithItems(orderId);
  if (!order || order.status !== 'pending') return null;
  if (!isOrderPaymentExpired(order.createdAt)) return null;

  const cancelled = await OrderRepo.cancelIfPendingById(orderId);
  if (!cancelled) return null;

  const transaction = await TransactionRepo.findByOrderId(orderId);
  if (transaction && transaction.status === 'pending') {
    await TransactionRepo.updateByTxnRef(transaction.txnRef, {
      status: 'failed',
      gatewayResponse: {
        reason: 'payment_expired',
        ttlMs: ORDER_PAYMENT_TTL_MS,
      },
    });
  }

  void sendOrderLifecycleEmail('expired', order);

  return cancelled;
}

/** Throws if pending order is past payment TTL (also cancels it). */
async function assertPaymentWindowOpen(orderId: string) {
  const expired = await expirePendingOrderIfNeeded(orderId);
  if (expired) {
    throw new RouteError(HttpStatusCodes.GONE, Errors.PAYMENT_EXPIRED);
  }
}

async function adminListOrders(query: {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  q?: string;
  expiredPending?: boolean;
}) {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(100, Math.max(1, query.limit ?? 20));
  const skip = (page - 1) * limit;

  const [{ data, total }, counts] = await Promise.all([
    OrderRepo.listAdmin({
      skip,
      take: limit,
      status: query.expiredPending ? 'pending' : query.status,
      q: query.q,
      expiredBefore: query.expiredPending
        ? new Date(Date.now() - ORDER_PAYMENT_TTL_MS)
        : undefined,
    }),
    OrderRepo.countByStatus(),
  ]);

  const orderIds = data.map((row) => row.order.id);
  const items = await OrderRepo.listItemsByOrderIds(orderIds);
  const byOrder = new Map<string, typeof items>();
  for (const item of items) {
    const list = byOrder.get(item.orderId) ?? [];
    list.push(item);
    byOrder.set(item.orderId, list);
  }

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    data: data.map((row) => ({
      ...row.order,
      items: byOrder.get(row.order.id) ?? [],
      userName: row.userName,
      userEmail: row.userEmail,
      txnRef: row.txnRef,
      txnStatus: row.txnStatus,
      expiresAt: getOrderPaymentExpiresAt(row.order.createdAt).toISOString(),
      isExpiredPending:
        row.order.status === 'pending' &&
        isOrderPaymentExpired(row.order.createdAt),
    })),
    counts,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
  };
}

function mapEnrollmentUiStatus(
  enrollment: Awaited<ReturnType<typeof EnrollmentRepo.findByUserAndCourse>>,
): 'active' | 'missing' | 'revoked' | 'expired' {
  if (!enrollment) return 'missing';
  if (enrollment.status === 'cancelled') return 'revoked';
  if (enrollment.status === 'expired') return 'expired';
  if (enrollment.expiredAt && enrollment.expiredAt.getTime() <= Date.now()) {
    return 'expired';
  }
  if (enrollment.status === 'active') return 'active';
  return 'missing';
}

async function buildOrderEnrollments(order: OrderDetail) {
  const enrollments = [];
  for (const item of order.items) {
    const enrollment = await EnrollmentRepo.findByUserAndCourse(
      order.userId,
      item.courseId,
    );
    enrollments.push({
      courseId: item.courseId,
      courseName: item.courseName,
      enrollmentId: enrollment?.id ?? null,
      status: mapEnrollmentUiStatus(enrollment),
      source: enrollment?.source ?? null,
    });
  }
  return enrollments;
}

function buildOrderTimeline(
  order: OrderDetail,
  transaction: Awaited<ReturnType<typeof TransactionRepo.findByOrderId>>,
) {
  const events: Array<{ type: string; at: string; label: string }> = [
    {
      type: 'created',
      at: order.createdAt.toISOString(),
      label: 'Tạo đơn',
    },
  ];
  if (order.paidAt) {
    events.push({
      type: 'paid',
      at: order.paidAt.toISOString(),
      label: 'Thanh toán thành công',
    });
  }
  if (order.status === 'cancelled') {
    events.push({
      type: 'cancelled',
      at: order.updatedAt.toISOString(),
      label: 'Đã hủy',
    });
  }
  if (order.status === 'refunded') {
    events.push({
      type: 'refunded',
      at: order.updatedAt.toISOString(),
      label: 'Hoàn tiền',
    });
  }
  if (transaction?.paidAt) {
    events.push({
      type: 'txn_paid',
      at: transaction.paidAt.toISOString(),
      label: `GD ${transaction.status}`,
    });
  } else if (transaction && transaction.status === 'failed') {
    events.push({
      type: 'txn_failed',
      at: transaction.updatedAt.toISOString(),
      label: 'Giao dịch thất bại / hết hạn',
    });
  }
  return events.sort(
    (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime(),
  );
}

async function adminGetOrder(orderId: string) {
  const order = await OrderRepo.findByIdWithItems(orderId);
  if (!order) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.ORDER_NOT_FOUND);
  }

  const [transaction, user, enrollments, auditLogs] = await Promise.all([
    TransactionRepo.findByOrderId(orderId),
    UserRepo.findById(order.userId),
    buildOrderEnrollments(order),
    AuditLogRepo.listByResource({
      resourceType: 'order',
      resourceId: orderId,
      limit: 30,
    }),
  ]);

  return {
    order,
    transaction: transaction ?? null,
    user: user
      ? {
          id: user.id,
          userName: user.userName,
          email: user.email,
          isLocked: user.isLocked,
        }
      : null,
    enrollments,
    timeline: buildOrderTimeline(order, transaction ?? undefined),
    auditLogs: auditLogs.map((log) => ({
      id: log.id,
      action: log.action,
      actorUserId: log.actorUserId,
      meta: log.meta,
      createdAt: log.createdAt,
    })),
  };
}

async function adminUpdateOrderStatus(
  orderId: string,
  nextStatus: 'paid' | 'cancelled' | 'refunded',
  actorUserId?: number,
  reason?: string,
) {
  const order = await OrderRepo.findByIdWithItems(orderId);
  if (!order) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.ORDER_NOT_FOUND);
  }

  const reasonMeta = reason?.trim()
    ? { reason: reason.trim() }
    : ({} as Record<string, unknown>);

  if (nextStatus === 'paid') {
    if (order.status === 'paid') {
      return {
        order,
        transaction: (await TransactionRepo.findByOrderId(orderId)) ?? null,
        message: 'Đơn đã thanh toán (idempotent)',
      };
    }
    if (order.status !== 'pending' && order.status !== 'cancelled') {
      throw new RouteError(
        HttpStatusCodes.BAD_REQUEST,
        Errors.INVALID_STATUS_TRANSITION,
      );
    }
    const result = await processSuccessfulPayment(orderId, {
      gatewayResponse: { source: 'admin_manual_confirm', ...reasonMeta },
      skipExpiryCheck: true,
      allowLatePayment: order.status === 'cancelled',
    });
    await AuditLogRepo.record({
      actorUserId,
      action: 'order.paid',
      resourceType: 'order',
      resourceId: orderId,
      meta: { source: 'admin_manual_confirm', ...reasonMeta },
    });
    return {
      order: result.order,
      transaction: result.transaction ?? null,
      message: 'Đã xác nhận thanh toán và kích hoạt khóa học',
    };
  }

  if (nextStatus === 'cancelled') {
    if (order.status === 'cancelled') {
      return {
        order,
        transaction: (await TransactionRepo.findByOrderId(orderId)) ?? null,
        message: 'Đơn đã hủy (idempotent)',
      };
    }
    if (order.status !== 'pending') {
      throw new RouteError(
        HttpStatusCodes.BAD_REQUEST,
        Errors.INVALID_STATUS_TRANSITION,
      );
    }
    const cancelled = await OrderRepo.cancelIfPendingById(orderId);
    if (!cancelled) {
      throw new RouteError(
        HttpStatusCodes.BAD_REQUEST,
        Errors.INVALID_STATUS_TRANSITION,
      );
    }
    const transaction = await TransactionRepo.findByOrderId(orderId);
    if (transaction && transaction.status === 'pending') {
      await TransactionRepo.updateByTxnRef(transaction.txnRef, {
        status: 'failed',
        gatewayResponse: { reason: 'admin_cancelled', ...reasonMeta },
      });
    }
    await AuditLogRepo.record({
      actorUserId,
      action: 'order.cancelled',
      resourceType: 'order',
      resourceId: orderId,
      meta: { ...reasonMeta },
    });
    return {
      order: cancelled,
      transaction: (await TransactionRepo.findByOrderId(orderId)) ?? null,
      message: 'Đã hủy đơn hàng',
    };
  }

  if (order.status === 'refunded') {
    return {
      order,
      transaction: (await TransactionRepo.findByOrderId(orderId)) ?? null,
      message: 'Đơn đã hoàn tiền (idempotent)',
    };
  }

  if (order.status !== 'paid') {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      Errors.INVALID_STATUS_TRANSITION,
    );
  }
  const refunded = await OrderRepo.updateStatus(orderId, 'refunded');
  if (!refunded) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.ORDER_NOT_FOUND);
  }
  const transaction = await TransactionRepo.findByOrderId(orderId);
  if (transaction) {
    await TransactionRepo.updateByTxnRef(transaction.txnRef, {
      gatewayResponse: {
        ...(typeof transaction.gatewayResponse === 'object' &&
        transaction.gatewayResponse
          ? (transaction.gatewayResponse as Record<string, unknown>)
          : {}),
        refundedAt: new Date().toISOString(),
        reason: 'admin_refund',
        ...reasonMeta,
      },
    });
  }

  const revoked: string[] = [];
  for (const item of order.items) {
    const updated = await EnrollmentRepo.updateByUserAndCourse(
      order.userId,
      item.courseId,
      { status: 'cancelled' },
    );
    if (updated) revoked.push(item.courseId);
  }

  await AuditLogRepo.record({
    actorUserId,
    action: 'order.refunded',
    resourceType: 'order',
    resourceId: orderId,
    meta: { revokedCourseIds: revoked, ...reasonMeta },
  });

  return {
    order: refunded,
    transaction: (await TransactionRepo.findByOrderId(orderId)) ?? null,
    message: `Đã hoàn tiền và thu hồi quyền học (${revoked.length} khóa)`,
  };
}

async function adminRepairEnrollment(
  orderId: string,
  actorUserId?: number,
  reason?: string,
) {
  const order = await OrderRepo.findByIdWithItems(orderId);
  if (!order) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.ORDER_NOT_FOUND);
  }
  if (order.status !== 'paid') {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      'Chỉ cấp lại quyền cho đơn đã thanh toán',
    );
  }

  const repaired: string[] = [];
  for (const item of order.items) {
    const current = await EnrollmentRepo.findByUserAndCourse(
      order.userId,
      item.courseId,
    );
    if (mapEnrollmentUiStatus(current) === 'active') continue;
    await EnrollmentRepo.grant(order.userId, item.courseId, 'admin_granted');
    repaired.push(item.courseId);
  }

  await AuditLogRepo.record({
    actorUserId,
    action: 'enrollment.repaired',
    resourceType: 'order',
    resourceId: orderId,
    meta: {
      repairedCourseIds: repaired,
      ...(reason?.trim() ? { reason: reason.trim() } : {}),
    },
  });

  const fresh = await OrderRepo.findByIdWithItems(orderId);
  return {
    repairedCount: repaired.length,
    enrollments: fresh ? await buildOrderEnrollments(fresh) : [],
    message:
      repaired.length > 0
        ? `Đã cấp lại quyền cho ${repaired.length} khóa`
        : 'Tất cả khóa đã có quyền active',
  };
}

async function adminListExceptions(query: {
  page?: number;
  limit?: number;
  type?: PaymentExceptionType;
  resolved?: boolean;
}) {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(100, Math.max(1, query.limit ?? 20));
  const skip = (page - 1) * limit;

  const { data, total } = await PaymentExceptionRepo.list({
    skip,
    take: limit,
    type: query.type,
    resolved: query.resolved,
  });

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
  };
}

async function adminResolveException(
  exceptionId: string,
  actorUserId: number,
  note?: string,
) {
  const existing = await PaymentExceptionRepo.findById(exceptionId);
  if (!existing) {
    throw new RouteError(
      HttpStatusCodes.NOT_FOUND,
      'Payment exception not found',
    );
  }

  const resolved = await PaymentExceptionRepo.resolve(
    exceptionId,
    actorUserId,
    note,
  );

  await AuditLogRepo.record({
    actorUserId,
    action: 'payment_exception.resolved',
    resourceType: 'payment_exception',
    resourceId: exceptionId,
    meta: note?.trim() ? { note: note.trim() } : null,
  });

  return { exception: resolved, message: 'Đã đánh dấu xử lý xong' };
}

function csvEscape(value: unknown): string {
  const str = value === null || value === undefined ? '' : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

async function adminExportOrdersCsv(query: {
  status?: OrderStatus;
  q?: string;
}) {
  const rows = await OrderRepo.listForExport({
    status: query.status,
    q: query.q,
    limit: 5000,
  });

  const header = [
    'Mã đơn',
    'Thời gian tạo',
    'Trạng thái',
    'Khách hàng',
    'Email',
    'SĐT',
    'Số tiền',
    'Phương thức',
    'Mã GD',
    'Trạng thái GD',
    'Thanh toán lúc',
  ];

  const lines = [header.map(csvEscape).join(',')];
  for (const row of rows) {
    lines.push(
      [
        row.order.id,
        row.order.createdAt.toISOString(),
        row.order.status,
        row.order.customerName || row.userName || '',
        row.order.customerEmail || row.userEmail || '',
        row.order.customerPhone || '',
        row.order.totalAmount,
        row.order.paymentMethod || '',
        row.txnRef || '',
        row.txnStatus || '',
        row.order.paidAt ? row.order.paidAt.toISOString() : '',
      ]
        .map(csvEscape)
        .join(','),
    );
  }

  return {
    csv: '\uFEFF' + lines.join('\n'),
    filename: `orders-${new Date().toISOString().slice(0, 10)}.csv`,
  };
}

async function adminExpireStalePending(actorUserId?: number) {
  const { data } = await OrderRepo.listAdmin({
    skip: 0,
    take: 100,
    status: 'pending',
    expiredBefore: new Date(Date.now() - ORDER_PAYMENT_TTL_MS),
  });

  let expired = 0;
  for (const row of data) {
    const result = await expirePendingOrderIfNeeded(row.order.id);
    if (result) {
      expired += 1;
      await AuditLogRepo.record({
        actorUserId,
        action: 'order.expired',
        resourceType: 'order',
        resourceId: row.order.id,
        meta: { source: 'admin_expire_stale' },
      });
    }
  }

  return {
    expired,
    message: `Đã hủy ${expired} đơn pending quá hạn`,
  };
}

export default {
  Errors,
  createOrder,
  processSuccessfulPayment,
  listOrders,
  getOrderById,
  cancelOrder,
  expirePendingOrderIfNeeded,
  assertPaymentWindowOpen,
  adminListOrders,
  adminGetOrder,
  adminUpdateOrderStatus,
  adminRepairEnrollment,
  adminExpireStalePending,
  adminListExceptions,
  adminResolveException,
  adminExportOrdersCsv,
  generateTxnRef,
  buildSepayQrUrl,
};
