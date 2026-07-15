import { z } from 'zod';

export const courseIncludeRecordSchema = z.object({
  id: z.string().uuid(),
  courseId: z.string().uuid(),
  key: z.string(),
  label: z.string(),
  value: z.number().int().nullable(),
  unit: z.string().nullable(),
  order: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type CourseIncludeRecord = z.infer<typeof courseIncludeRecordSchema>;

export function parseCourseIncludeRecord(data: unknown): CourseIncludeRecord {
  return courseIncludeRecordSchema.parse(data);
}
