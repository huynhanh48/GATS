import { randomBytes } from 'crypto';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import type { PaymentBankAccount } from '@src/models/BankAccount.model';
import type { CreateOrderInput, OrderDetail } from '@src/models/Order.model';
import * as CartRepo from '@src/repos/CartRepo';
import * as CourseRepo from '@src/repos/CourseRepo';
import * as EnrollmentRepo from '@src/repos/EnrollmentRepo';
import * as OrderRepo from '@src/repos/OrderRepo';
import * as TransactionRepo from '@src/repos/TransactionRepo';
import BankAccountService from '@src/services/BankAccountService';
import CartService from '@src/services/CartService';
import EnrollmentService from '@src/services/EnrollmentService';
import { toSepayTransferContent } from '@src/common/utils/sepay';

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

  const totalAmount = prepared.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

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
    },
    prepared.map((item) => ({
      courseId: item.courseId,
      courseName: item.courseName,
      price: item.price,
      quantity: item.quantity,
    })),
  );

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
    const bank = await BankAccountService.resolvePaymentBankAccount();
    const transferContent = toSepayTransferContent(txnRef);
    return {
      order,
      transaction,
      payment: {
        method: 'bank_transfer' as const,
        status: 'pending' as const,
        txnRef,
        amount: totalAmount,
        qrUrl: buildSepayQrUrl(totalAmount, txnRef, bank),
        transferContent,
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
  data: { txnRef?: string; gatewayResponse?: unknown } = {},
) {
  const order = await OrderRepo.findByIdWithItems(orderId);
  if (!order) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.ORDER_NOT_FOUND);
  }

  if (order.status === 'paid') {
    const transaction = data.txnRef
      ? await TransactionRepo.findByTxnRef(data.txnRef)
      : await TransactionRepo.findByOrderId(orderId);
    return { order, transaction };
  }

  if (order.status !== 'pending') {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      'Order is not payable',
    );
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

  const fresh = await OrderRepo.findByIdWithItems(orderId);
  return {
    order: fresh ?? ({ ...order, ...updatedOrder } as OrderDetail),
    transaction,
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

  return {
    data: orders.map((order) => ({
      ...order,
      items: byOrder.get(order.id) ?? [],
    })),
  };
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

export default {
  Errors,
  createOrder,
  processSuccessfulPayment,
  listOrders,
  getOrderById,
  cancelOrder,
  generateTxnRef,
  buildSepayQrUrl,
};
