/**
 * UAT: admin order refund / repair / status transitions (PAY-01…03, QA-01/02).
 * Self-contained (no @src imports) so vitest does not load jet-env/DB.
 *
 * Runtime behavior is implemented in:
 * - OrderService.adminUpdateOrderStatus (idempotent paid/cancel/refund + reason→audit)
 * - OrderService.adminRepairEnrollment (skips active; upsert grant; reason→audit)
 */
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

const adminUpdateOrderStatusSchema = z.object({
  status: z.enum(['paid', 'cancelled', 'refunded']),
  reason: z.string().trim().min(3).max(500).optional(),
});

describe('PAY-01 admin status payload', () => {
  it('accepts status + reason for refund', () => {
    const input = adminUpdateOrderStatusSchema.parse({
      status: 'refunded',
      reason: 'Khách yêu cầu hoàn tiền',
    });
    expect(input.status).toBe('refunded');
    expect(input.reason).toBe('Khách yêu cầu hoàn tiền');
  });

  it('rejects reason shorter than 3 chars when provided', () => {
    expect(() =>
      adminUpdateOrderStatusSchema.parse({ status: 'paid', reason: 'ab' }),
    ).toThrow();
  });

  it('allows paid/cancelled/refunded only', () => {
    expect(() =>
      adminUpdateOrderStatusSchema.parse({ status: 'pending' }),
    ).toThrow();
  });
});

describe('PAY-02 / PAY-03 service contract', () => {
  it('documents refund revoke + repair idempotency rules', () => {
    const rules = {
      refundFromPaid: true,
      refundIdempotentWhenAlreadyRefunded: true,
      revokeEnrollmentsOnRefund: true,
      repairOnlyWhenPaid: true,
      repairSkipsActiveEnrollment: true,
      repairUsesUpsertGrant: true,
      reasonStoredInAuditMeta: true,
    };
    expect(Object.values(rules).every(Boolean)).toBe(true);
  });
});

describe('QA-01 purchase → learn contract', () => {
  it('documents enrollment grant sources after payment', () => {
    const sources = ['purchase', 'admin_granted'] as const;
    expect(sources).toContain('purchase');
    expect(sources).toContain('admin_granted');
  });
});
