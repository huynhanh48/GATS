import { and, eq } from 'drizzle-orm';

import db from '@src/db';
import { courseReviewMilestonesTable } from '@src/db/schema/course-review-milestone';

export async function listByUserAndCourse(userId: number, courseId: string) {
  return db
    .select()
    .from(courseReviewMilestonesTable)
    .where(
      and(
        eq(courseReviewMilestonesTable.userId, userId),
        eq(courseReviewMilestonesTable.courseId, courseId),
      ),
    );
}

export async function record(data: {
  userId: number;
  courseId: string;
  milestone: number;
  progressPercent: number;
  completedLessons: number;
  totalLessons: number;
  status: 'skipped' | 'prompted';
  source: string;
  deviceId?: string;
  metadata?: Record<string, unknown>;
}) {
  const rows = await db
    .insert(courseReviewMilestonesTable)
    .values({
      ...data,
      deviceId: data.deviceId ?? null,
      metadata: data.metadata ?? null,
      promptedAt: data.status === 'prompted' ? new Date() : null,
    })
    .onConflictDoNothing({
      target: [
        courseReviewMilestonesTable.userId,
        courseReviewMilestonesTable.courseId,
        courseReviewMilestonesTable.milestone,
      ],
    })
    .returning();
  return rows[0];
}

export async function resolveAfterReview(userId: number, courseId: string) {
  await db
    .update(courseReviewMilestonesTable)
    .set({ status: 'reviewed', resolvedAt: new Date(), updatedAt: new Date() })
    .where(
      and(
        eq(courseReviewMilestonesTable.userId, userId),
        eq(courseReviewMilestonesTable.courseId, courseId),
      ),
    );
}
