import { z } from 'zod';

import { leadStatusEnum } from '@src/db/schema/lead';

export const leadStatusSchema = z.enum(leadStatusEnum.enumValues);
export type LeadStatusInput = z.infer<typeof leadStatusSchema>;

export const createLeadSchema = z.object({
  name: z.string().trim().min(1).max(255),
  phone: z
    .string()
    .trim()
    .min(8)
    .max(20)
    .regex(/^[0-9+\s()-]+$/, 'Invalid phone'),
  email: z.string().trim().email().max(255).optional().or(z.literal('')),
  message: z.string().trim().max(2000).optional().or(z.literal('')),
  source: z.string().trim().max(100).optional(),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;

export function parseCreateLeadInput(data: unknown): CreateLeadInput {
  return createLeadSchema.parse(data);
}

export const updateLeadSchema = z.object({
  status: leadStatusSchema.optional(),
  assigneeUserId: z.number().int().positive().nullable().optional(),
  notes: z.string().trim().max(5000).nullable().optional(),
});

export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;

export function parseUpdateLeadInput(data: unknown): UpdateLeadInput {
  return updateLeadSchema.parse(data);
}

export const leadListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  q: z.string().trim().max(200).optional(),
  status: leadStatusSchema.optional(),
  createdFrom: z.coerce.date().optional(),
  createdTo: z.coerce.date().optional(),
});

export type LeadListQuery = z.infer<typeof leadListQuerySchema>;

export function parseLeadListQuery(data: unknown): LeadListQuery {
  return leadListQuerySchema.parse(data);
}
