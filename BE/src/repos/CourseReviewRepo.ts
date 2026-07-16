import { and, avg, count, eq } from 'drizzle-orm';

import db from '@src/db';
import {
  courseReviewsTable,
  type NewCourseReview,
} from '@src/db/schema/course-review';
import {
  type CourseReviewRecord,
  parseCourseReviewRecord,
} from '@src/models/CourseReview.model';

function parseRow(row: unknown): CourseReviewRecord {
  return parseCourseReviewRecord(row);
}

function roundAverageRating(value: number | null): number | null {
  if (value === null) {
    return null;
  }
  return Math.round(value * 10) / 10;
}

export async function getStatsByCourse(courseId: string): Promise<{
  ratingCount: number;
  averageRating: number | null;
}> {
  const [row] = await db
    .select({
      ratingCount: count(courseReviewsTable.id),
      averageRating: avg(courseReviewsTable.rating),
    })
    .from(courseReviewsTable)
    .where(eq(courseReviewsTable.courseId, courseId));

  const ratingCount = Number(row?.ratingCount ?? 0);
  if (ratingCount === 0) {
    return { ratingCount: 0, averageRating: null };
  }

  const rawAverage = row?.averageRating;
  const averageRating =
    rawAverage === null || rawAverage === undefined
      ? null
      : roundAverageRating(Number(rawAverage));

  return { ratingCount, averageRating };
}

export async function findByCourseAndUser(
  courseId: string,
  userId: number,
): Promise<CourseReviewRecord | undefined> {
  const rows = await db
    .select()
    .from(courseReviewsTable)
    .where(
      and(
        eq(courseReviewsTable.courseId, courseId),
        eq(courseReviewsTable.userId, userId),
      ),
    )
    .limit(1);
  return rows[0] ? parseRow(rows[0]) : undefined;
}

export async function upsert(data: NewCourseReview): Promise<CourseReviewRecord> {
  const rows = await db
    .insert(courseReviewsTable)
    .values(data)
    .onConflictDoUpdate({
      target: [courseReviewsTable.courseId, courseReviewsTable.userId],
      set: {
        rating: data.rating,
        content: data.content ?? null,
        updatedAt: new Date(),
      },
    })
    .returning();
  return parseRow(rows[0]);
}
