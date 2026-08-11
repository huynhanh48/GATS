import { z } from 'zod';

export const courseReviewRecordSchema = z.object({
  id: z.string().uuid(),
  courseId: z.string().uuid(),
  userId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  content: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type CourseReviewRecord = z.infer<typeof courseReviewRecordSchema>;

export const upsertCourseReviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  content: z.string().trim().max(2000).optional().nullable(),
});

export type UpsertCourseReviewInput = z.infer<
  typeof upsertCourseReviewSchema
>;

export function parseCourseReviewRecord(data: unknown): CourseReviewRecord {
  return courseReviewRecordSchema.parse(data);
}

export function parseUpsertCourseReviewInput(
  data: unknown,
): UpsertCourseReviewInput {
  return upsertCourseReviewSchema.parse(data);
}
