import EnvVars from '@src/common/constants/env';
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import {
  cleanAlnum,
  contentMatchesTxnRef,
  extractTxnRefFromContent,
  toSepayTransferContent,
} from '@src/common/utils/sepay';
import * as TransactionRepo from '@src/repos/TransactionRepo';
import OrderService from '@src/services/OrderService';

const Errors = {
  UNAUTHORIZED: 'Invalid webhook credentials',
  TXN_NOT_FOUND: 'Transaction not found',
  AMOUNT_MISMATCH: 'Payment amount mismatch',
  SEPAY_API_KEY_MISSING: 'SEPAY_API_KEY is not configured',
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

function assertWebhookAuth(apiKey: string | undefined) {
  const expected = EnvVars.SepayApiKey;
  if (!expected) return;
  if (!apiKey || apiKey !== expected) {
    throw new RouteError(HttpStatusCodes.UNAUTHORIZED, Errors.UNAUTHORIZED);
  }
}

function resolveAmount(payload: SepayWebhookPayload): number {
  return Number(payload.amountIn ?? payload.transferAmount ?? 0);
}

async function findTransactionByContentRef(extractedCleanRef: string) {
  return (
    (await TransactionRepo.findByTxnRef(extractedCleanRef)) ??
    (await TransactionRepo.findByTxnRef(extractedCleanRef.toUpperCase()))
  );
}

async function confirmPayment(
  txnRef: string,
  gatewayResponse: unknown,
  paidAmount?: number,
) {
  const transaction = await TransactionRepo.findByTxnRef(txnRef);
  if (!transaction) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.TXN_NOT_FOUND);
  }

  if (transaction.status === 'success') {
    return {
      ok: true,
      alreadyPaid: true,
      txnRef,
      orderId: transaction.orderId,
      status: 'success' as const,
    };
  }

  if (
    paidAmount !== undefined &&
    paidAmount > 0 &&
    paidAmount !== transaction.amount
  ) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.AMOUNT_MISMATCH);
  }

  const result = await OrderService.processSuccessfulPayment(
    transaction.orderId,
    {
      txnRef: transaction.txnRef,
      gatewayResponse,
    },
  );

  return {
    ok: true,
    alreadyPaid: false,
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
    return {
      success: true,
      ignored: true,
      reason: 'txn_ref_not_found',
      message: 'Ignored, no valid SEVQR format found',
    };
  }

  const transaction = await findTransactionByContentRef(extracted);
  if (!transaction) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.TXN_NOT_FOUND);
  }

  if (!contentMatchesTxnRef(content, transaction.txnRef)) {
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

/**
 * Poll Sepay API (same approach as Ecommerce).
 * Confirms payment + enrolls when matching transfer is found.
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

  const remoteList = await fetchSepayTransactions();
  const expected = toSepayTransferContent(transaction.txnRef);

  const match = remoteList.find((t) => {
    if (!t.transaction_content) return false;
    return cleanAlnum(t.transaction_content).includes(expected);
  });

  if (!match) {
    return {
      success: false,
      status: 'PENDING' as const,
      txnRef: transaction.txnRef,
      orderId: transaction.orderId,
      amount: transaction.amount,
      paidAt: null,
      message: 'Pending',
    };
  }

  const paidAmount = Number(match.amount_in ?? 0);
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
    message: 'Payment confirmed',
    alreadyPaid: confirmed.alreadyPaid,
  };
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
  checkSepayPayment,
  handleVnpayReturn,
  handleMomoReturn,
};
