import { z } from 'zod';

export const courseSectionRecordSchema = z.object({
  id: z.string().uuid(),
  courseId: z.string().uuid(),
  title: z.string().min(1).max(255),
  order: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type CourseSectionRecord = z.infer<typeof courseSectionRecordSchema>;

export const createCourseSectionSchema = z.object({
  title: z.string().min(1).max(255),
  order: z.number().int().min(0).optional(),
});

export const updateCourseSectionSchema = z
  .object({
    title: z.string().min(1).max(255).optional(),
    order: z.number().int().min(0).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export type CreateCourseSectionInput = z.infer<typeof createCourseSectionSchema>;
export type UpdateCourseSectionInput = z.infer<typeof updateCourseSectionSchema>;

export function parseCreateCourseSectionInput(
  body: unknown,
): CreateCourseSectionInput {
  return createCourseSectionSchema.parse(body);
}

export function parseUpdateCourseSectionInput(
  body: unknown,
): UpdateCourseSectionInput {
  return updateCourseSectionSchema.parse(body);
}
