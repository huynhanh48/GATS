import { z } from 'zod';

export const roleSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(64),
  description: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type RoleRecord = z.infer<typeof roleSchema>;

export function parseRole(data: unknown): RoleRecord {
  return roleSchema.parse(data);
}
