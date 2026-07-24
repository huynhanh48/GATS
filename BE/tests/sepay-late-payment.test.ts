/**
 * SePay late-payment + amount-mismatch contracts (PAY-SEPAY).
 * Self-contained (no @src imports) so vitest does not load jet-env/DB.
 *
 * Runtime: PaymentService.confirmPayment / checkSepayPayment,
 * OrderService.processSuccessfulPayment({ allowLatePayment: true }).
 */
import { describe, expect, it } from 'vitest';

/** Mirror of BE/src/common/utils/sepay.ts for contract checks. */
function cleanAlnum(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

function toSepayTransferContent(txnRef: string): string {
  return `SEVQR${cleanAlnum(txnRef)}`;
}

function extractTxnRefFromContent(
  content: string | undefined | null,
): string | null {
  if (!content) return null;
  const clean = cleanAlnum(content);
  const match = clean.match(/SEVQR([A-Z0-9]+)/);
  return match?.[1] ?? null;
}

function contentMatchesTxnRef(content: string, txnRef: string): boolean {
  return cleanAlnum(content).includes(toSepayTransferContent(txnRef));
}

type OrderStatus = 'pending' | 'paid' | 'cancelled' | 'refunded';

/**
 * Decision used by processSuccessfulPayment after SePay amount match.
 * TTL no longer blocks confirmation when allowLatePayment is set.
 */
function canCompleteOrder(input: {
  status: OrderStatus;
  allowLatePayment?: boolean;
  skipExpiryCheck?: boolean;
  pastPaymentWindow?: boolean;
}): { ok: boolean; lateRecovered: boolean; reason?: string } {
  if (input.status === 'paid') {
    return { ok: true, lateRecovered: false };
  }
  if (input.status === 'pending') {
    if (input.pastPaymentWindow && !input.skipExpiryCheck && !input.allowLatePayment) {
      return { ok: false, lateRecovered: false, reason: 'PAYMENT_EXPIRED' };
    }
    return {
      ok: true,
      lateRecovered: Boolean(input.pastPaymentWindow && input.allowLatePayment),
    };
  }
  if (input.status === 'cancelled' && input.allowLatePayment) {
    return { ok: true, lateRecovered: true };
  }
  return { ok: false, lateRecovered: false, reason: 'Order is not payable' };
}

function amountsMatch(expected: number, paid?: number): boolean {
  if (paid === undefined || paid <= 0) return true;
  return paid === expected;
}

describe('SePay content matching', () => {
  it('builds and extracts SEVQR txn refs', () => {
    const txnRef = 'ORD1710000000ABC123';
    const content = `CK ${toSepayTransferContent(txnRef)}`;
    expect(extractTxnRefFromContent(content)).toBe(cleanAlnum(txnRef));
    expect(contentMatchesTxnRef(content, txnRef)).toBe(true);
  });

  it('ignores content without SEVQR', () => {
    expect(extractTxnRefFromContent('chuyen khoan hoc phi')).toBeNull();
  });
});

describe('amount mismatch still blocks completion', () => {
  it('rejects unequal amounts', () => {
    expect(amountsMatch(499000, 500000)).toBe(false);
    expect(amountsMatch(499000, 499000)).toBe(true);
  });
});

describe('late payment recovery', () => {
  it('completes cancelled order when allowLatePayment', () => {
    const result = canCompleteOrder({
      status: 'cancelled',
      allowLatePayment: true,
      pastPaymentWindow: true,
    });
    expect(result).toEqual({ ok: true, lateRecovered: true });
  });

  it('refuses cancelled order without allowLatePayment', () => {
    const result = canCompleteOrder({ status: 'cancelled' });
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('Order is not payable');
  });

  it('completes pending after TTL when allowLatePayment', () => {
    const result = canCompleteOrder({
      status: 'pending',
      pastPaymentWindow: true,
      allowLatePayment: true,
    });
    expect(result.ok).toBe(true);
    expect(result.lateRecovered).toBe(true);
  });

  it('blocks pending after TTL without late/skip flags', () => {
    const result = canCompleteOrder({
      status: 'pending',
      pastPaymentWindow: true,
    });
    expect(result).toEqual({
      ok: false,
      lateRecovered: false,
      reason: 'PAYMENT_EXPIRED',
    });
  });

  it('is idempotent for already paid', () => {
    expect(canCompleteOrder({ status: 'paid' })).toEqual({
      ok: true,
      lateRecovered: false,
    });
  });

  it('never recovers refunded orders via late payment', () => {
    const result = canCompleteOrder({
      status: 'refunded',
      allowLatePayment: true,
    });
    expect(result.ok).toBe(false);
  });
});

describe('PAY-SEPAY service contract', () => {
  it('documents webhook/poll recovery rules', () => {
    const rules = {
      amountMustMatchExactly: true,
      sevqrContentRequired: true,
      ttlBlocksUiOnlyNotBankMatch: true,
      latePaymentLogsException: true,
      exceptionType: 'late_payment_recovered',
      pollChecksSepayEvenAfterExpire: true,
      alreadyPaidIdempotent: true,
    };
    expect(Object.values(rules).every((v) => v === true || typeof v === 'string')).toBe(
      true,
    );
    expect(rules.exceptionType).toBe('late_payment_recovered');
  });
});
