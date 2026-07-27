import { z } from 'zod';

/** DB may still be integer until text-value migration; coerce for reads. */
const includeValueSchema = z
  .union([z.string(), z.number()])
  .nullable()
  .transform((value) => (value === null ? null : String(value)));

export const courseIncludeRecordSchema = z.object({
  id: z.string().uuid(),
  courseId: z.string().uuid(),
  key: z.string(),
  label: z.string(),
  value: includeValueSchema,
  unit: z.string().nullable(),
  order: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type CourseIncludeRecord = z.infer<typeof courseIncludeRecordSchema>;

export function parseCourseIncludeRecord(data: unknown): CourseIncludeRecord {
  return courseIncludeRecordSchema.parse(data);
}
