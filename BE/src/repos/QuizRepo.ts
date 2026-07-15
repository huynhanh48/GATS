import { and, asc, count, eq } from 'drizzle-orm';

import db from '@src/db';
import { quizzesTable, type Quiz } from '@src/db/schema/quiz';
import { quizAttemptsTable } from '@src/db/schema/quiz-attempt';

export async function findById(id: string): Promise<Quiz | undefined> {
  const rows = await db
    .select()
    .from(quizzesTable)
    .where(eq(quizzesTable.id, id))
    .limit(1);
  return rows[0];
}

export async function findByLessonId(lessonId: string): Promise<Quiz | undefined> {
  const rows = await db
    .select()
    .from(quizzesTable)
    .where(eq(quizzesTable.lessonId, lessonId))
    .limit(1);
  return rows[0];
}

export async function create(data: {
  lessonId: string;
  title?: string | null;
  description?: string | null;
  passingScore?: number;
  timeLimit?: number | null;
  maxAttempts?: number;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  showResult?: boolean;
  showCorrectAnswer?: boolean;
  showExplanation?: boolean;
  availableFrom?: Date | null;
  availableUntil?: Date | null;
}): Promise<Quiz> {
  const rows = await db
    .insert(quizzesTable)
    .values({
      lessonId: data.lessonId,
      title: data.title ?? null,
      description: data.description ?? null,
      passingScore: data.passingScore ?? 70,
      timeLimit: data.timeLimit ?? null,
      maxAttempts: data.maxAttempts ?? 1,
      shuffleQuestions: data.shuffleQuestions ?? false,
      shuffleOptions: data.shuffleOptions ?? false,
      showResult: data.showResult ?? true,
      showCorrectAnswer: data.showCorrectAnswer ?? false,
      showExplanation: data.showExplanation ?? true,
      availableFrom: data.availableFrom ?? null,
      availableUntil: data.availableUntil ?? null,
    })
    .returning();
  return rows[0];
}

export async function update(
  id: string,
  data: Partial<{
    title: string | null;
    description: string | null;
    passingScore: number;
    timeLimit: number | null;
    maxAttempts: number;
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    showResult: boolean;
    showCorrectAnswer: boolean;
    showExplanation: boolean;
    availableFrom: Date | null;
    availableUntil: Date | null;
  }>,
): Promise<Quiz | undefined> {
  const rows = await db
    .update(quizzesTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(quizzesTable.id, id))
    .returning();
  return rows[0];
}

export async function countAttemptsByUser(
  quizId: string,
  userId: number,
): Promise<number> {
  const [result] = await db
    .select({ total: count() })
    .from(quizAttemptsTable)
    .where(
      and(
        eq(quizAttemptsTable.quizId, quizId),
        eq(quizAttemptsTable.userId, userId),
      ),
    );
  return Number(result?.total ?? 0);
}

export async function getMaxAttemptNumber(
  quizId: string,
  userId: number,
): Promise<number> {
  const rows = await db
    .select({ attemptNumber: quizAttemptsTable.attemptNumber })
    .from(quizAttemptsTable)
    .where(
      and(
        eq(quizAttemptsTable.quizId, quizId),
        eq(quizAttemptsTable.userId, userId),
      ),
    )
    .orderBy(asc(quizAttemptsTable.attemptNumber));
  if (rows.length === 0) return 0;
  return Math.max(...rows.map((r) => r.attemptNumber));
}
