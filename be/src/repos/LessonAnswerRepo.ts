import { asc, eq, inArray } from 'drizzle-orm';

import db from '@src/db';
import {
  lessonAnswersTable,
  type LessonAnswer,
  type NewLessonAnswer,
} from '@src/db/schema/lesson-answer';
import { usersTable } from '@src/db/schema/user';

export type LessonAnswerRow = LessonAnswer & {
  userName: string | null;
};

export async function create(data: NewLessonAnswer): Promise<LessonAnswer> {
  const rows = await db.insert(lessonAnswersTable).values(data).returning();
  return rows[0];
}

export async function listByQuestion(
  questionId: string,
): Promise<LessonAnswerRow[]> {
  const rows = await db
    .select({
      answer: lessonAnswersTable,
      userName: usersTable.userName,
    })
    .from(lessonAnswersTable)
    .leftJoin(usersTable, eq(lessonAnswersTable.userId, usersTable.id))
    .where(eq(lessonAnswersTable.questionId, questionId))
    .orderBy(asc(lessonAnswersTable.createdAt));
  return rows.map((row) => ({ ...row.answer, userName: row.userName }));
}

export async function listByQuestionIds(
  questionIds: string[],
): Promise<Map<string, LessonAnswerRow[]>> {
  const result = new Map<string, LessonAnswerRow[]>();
  if (questionIds.length === 0) return result;
  const rows = await db
    .select({
      answer: lessonAnswersTable,
      userName: usersTable.userName,
    })
    .from(lessonAnswersTable)
    .leftJoin(usersTable, eq(lessonAnswersTable.userId, usersTable.id))
    .where(inArray(lessonAnswersTable.questionId, questionIds))
    .orderBy(asc(lessonAnswersTable.createdAt));
  for (const row of rows) {
    const list = result.get(row.answer.questionId) ?? [];
    list.push({ ...row.answer, userName: row.userName });
    result.set(row.answer.questionId, list);
  }
  return result;
}

export type { LessonAnswer };
