import { z } from 'zod';

import {
  membershipBillingIntervalEnum,
  membershipSourceEnum,
  membershipStatusEnum,
} from '@src/db/schema/membership';

export const membershipBillingIntervalSchema = z.enum(
  membershipBillingIntervalEnum.enumValues,
);
export const membershipStatusSchema = z.enum(membershipStatusEnum.enumValues);
export const membershipSourceSchema = z.enum(membershipSourceEnum.enumValues);

const featuresSchema = z.array(z.string().trim().min(1).max(255)).max(50);

export const createMembershipPlanSchema = z.object({
  code: z.string().trim().min(2).max(64).regex(/^[A-Za-z0-9_-]+$/).transform((v) => v.toUpperCase()),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(2000).nullable().optional(),
  monthlyPrice: z.number().int().min(0).nullable().optional(),
  yearlyPrice: z.number().int().min(0).nullable().optional(),
  monthlyDurationDays: z.number().int().positive().nullable().optional(),
  yearlyDurationDays: z.number().int().positive().nullable().optional(),
  aiDailyLimit: z.number().int().min(-1).default(5),
  mentorReviewsPerMonth: z.number().int().min(0).default(0),
  features: featuresSchema.default([]),
  isActive: z.boolean().default(true),
  displayOrder: z.number().int().min(0).default(0),
});

export const updateMembershipPlanSchema = createMembershipPlanSchema
  .omit({ code: true })
  .partial();

export const membershipListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  q: z.string().trim().max(200).optional(),
  status: membershipStatusSchema.optional(),
  planId: z.string().uuid().optional(),
});

export const grantMembershipSchema = z.object({
  userId: z.number().int().positive(),
  planId: z.string().uuid(),
  billingInterval: membershipBillingIntervalSchema,
  startsAt: z.coerce.date().optional(),
  endsAt: z.coerce.date().nullable().optional(),
  source: membershipSourceSchema.default('admin_granted'),
  reason: z.string().trim().min(3).max(2000),
});

export const extendMembershipSchema = z.object({
  days: z.number().int().positive().max(3650),
  reason: z.string().trim().min(3).max(2000),
});

export const revokeMembershipSchema = z.object({
  reason: z.string().trim().min(3).max(2000),
});

export type CreateMembershipPlanInput = z.infer<typeof createMembershipPlanSchema>;
export type UpdateMembershipPlanInput = z.infer<typeof updateMembershipPlanSchema>;
export type MembershipListQuery = z.infer<typeof membershipListQuerySchema>;
export type GrantMembershipInput = z.infer<typeof grantMembershipSchema>;
