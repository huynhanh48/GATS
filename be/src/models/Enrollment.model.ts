import {
  enrollmentSourceEnum,
  enrollmentStatusEnum,
} from '@src/db/schema/enrollment';
import { z } from 'zod';

export const enrollmentSourceSchema = z.enum(enrollmentSourceEnum.enumValues);
export const enrollmentStatusSchema = z.enum(enrollmentStatusEnum.enumValues);

export const enrollmentRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.number().int().positive(),
  courseId: z.string().uuid(),
  source: enrollmentSourceSchema,
  status: enrollmentStatusSchema,
  enrolledAt: z.coerce.date(),
  expiredAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type EnrollmentRecord = z.infer<typeof enrollmentRecordSchema>;

export const grantEnrollmentSchema = z.object({
  user_id: z.number().int().positive(),
  source: enrollmentSourceSchema.default('admin_granted'),
  expired_at: z.coerce.date().optional(),
});

export const updateEnrollmentSchema = z
  .object({
    status: enrollmentStatusSchema.optional(),
    expired_at: z.coerce.date().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export type GrantEnrollmentInput = z.infer<typeof grantEnrollmentSchema>;
export type UpdateEnrollmentInput = z.infer<typeof updateEnrollmentSchema>;

export function parseGrantEnrollmentInput(body: unknown): GrantEnrollmentInput {
  return grantEnrollmentSchema.parse(body);
}

export function parseUpdateEnrollmentInput(
  body: unknown,
): UpdateEnrollmentInput {
  return updateEnrollmentSchema.parse(body);
}

export function parseUserIdParam(value: string): number {
  const parsed = z.coerce.number().int().positive().safeParse(value);
  if (!parsed.success) {
    throw parsed.error;
  }
  return parsed.data;
}
