import { and, desc, eq } from 'drizzle-orm';

import db from '@src/db';
import {
  lessonNotesTable,
  type LessonNote,
  type NewLessonNote,
} from '@src/db/schema/lesson-note';

export async function create(data: NewLessonNote): Promise<LessonNote> {
  const rows = await db.insert(lessonNotesTable).values(data).returning();
  return rows[0];
}

export async function findById(id: string): Promise<LessonNote | undefined> {
  const rows = await db
    .select()
    .from(lessonNotesTable)
    .where(eq(lessonNotesTable.id, id))
    .limit(1);
  return rows[0];
}

export async function listByUserAndLesson(
  userId: number,
  lessonId: string,
): Promise<LessonNote[]> {
  return db
    .select()
    .from(lessonNotesTable)
    .where(
      and(
        eq(lessonNotesTable.userId, userId),
        eq(lessonNotesTable.lessonId, lessonId),
      ),
    )
    .orderBy(desc(lessonNotesTable.createdAt));
}

export async function listByUserAndCourse(
  userId: number,
  courseId: string,
): Promise<LessonNote[]> {
  return db
    .select()
    .from(lessonNotesTable)
    .where(
      and(
        eq(lessonNotesTable.userId, userId),
        eq(lessonNotesTable.courseId, courseId),
      ),
    )
    .orderBy(desc(lessonNotesTable.createdAt));
}

export async function updateIfOwner(
  id: string,
  userId: number,
  patch: Partial<Pick<LessonNote, 'content' | 'timestampSeconds'>>,
): Promise<LessonNote | undefined> {
  const rows = await db
    .update(lessonNotesTable)
    .set({ ...patch, updatedAt: new Date() })
    .where(and(eq(lessonNotesTable.id, id), eq(lessonNotesTable.userId, userId)))
    .returning();
  return rows[0];
}

export async function removeIfOwner(
  id: string,
  userId: number,
): Promise<boolean> {
  const rows = await db
    .delete(lessonNotesTable)
    .where(and(eq(lessonNotesTable.id, id), eq(lessonNotesTable.userId, userId)))
    .returning();
  return rows.length > 0;
}

export type { LessonNote };
