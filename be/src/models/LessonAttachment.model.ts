import { z } from 'zod';

/**
 * Public shape of a lesson attachment returned to admins and students.
 * Combines the join row (lesson_attachments) with the underlying media file so
 * clients can render a name and a download URL directly.
 */
export const lessonAttachmentSchema = z.object({
  id: z.string().uuid(),
  lessonId: z.string().uuid(),
  mediaId: z.string().uuid(),
  name: z.string().min(1),
  url: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.number().int().nonnegative(),
  order: z.number().int(),
  createdAt: z.coerce.date(),
});

export type LessonAttachmentPublic = z.infer<typeof lessonAttachmentSchema>;

export const attachLessonMediaSchema = z.object({
  mediaId: z.string().uuid(),
  title: z.string().trim().min(1).max(255).optional(),
});

export type AttachLessonMediaInput = z.infer<typeof attachLessonMediaSchema>;

export const lessonAttachmentIdParamSchema = z.object({
  attachmentId: z.string().uuid(),
});

export function parseAttachLessonMediaInput(
  data: unknown,
): AttachLessonMediaInput {
  return attachLessonMediaSchema.parse(data);
}

export function parseLessonAttachmentIdParam(data: unknown): string {
  return lessonAttachmentIdParamSchema.parse(data).attachmentId;
}

export function parseLessonAttachment(data: unknown): LessonAttachmentPublic {
  return lessonAttachmentSchema.parse(data);
}
