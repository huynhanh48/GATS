import { couponTypeEnum } from '@src/db/schema/coupon';
import { z } from 'zod';

export const couponTypeSchema = z.enum(couponTypeEnum.enumValues);
export type CouponTypeInput = z.infer<typeof couponTypeSchema>;

const codeSchema = z
  .string()
  .trim()
  .min(3)
  .max(50)
  .regex(/^[A-Za-z0-9_-]+$/, 'Code chỉ gồm chữ, số, gạch ngang, gạch dưới')
  .transform((v) => v.toUpperCase());

export const createCouponSchema = z.object({
  code: codeSchema,
  description: z.string().trim().max(255).optional().or(z.literal('')),
  type: couponTypeSchema.default('percent'),
  value: z.number().int().positive(),
  maxUses: z.number().int().positive().nullable().optional(),
  minOrderAmount: z.number().int().min(0).default(0),
  startsAt: z.coerce.date().nullable().optional(),
  endsAt: z.coerce.date().nullable().optional(),
  isActive: z.boolean().default(true),
});

export type CreateCouponInput = z.infer<typeof createCouponSchema>;

export function parseCreateCouponInput(data: unknown): CreateCouponInput {
  const parsed = createCouponSchema.parse(data);
  if (parsed.type === 'percent' && parsed.value > 100) {
    throw new z.ZodError([
      {
        code: 'custom',
        path: ['value'],
        message: 'Percent coupon value must be <= 100',
      },
    ]);
  }
  return parsed;
}

export const updateCouponSchema = z.object({
  description: z.string().trim().max(255).nullable().optional(),
  type: couponTypeSchema.optional(),
  value: z.number().int().positive().optional(),
  maxUses: z.number().int().positive().nullable().optional(),
  minOrderAmount: z.number().int().min(0).optional(),
  startsAt: z.coerce.date().nullable().optional(),
  endsAt: z.coerce.date().nullable().optional(),
  isActive: z.boolean().optional(),
});

export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;

export function parseUpdateCouponInput(data: unknown): UpdateCouponInput {
  return updateCouponSchema.parse(data);
}

export const couponListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  q: z.string().trim().max(200).optional(),
  isActive: z
    .union([z.literal('1'), z.literal('true'), z.literal('0'), z.literal('false'), z.boolean()])
    .optional()
    .transform((v) =>
      v === undefined ? undefined : v === true || v === '1' || v === 'true',
    ),
});

export type CouponListQuery = z.infer<typeof couponListQuerySchema>;

export function parseCouponListQuery(data: unknown): CouponListQuery {
  return couponListQuerySchema.parse(data);
}

export const applyCouponSchema = z.object({
  code: codeSchema,
  orderAmount: z.number().int().min(0),
});

export type ApplyCouponInput = z.infer<typeof applyCouponSchema>;

export function parseApplyCouponInput(data: unknown): ApplyCouponInput {
  return applyCouponSchema.parse(data);
}

export function normalizeCouponCode(code: string): string {
  return code.trim().toUpperCase();
}
