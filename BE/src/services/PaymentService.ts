import EnvVars from '@src/common/constants/env';
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { isOrderPaymentExpired } from '@src/common/constants/order-payment';
import { RouteError } from '@src/common/utils/route-errors';
import {
  cleanAlnum,
  contentMatchesTxnRef,
  extractTxnRefFromContent,
  toSepayTransferContent,
} from '@src/common/utils/sepay';
import {
  buildSepayBasicAuthHeader,
  getSepayPgApiBase,
  getSepaySecretKey,
  isSepayPgConfigured,
  isSepayPgOrderPaid,
  type SepayPgOrderDetail,
} from '@src/common/utils/sepay-pg';
import type { PaymentExceptionType } from '@src/db/schema/payment-exception';
import * as OrderRepo from '@src/repos/OrderRepo';
import * as PaymentExceptionRepo from '@src/repos/PaymentExceptionRepo';
import * as TransactionRepo from '@src/repos/TransactionRepo';
import OrderService from '@src/services/OrderService';

const Errors = {
  UNAUTHORIZED: 'Invalid webhook credentials',
  TXN_NOT_FOUND: 'Transaction not found',
  AMOUNT_MISMATCH: 'Payment amount mismatch',
  SEPAY_API_KEY_MISSING: 'SEPAY_API_KEY is not configured',
  SEPAY_PG_MISSING: 'SEPAY_MERCHANT_ID / SEPAY_SECRET_KEY are not configured',
  SEPAY_API_FAILED: 'Failed to query Sepay transactions',
} as const;

type SepayWebhookPayload = {
  id?: number | string;
  gateway?: string;
  transactionDate?: string;
  accountNumber?: string;
  code?: string | null;
  content?: string;
  description?: string;
  transferType?: string;
  transferAmount?: number;
  /** Sepay official / Ecommerce webhook field */
  amountIn?: number;
  referenceNumber?: string | null;
  referenceCode?: string | null;
  accumulated?: number;
  subAccount?: string | null;
};

type SepayApiTransaction = {
  transaction_content?: string;
  amount_in?: number | string;
  reference_number?: string | null;
  transaction_date?: string;
  bank_brand_name?: string;
};

/** Fire-and-forget exception log — never throws to callers. Upserts unresolved by txnRef+type. */
async function logException(input: {
  type: PaymentExceptionType;
  orderId?: string | null;
  txnRef?: string | null;
  expectedAmount?: number | null;
  actualAmount?: number | null;
  rawPayload?: unknown;
}) {
  try {
    await PaymentExceptionRepo.upsertUnresolved({
      type: input.type,
      orderId: input.orderId ?? null,
      txnRef: input.txnRef ?? null,
      expectedAmount: input.expectedAmount ?? null,
      actualAmount: input.actualAmount ?? null,
      rawPayload: (input.rawPayload as Record<string, unknown>) ?? null,
      resolvedById: null,
      resolvedAt: null,
      resolutionNote: null,
    });
  } catch (err) {
    console.error('PaymentException write failed', err);
  }
}

function amountMismatchKind(
  expected: number,
  actual: number,
): 'underpayment' | 'overpayment' | 'mismatch' {
  if (actual < expected) return 'underpayment';
  if (actual > expected) return 'overpayment';
  return 'mismatch';
}

function assertWebhookAuth(apiKey: string | undefined) {
  const expected = EnvVars.SepayApiKey;
  if (!expected) {
    throw new RouteError(
      HttpStatusCodes.SERVICE_UNAVAILABLE,
      Errors.SEPAY_API_KEY_MISSING,
    );
  }
  if (!apiKey || apiKey !== expected) {
    throw new RouteError(HttpStatusCodes.UNAUTHORIZED, Errors.UNAUTHORIZED);
  }
}

function resolveAmount(payload: SepayWebhookPayload): number {
  return resolvePaidAmount(payload.amountIn ?? payload.transferAmount ?? 0);
}

async function findTransactionByContentRef(extractedCleanRef: string) {
  return (
    (await TransactionRepo.findByTxnRef(extractedCleanRef)) ??
    (await TransactionRepo.findByTxnRef(extractedCleanRef.toUpperCase()))
  );
}

/**
 * Normalize SePay / bank amount fields.
 * Handles number, "500000", "500000.00", and VN thousand dots "500.000".
 */
function resolvePaidAmount(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.round(value);
  }
  if (typeof value !== 'string') return 0;

  const trimmed = value.trim();
  if (!trimmed) return 0;

  // Vietnamese thousand separators: 2.000 / 1.500.000 (no comma decimals)
  if (/^\d{1,3}(\.\d{3})+$/.test(trimmed)) {
    return Math.round(Number(trimmed.replace(/\./g, '')));
  }

  // US/EU mixed: 1,500,000.50 or 1.500.000,50
  if (trimmed.includes(',') && trimmed.includes('.')) {
    const lastComma = trimmed.lastIndexOf(',');
    const lastDot = trimmed.lastIndexOf('.');
    if (lastComma > lastDot) {
      // 1.500.000,50 → decimal comma
      const normalized = trimmed.replace(/\./g, '').replace(',', '.');
      const n = Number(normalized);
      return Number.isFinite(n) ? Math.round(n) : 0;
    }
    // 1,500,000.50 → decimal dot
    const normalized = trimmed.replace(/,/g, '');
    const n = Number(normalized);
    return Number.isFinite(n) ? Math.round(n) : 0;
  }

  if (/^\d{1,3}(,\d{3})+$/.test(trimmed)) {
    return Math.round(Number(trimmed.replace(/,/g, '')));
  }

  const cleaned = trimmed.replace(/[^\d.-]/g, '');
  const n = Number(cleaned);
  return Number.isFinite(n) ? Math.round(n) : 0;
}

/**
 * Confirm SePay payment after amount + content already matched.
 * Completes the order even after the 30-minute QR window / TTL cancel
 * (late payment recovery). Amount mismatch still refuses (except 0đ orders).
 */
async function confirmPayment(
  txnRef: string,
  gatewayResponse: unknown,
  paidAmount?: number,
) {
  const transaction = await TransactionRepo.findByTxnRef(txnRef);
  if (!transaction) {
    void logException({ type: 'txn_not_found', txnRef, rawPayload: gatewayResponse });
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.TXN_NOT_FOUND);
  }

  if (transaction.status === 'success') {
    return {
      ok: true,
      alreadyPaid: true,
      lateRecovered: false,
      txnRef,
      orderId: transaction.orderId,
      status: 'success' as const,
    };
  }

  const actual =
    paidAmount !== undefined ? resolvePaidAmount(paidAmount) : undefined;

  // 0đ order (coupon): never require bank credit. If someone still transferred
  // money, log once as orphan mismatch then complete enrollment.
  if (transaction.amount === 0) {
    if (actual !== undefined && actual > 0) {
      void logException({
        type: 'amount_mismatch',
        orderId: transaction.orderId,
        txnRef: transaction.txnRef,
        expectedAmount: 0,
        actualAmount: actual,
        rawPayload: {
          note: 'orphan_transfer_on_zero_order',
          gatewayResponse,
        },
      });
    }
  } else if (
    actual !== undefined &&
    actual > 0 &&
    actual !== transaction.amount
  ) {
    const kind = amountMismatchKind(transaction.amount, actual);
    // Under/over: never auto-complete. Upsert one open exception (no spam).
    await logException({
      type: 'amount_mismatch',
      orderId: transaction.orderId,
      txnRef: transaction.txnRef,
      expectedAmount: transaction.amount,
      actualAmount: actual,
      rawPayload: {
        kind,
        gatewayResponse,
      },
    });
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.AMOUNT_MISMATCH);
  }

  const orderBefore = await OrderRepo.findById(transaction.orderId);
  const pastWindow =
    orderBefore != null && isOrderPaymentExpired(orderBefore.createdAt);
  const wasCancelled = orderBefore?.status === 'cancelled';

  // Best-effort: close pending window in DB if expired, then recover via late path.
  if (orderBefore?.status === 'pending' && pastWindow) {
    await OrderService.expirePendingOrderIfNeeded(transaction.orderId);
  }

  const result = await OrderService.processSuccessfulPayment(
    transaction.orderId,
    {
      txnRef: transaction.txnRef,
      gatewayResponse,
      skipExpiryCheck: true,
      allowLatePayment: true,
    },
  );

  const lateRecovered =
    Boolean(result.lateRecovered) || pastWindow || wasCancelled;

  if (lateRecovered) {
    void logException({
      type: 'late_payment_recovered',
      orderId: transaction.orderId,
      txnRef: transaction.txnRef,
      expectedAmount: transaction.amount,
      actualAmount: actual ?? transaction.amount,
      rawPayload: {
        source: 'sepay_confirm',
        pastWindow,
        wasCancelled,
        gatewayResponse,
      },
    });
  }

  return {
    ok: true,
    alreadyPaid: false,
    lateRecovered,
    txnRef: transaction.txnRef,
    orderId: result.order.id,
    status: result.order.status,
  };
}

async function handleSepayWebhook(
  payload: SepayWebhookPayload,
  apiKey?: string,
) {
  assertWebhookAuth(apiKey);

  if (payload.transferType && payload.transferType !== 'in') {
    return {
      success: true,
      ignored: true,
      reason: 'not_incoming_transfer',
    };
  }

  const content = payload.content ?? payload.description ?? null;
  if (!content) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, 'Missing content');
  }

  const extracted = extractTxnRefFromContent(content);
  if (!extracted) {
    void logException({ type: 'txn_ref_not_found', rawPayload: payload });
    return {
      success: true,
      ignored: true,
      reason: 'txn_ref_not_found',
      message: 'Ignored, no valid SEVQR format found',
    };
  }

  const transaction = await findTransactionByContentRef(extracted);
  if (!transaction) {
    void logException({
      type: 'txn_not_found',
      txnRef: extracted,
      rawPayload: payload,
    });
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.TXN_NOT_FOUND);
  }

  if (!contentMatchesTxnRef(content, transaction.txnRef)) {
    void logException({
      type: 'txn_ref_mismatch',
      orderId: transaction.orderId,
      txnRef: transaction.txnRef,
      rawPayload: payload,
    });
    return {
      success: true,
      ignored: true,
      reason: 'txn_ref_mismatch',
    };
  }

  const result = await confirmPayment(
    transaction.txnRef,
    {
      ...payload,
      referenceNumber: payload.referenceNumber ?? payload.referenceCode,
    },
    resolveAmount(payload),
  );

  return {
    success: true,
    message: 'Webhook processed',
    ...result,
  };
}

async function fetchSepayTransactions(): Promise<SepayApiTransaction[]> {
  const token = EnvVars.SepayApiKey;
  if (!token) {
    throw new RouteError(
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      Errors.SEPAY_API_KEY_MISSING,
    );
  }

  const response = await fetch('https://my.sepay.vn/userapi/transactions/list', {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new RouteError(HttpStatusCodes.BAD_GATEWAY, Errors.SEPAY_API_FAILED);
  }

  const data = (await response.json()) as {
    transactions?: SepayApiTransaction[];
  };
  return data.transactions ?? [];
}

async function fetchSepayPgOrderDetail(
  invoiceNumber: string,
): Promise<SepayPgOrderDetail | null> {
  if (!isSepayPgConfigured()) {
    throw new RouteError(
      HttpStatusCodes.SERVICE_UNAVAILABLE,
      Errors.SEPAY_PG_MISSING,
    );
  }

  const response = await fetch(
    `${getSepayPgApiBase()}/order/detail/${encodeURIComponent(invoiceNumber)}`,
    {
      headers: {
        Authorization: buildSepayBasicAuthHeader(),
        Accept: 'application/json',
      },
    },
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    console.error('SePay PG order detail failed', response.status, body.slice(0, 300));
    throw new RouteError(HttpStatusCodes.BAD_GATEWAY, Errors.SEPAY_API_FAILED);
  }

  const payload = (await response.json()) as {
    data?: SepayPgOrderDetail;
  } & SepayPgOrderDetail;
  return payload.data ?? payload;
}

/**
 * SePay Payment Gateway IPN — auth via X-Secret-Key = SEPAY_SECRET_KEY.
 * invoice = our txnRef (order_invoice_number).
 */
async function handleSepayIpn(
  payload: {
    notification_type?: string;
    order?: {
      order_invoice_number?: string;
      order_status?: string;
      order_amount?: string | number;
    };
    transaction?: {
      transaction_amount?: string | number;
      transaction_status?: string;
    };
  },
  secretHeader?: string,
) {
  const expected = getSepaySecretKey();
  if (!expected) {
    throw new RouteError(
      HttpStatusCodes.SERVICE_UNAVAILABLE,
      Errors.SEPAY_PG_MISSING,
    );
  }
  if (!secretHeader || secretHeader !== expected) {
    throw new RouteError(HttpStatusCodes.UNAUTHORIZED, Errors.UNAUTHORIZED);
  }

  if (payload.notification_type && payload.notification_type !== 'ORDER_PAID') {
    return {
      success: true,
      ignored: true,
      reason: 'unsupported_notification_type',
      notificationType: payload.notification_type,
    };
  }

  const invoice =
    payload.order?.order_invoice_number?.trim() ||
    (typeof payload.order === 'object' &&
      payload.order &&
      'order_invoice_number' in payload.order
      ? String(payload.order.order_invoice_number)
      : '');
  if (!invoice) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, 'Missing order_invoice_number');
  }

  const paidAmount = Number(
    payload.transaction?.transaction_amount ??
      payload.order?.order_amount ??
      0,
  );

  const result = await confirmPayment(invoice, payload, paidAmount);

  return {
    success: true,
    message: 'IPN processed',
    ...result,
  };
}

/**
 * Poll payment status: prefer SePay PG order detail (merchant/secret).
 * Falls back to legacy my.sepay.vn transaction list when only SEPAY_API_KEY is set.
 */
async function checkSepayPayment(txnRef: string) {
  const normalized = cleanAlnum(txnRef);
  const transaction =
    (await TransactionRepo.findByTxnRef(txnRef)) ??
    (await TransactionRepo.findByTxnRef(normalized));

  if (!transaction) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.TXN_NOT_FOUND);
  }

  if (transaction.status === 'success') {
    return {
      success: true,
      status: 'PAID' as const,
      txnRef: transaction.txnRef,
      orderId: transaction.orderId,
      amount: transaction.amount,
      paidAt: transaction.paidAt,
      message: 'Payment already confirmed',
    };
  }

  // Legacy / race: 0đ order still pending with QR — complete without bank transfer.
  if (transaction.amount === 0) {
    const confirmed = await confirmPayment(
      transaction.txnRef,
      { source: 'coupon_zero_heal' },
      0,
    );
    return {
      success: true,
      status: 'PAID' as const,
      txnRef: confirmed.txnRef,
      orderId: confirmed.orderId,
      amount: 0,
      paidAt: new Date().toISOString(),
      message: 'Zero-amount order confirmed without bank transfer',
      alreadyPaid: confirmed.alreadyPaid,
    };
  }

  const order = await OrderRepo.findById(transaction.orderId);
  const expiredPending = await OrderService.expirePendingOrderIfNeeded(
    transaction.orderId,
  );
  const windowExpired =
    expiredPending != null ||
    (order != null && isOrderPaymentExpired(order.createdAt));

  if (EnvVars.SepayPgEnabled && isSepayPgConfigured()) {
    const detail = await fetchSepayPgOrderDetail(transaction.txnRef);
    if (!detail || !isSepayPgOrderPaid(detail.order_status)) {
      return {
        success: false,
        status: (windowExpired ? 'EXPIRED' : 'PENDING') as 'EXPIRED' | 'PENDING',
        txnRef: transaction.txnRef,
        orderId: transaction.orderId,
        amount: transaction.amount,
        paidAt: null,
        message: windowExpired
          ? 'Payment window expired — SePay PG order not paid yet'
          : 'Pending',
        gatewayStatus: detail?.order_status ?? null,
      };
    }

    const paidAmount = resolvePaidAmount(
      detail.order_amount ?? transaction.amount,
    );
    try {
      const confirmed = await confirmPayment(
        transaction.txnRef,
        detail,
        paidAmount > 0 ? paidAmount : transaction.amount,
      );

      return {
        success: true,
        status: 'PAID' as const,
        txnRef: confirmed.txnRef,
        orderId: confirmed.orderId,
        amount: transaction.amount,
        paidAt: new Date().toISOString(),
        message: confirmed.lateRecovered
          ? 'Late payment confirmed after QR window'
          : 'Payment confirmed via SePay PG',
        alreadyPaid: confirmed.alreadyPaid,
        lateRecovered: confirmed.lateRecovered,
      };
    } catch (err) {
      if (err instanceof RouteError && err.status === HttpStatusCodes.BAD_REQUEST) {
        if (err.message === Errors.AMOUNT_MISMATCH) {
          const expectedAmt = transaction.amount;
          const kind =
            paidAmount > 0
              ? amountMismatchKind(expectedAmt, paidAmount)
              : 'mismatch';
          return {
            success: false,
            status: 'AMOUNT_MISMATCH' as const,
            txnRef: transaction.txnRef,
            orderId: transaction.orderId,
            amount: expectedAmt,
            paidAt: null,
            actualAmount: paidAmount,
            mismatchKind: kind,
            message: Errors.AMOUNT_MISMATCH,
          };
        }
        return {
          success: false,
          status: (windowExpired ? 'EXPIRED' : 'PENDING') as 'EXPIRED' | 'PENDING',
          txnRef: transaction.txnRef,
          orderId: transaction.orderId,
          amount: transaction.amount,
          paidAt: null,
          message: err.message,
        };
      }
      throw err;
    }
  }

  const remoteList = await fetchSepayTransactions();
  const expected = toSepayTransferContent(transaction.txnRef);

  const matches = remoteList.filter((t) => {
    if (!t.transaction_content) return false;
    return cleanAlnum(t.transaction_content).includes(expected);
  });

  // Prefer exact amount match when multiple bank rows share the same SEVQR content.
  const exactMatch = matches.find(
    (t) => resolvePaidAmount(t.amount_in) === transaction.amount,
  );
  const match = exactMatch ?? matches[0];

  if (!match) {
    return {
      success: false,
      status: (windowExpired ? 'EXPIRED' : 'PENDING') as 'EXPIRED' | 'PENDING',
      txnRef: transaction.txnRef,
      orderId: transaction.orderId,
      amount: transaction.amount,
      paidAt: null,
      message: windowExpired
        ? 'Payment window expired (30 minutes) — no matching bank transfer yet'
        : 'Pending',
    };
  }

  const paidAmount = resolvePaidAmount(match.amount_in);
  try {
    const confirmed = await confirmPayment(
      transaction.txnRef,
      match,
      paidAmount,
    );

    return {
      success: true,
      status: 'PAID' as const,
      txnRef: confirmed.txnRef,
      orderId: confirmed.orderId,
      amount: transaction.amount,
      paidAt: new Date().toISOString(),
      message: confirmed.lateRecovered
        ? 'Late payment confirmed after QR window'
        : 'Payment confirmed',
      alreadyPaid: confirmed.alreadyPaid,
      lateRecovered: confirmed.lateRecovered,
    };
  } catch (err) {
    if (err instanceof RouteError && err.status === HttpStatusCodes.BAD_REQUEST) {
      if (err.message === Errors.AMOUNT_MISMATCH) {
        const expectedAmt = transaction.amount;
        const kind =
          paidAmount > 0
            ? amountMismatchKind(expectedAmt, paidAmount)
            : 'mismatch';
        return {
          success: false,
          status: 'AMOUNT_MISMATCH' as const,
          txnRef: transaction.txnRef,
          orderId: transaction.orderId,
          amount: expectedAmt,
          paidAt: null,
          actualAmount: paidAmount,
          mismatchKind: kind,
          message: Errors.AMOUNT_MISMATCH,
        };
      }
      // e.g. Order is not payable — do not 400-spam the poller
      return {
        success: false,
        status: (windowExpired ? 'EXPIRED' : 'PENDING') as 'EXPIRED' | 'PENDING',
        txnRef: transaction.txnRef,
        orderId: transaction.orderId,
        amount: transaction.amount,
        paidAt: null,
        message: err.message,
      };
    }
    throw err;
  }
}

async function handleVnpayReturn(_query: Record<string, string>) {
  throw new RouteError(
    HttpStatusCodes.NOT_IMPLEMENTED,
    'VNPay return handling is not implemented yet',
  );
}

async function handleMomoReturn(_query: Record<string, string>) {
  throw new RouteError(
    HttpStatusCodes.NOT_IMPLEMENTED,
    'MoMo return handling is not implemented yet',
  );
}

export default {
  Errors,
  handleSepayWebhook,
  handleSepayIpn,
  checkSepayPayment,
  handleVnpayReturn,
  handleMomoReturn,
};
