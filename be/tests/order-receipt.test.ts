/**
 * Order receipt guards (paid-only) — mirrors OrderService.buildReceiptPayload.
 */
import { describe, expect, it } from 'vitest';

type OrderStatus =
  | 'pending'
  | 'paid'
  | 'cancelled'
  | 'refund_pending'
  | 'refunded';

function canIssueReceipt(status: OrderStatus): boolean {
  return status === 'paid';
}

function buildReceiptNumber(orderId: string, paidAt: Date): string {
  const year = paidAt.getFullYear();
  const shortId = orderId.replace(/-/g, '').slice(0, 8).toUpperCase();
  return `BL-${year}-${shortId}`;
}

describe('order receipt guards', () => {
  it('allows receipt only for paid orders', () => {
    expect(canIssueReceipt('paid')).toBe(true);
    expect(canIssueReceipt('pending')).toBe(false);
    expect(canIssueReceipt('cancelled')).toBe(false);
    expect(canIssueReceipt('refunded')).toBe(false);
  });

  it('builds BL-{year}-{shortId} receipt numbers', () => {
    expect(
      buildReceiptNumber(
        'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        new Date('2026-07-29T00:00:00Z'),
      ),
    ).toBe('BL-2026-AAAAAAAA');
  });
});
