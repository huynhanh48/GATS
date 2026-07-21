import { lessonTypeEnum } from '@src/db/schema/lesson';
import { z } from 'zod';

export const lessonTypeSchema = z.enum(lessonTypeEnum.enumValues);

export const lessonRecordSchema = z.object({
  id: z.string().uuid(),
  courseId: z.string().uuid(),
  sectionId: z.string().uuid(),
  title: z.string().min(1).max(255),
  description: z.string().nullable(),
  type: lessonTypeSchema,
  order: z.number().int(),
  content: z.string().nullable(),
  isPreview: z.boolean(),
  duration: z.number().int().nullable(),
  linkedPostId: z.string().uuid().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type LessonRecord = z.infer<typeof lessonRecordSchema>;

export const createLessonSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  type: lessonTypeSchema.default('video'),
  order: z.number().int().min(0).optional(),
  content: z.string().optional(),
  is_preview: z.boolean().default(false),
  duration: z.number().int().min(0).optional(),
  linked_post_id: z.string().uuid().nullable().optional(),
});

export const updateLessonSchema = z
  .object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().nullable().optional(),
    type: lessonTypeSchema.optional(),
    order: z.number().int().min(0).optional(),
    content: z.string().nullable().optional(),
    is_preview: z.boolean().optional(),
    duration: z.number().int().min(0).nullable().optional(),
    linked_post_id: z.string().uuid().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;

export function parseCreateLessonInput(body: unknown): CreateLessonInput {
  return createLessonSchema.parse(body);
}

export function parseUpdateLessonInput(body: unknown): UpdateLessonInput {
  return updateLessonSchema.parse(body);
}
