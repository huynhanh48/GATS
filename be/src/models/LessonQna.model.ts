import { z } from 'zod';

export const createLessonQuestionSchema = z.object({
  content: z.string().trim().min(3).max(3000),
});

export type CreateLessonQuestionInput = z.infer<
  typeof createLessonQuestionSchema
>;

export function parseCreateLessonQuestionInput(
  data: unknown,
): CreateLessonQuestionInput {
  return createLessonQuestionSchema.parse(data);
}

export const createLessonAnswerSchema = z.object({
  content: z.string().trim().min(1).max(3000),
});

export type CreateLessonAnswerInput = z.infer<typeof createLessonAnswerSchema>;

export function parseCreateLessonAnswerInput(
  data: unknown,
): CreateLessonAnswerInput {
  return createLessonAnswerSchema.parse(data);
}

export const updateLessonQuestionSchema = z.object({
  isResolved: z.boolean().optional(),
});

export type UpdateLessonQuestionInput = z.infer<
  typeof updateLessonQuestionSchema
>;

export function parseUpdateLessonQuestionInput(
  data: unknown,
): UpdateLessonQuestionInput {
  return updateLessonQuestionSchema.parse(data);
}

export const createLessonNoteSchema = z.object({
  content: z.string().trim().min(1).max(5000),
  timestampSeconds: z.number().int().min(0).nullable().optional(),
});

export type CreateLessonNoteInput = z.infer<typeof createLessonNoteSchema>;

export function parseCreateLessonNoteInput(
  data: unknown,
): CreateLessonNoteInput {
  return createLessonNoteSchema.parse(data);
}

export const updateLessonNoteSchema = z.object({
  content: z.string().trim().min(1).max(5000).optional(),
  timestampSeconds: z.number().int().min(0).nullable().optional(),
});

export type UpdateLessonNoteInput = z.infer<typeof updateLessonNoteSchema>;

export function parseUpdateLessonNoteInput(
  data: unknown,
): UpdateLessonNoteInput {
  return updateLessonNoteSchema.parse(data);
}

export const createLessonBookmarkSchema = z.object({
  label: z.string().trim().max(255).optional().or(z.literal('')),
  timestampSeconds: z.number().int().min(0).nullable().optional(),
});

export type CreateLessonBookmarkInput = z.infer<
  typeof createLessonBookmarkSchema
>;

export function parseCreateLessonBookmarkInput(
  data: unknown,
): CreateLessonBookmarkInput {
  return createLessonBookmarkSchema.parse(data);
}
