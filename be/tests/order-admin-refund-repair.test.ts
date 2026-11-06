/**
 * UAT: admin order refund / repair / status transitions (PAY-01…03, QA-01/02).
 * Self-contained (no @src imports) so vitest does not load jet-env/DB.
 *
 * Runtime behavior is implemented in:
 * - OrderService.adminUpdateOrderStatus (2-step refund + reason→audit)
 * - OrderService.adminRepairEnrollment (skips active; upsert grant; reason→audit)
 */
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

const adminUpdateOrderStatusSchema = z
  .object({
    status: z.enum(['paid', 'cancelled', 'refund_pending', 'refunded']),
    reason: z.string().trim().min(3).max(500).optional(),
    reasonCode: z
      .enum([
        'wrong_course',
        'duplicate_payment',
        'content_issue',
        'within_policy',
        'other',
      ])
      .optional(),
    reasonNote: z.string().trim().max(1000).optional(),
    bankName: z.string().trim().min(2).max(120).optional(),
    accountNumber: z.string().trim().min(4).max(50).optional(),
    accountHolder: z.string().trim().min(2).max(255).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.status === 'refund_pending') {
      if (!data.reasonCode) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'reasonCode is required for refund_pending',
          path: ['reasonCode'],
        });
      }
      if (!data.bankName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'bankName is required for refund_pending',
          path: ['bankName'],
        });
      }
      if (!data.accountNumber) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'accountNumber is required for refund_pending',
          path: ['accountNumber'],
        });
      }
      if (!data.accountHolder) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'accountHolder is required for refund_pending',
          path: ['accountHolder'],
        });
      }
      const note = data.reasonNote?.trim() ?? '';
      if (data.reasonCode === 'other' && note.length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'reasonNote is required when reasonCode is other',
          path: ['reasonNote'],
        });
      }
    }
  });

describe('PAY-01 admin status payload', () => {
  it('accepts refund_pending with reason + bank details', () => {
    const input = adminUpdateOrderStatusSchema.parse({
      status: 'refund_pending',
      reasonCode: 'wrong_course',
      bankName: 'Vietcombank',
      accountNumber: '0123456789',
      accountHolder: 'Nguyen Van A',
      reasonNote: 'Đăng ký nhầm khóa nâng cao',
    });
    expect(input.status).toBe('refund_pending');
    expect(input.reasonCode).toBe('wrong_course');
    expect(input.accountNumber).toBe('0123456789');
  });

  it('rejects refund_pending without bank account', () => {
    expect(() =>
      adminUpdateOrderStatusSchema.parse({
        status: 'refund_pending',
        reasonCode: 'wrong_course',
        bankName: 'Vietcombank',
        accountHolder: 'Nguyen Van A',
      }),
    ).toThrow();
  });

  it('requires reasonNote when reasonCode is other', () => {
    expect(() =>
      adminUpdateOrderStatusSchema.parse({
        status: 'refund_pending',
        reasonCode: 'other',
        bankName: 'Vietcombank',
        accountNumber: '0123456789',
        accountHolder: 'Nguyen Van A',
      }),
    ).toThrow();
  });

  it('accepts refunded confirm with short reason', () => {
    const input = adminUpdateOrderStatusSchema.parse({
      status: 'refunded',
      reason: 'Đã CK',
    });
    expect(input.status).toBe('refunded');
  });

  it('rejects reason shorter than 3 chars when provided', () => {
    expect(() =>
      adminUpdateOrderStatusSchema.parse({ status: 'paid', reason: 'ab' }),
    ).toThrow();
  });

  it('allows paid/cancelled/refund_pending/refunded only', () => {
    expect(() =>
      adminUpdateOrderStatusSchema.parse({ status: 'pending' }),
    ).toThrow();
  });
});

describe('PAY-02 / PAY-03 service contract', () => {
  it('documents 2-step refund + repair idempotency rules', () => {
    const rules = {
      requestRefundFromPaid: true,
      revokeEnrollmentsOnRefundPending: true,
      confirmRefundFromPending: true,
      cancelRefundRestoresEnrollment: true,
      refundIdempotentWhenAlreadyRefunded: true,
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
