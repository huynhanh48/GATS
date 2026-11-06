import { z } from 'zod';

export const courseLearningOutcomeRecordSchema = z.object({
  id: z.string().uuid(),
  courseId: z.string().uuid(),
  content: z.string(),
  order: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type CourseLearningOutcomeRecord = z.infer<
  typeof courseLearningOutcomeRecordSchema
>;

export function parseCourseLearningOutcomeRecord(
  data: unknown,
): CourseLearningOutcomeRecord {
  return courseLearningOutcomeRecordSchema.parse(data);
}
