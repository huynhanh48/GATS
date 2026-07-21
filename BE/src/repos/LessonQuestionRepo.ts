import { and, desc, eq } from 'drizzle-orm';

import db from '@src/db';
import {
  lessonQuestionsTable,
  type LessonQuestion,
  type NewLessonQuestion,
} from '@src/db/schema/lesson-question';
import { usersTable } from '@src/db/schema/user';

export type LessonQuestionRow = LessonQuestion & {
  userName: string | null;
};

export async function create(
  data: NewLessonQuestion,
): Promise<LessonQuestion> {
  const rows = await db.insert(lessonQuestionsTable).values(data).returning();
  return rows[0];
}

export async function findById(
  id: string,
): Promise<LessonQuestion | undefined> {
  const rows = await db
    .select()
    .from(lessonQuestionsTable)
    .where(eq(lessonQuestionsTable.id, id))
    .limit(1);
  return rows[0];
}

export async function listByLesson(
  lessonId: string,
): Promise<LessonQuestionRow[]> {
  const rows = await db
    .select({
      question: lessonQuestionsTable,
      userName: usersTable.userName,
    })
    .from(lessonQuestionsTable)
    .leftJoin(usersTable, eq(lessonQuestionsTable.userId, usersTable.id))
    .where(eq(lessonQuestionsTable.lessonId, lessonId))
    .orderBy(desc(lessonQuestionsTable.createdAt));
  return rows.map((row) => ({ ...row.question, userName: row.userName }));
}

export async function listByCourse(
  courseId: string,
): Promise<LessonQuestionRow[]> {
  const rows = await db
    .select({
      question: lessonQuestionsTable,
      userName: usersTable.userName,
    })
    .from(lessonQuestionsTable)
    .leftJoin(usersTable, eq(lessonQuestionsTable.userId, usersTable.id))
    .where(eq(lessonQuestionsTable.courseId, courseId))
    .orderBy(desc(lessonQuestionsTable.createdAt));
  return rows.map((row) => ({ ...row.question, userName: row.userName }));
}

export async function updateResolved(
  id: string,
  isResolved: boolean,
): Promise<LessonQuestion | undefined> {
  const rows = await db
    .update(lessonQuestionsTable)
    .set({ isResolved, updatedAt: new Date() })
    .where(eq(lessonQuestionsTable.id, id))
    .returning();
  return rows[0];
}

export async function removeIfOwner(
  id: string,
  userId: number,
): Promise<boolean> {
  const rows = await db
    .delete(lessonQuestionsTable)
    .where(
      and(
        eq(lessonQuestionsTable.id, id),
        eq(lessonQuestionsTable.userId, userId),
      ),
    )
    .returning();
  return rows.length > 0;
}

export type { LessonQuestion };
