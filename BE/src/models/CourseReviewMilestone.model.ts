import { z } from 'zod';

export const courseReviewCheckpointSchema = z.object({
  source: z.enum([
    'lesson_completed',
    'quiz_passed',
    'assignment_completed',
    'progress_sync',
  ]),
  deviceId: z.string().trim().min(1).max(128).optional(),
  lessonId: z.string().uuid().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type CourseReviewCheckpointInput = z.infer<
  typeof courseReviewCheckpointSchema
>;

export function parseCourseReviewCheckpointInput(data: unknown) {
  return courseReviewCheckpointSchema.parse(data);
}
