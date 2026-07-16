import { z } from 'zod';

export const LESSON_COMPLETION_PERCENT = 90;

export const lessonProgressRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.number().int().positive(),
  courseId: z.string().uuid(),
  lessonId: z.string().uuid(),
  videoId: z.string().uuid().nullable(),
  watchedSeconds: z.number().int().min(0),
  durationSeconds: z.number().int().min(0).nullable(),
  percent: z.number().int().min(0).max(100),
  isCompleted: z.boolean(),
  completedAt: z.coerce.date().nullable(),
  bestScore: z.number().nullable(),
  bestPercentage: z.number().nullable(),
  isPassed: z.boolean(),
  attemptCount: z.number().int().min(0),
  lastWatchedAt: z.coerce.date(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type LessonProgressRecord = z.infer<typeof lessonProgressRecordSchema>;

export const upsertLessonProgressSchema = z.object({
  watched_seconds: z.number().int().min(0),
  duration_seconds: z.number().int().min(0).optional(),
  video_id: z.string().uuid().optional(),
});

export type UpsertLessonProgressInput = z.infer<
  typeof upsertLessonProgressSchema
>;

export function parseUpsertLessonProgressInput(
  body: unknown,
): UpsertLessonProgressInput {
  return upsertLessonProgressSchema.parse(body);
}

export function calculateProgressPercent(
  watchedSeconds: number,
  durationSeconds: number | null | undefined,
): number {
  if (!durationSeconds || durationSeconds <= 0) {
    return 0;
  }
  return Math.min(100, Math.round((watchedSeconds / durationSeconds) * 100));
}

export function isLessonCompleted(percent: number): boolean {
  return percent >= LESSON_COMPLETION_PERCENT;
}
