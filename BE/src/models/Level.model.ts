import { z } from 'zod';

export const levelCodeSchema = z.enum(['beginner', 'intermediate', 'advanced']);

export const levelSchema = z.object({
  code: levelCodeSchema,
  name: z.string().min(1).max(100),
  description: z.string().nullable(),
  sortOrder: z.number().int().min(0),
  status: z.enum(['active', 'inactive']),
});

export const updateLevelSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().nullable().optional(),
    sortOrder: z.number().int().min(0).optional(),
    status: z.enum(['active', 'inactive']).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export type Level = z.infer<typeof levelSchema>;
export type UpdateLevelInput = z.infer<typeof updateLevelSchema>;
