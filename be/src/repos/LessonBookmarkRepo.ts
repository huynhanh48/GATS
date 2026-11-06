import { and, desc, eq } from 'drizzle-orm';

import db from '@src/db';
import {
  lessonBookmarksTable,
  type LessonBookmark,
  type NewLessonBookmark,
} from '@src/db/schema/lesson-bookmark';

export async function create(
  data: NewLessonBookmark,
): Promise<LessonBookmark> {
  const rows = await db.insert(lessonBookmarksTable).values(data).returning();
  return rows[0];
}

export async function listByUserAndLesson(
  userId: number,
  lessonId: string,
): Promise<LessonBookmark[]> {
  return db
    .select()
    .from(lessonBookmarksTable)
    .where(
      and(
        eq(lessonBookmarksTable.userId, userId),
        eq(lessonBookmarksTable.lessonId, lessonId),
      ),
    )
    .orderBy(desc(lessonBookmarksTable.createdAt));
}

export async function listByUserAndCourse(
  userId: number,
  courseId: string,
): Promise<LessonBookmark[]> {
  return db
    .select()
    .from(lessonBookmarksTable)
    .where(
      and(
        eq(lessonBookmarksTable.userId, userId),
        eq(lessonBookmarksTable.courseId, courseId),
      ),
    )
    .orderBy(desc(lessonBookmarksTable.createdAt));
}

export async function removeIfOwner(
  id: string,
  userId: number,
): Promise<boolean> {
  const rows = await db
    .delete(lessonBookmarksTable)
    .where(
      and(
        eq(lessonBookmarksTable.id, id),
        eq(lessonBookmarksTable.userId, userId),
      ),
    )
    .returning();
  return rows.length > 0;
}

export type { LessonBookmark };
