import { and, desc, eq, inArray } from 'drizzle-orm';

import db from '@src/db';
import { quizAnswerOptionsTable } from '@src/db/schema/quiz-answer-option';
import {
  quizAnswersTable,
  type QuizAnswer,
} from '@src/db/schema/quiz-answer';
import {
  quizAttemptsTable,
  type QuizAttempt,
} from '@src/db/schema/quiz-attempt';

export async function findAttemptById(
  id: string,
): Promise<QuizAttempt | undefined> {
  const rows = await db
    .select()
    .from(quizAttemptsTable)
    .where(eq(quizAttemptsTable.id, id))
    .limit(1);
  return rows[0];
}

export async function findInProgressAttempt(
  quizId: string,
  userId: number,
): Promise<QuizAttempt | undefined> {
  const rows = await db
    .select()
    .from(quizAttemptsTable)
    .where(
      and(
        eq(quizAttemptsTable.quizId, quizId),
        eq(quizAttemptsTable.userId, userId),
        eq(quizAttemptsTable.status, 'in_progress'),
      ),
    )
    .limit(1);
  return rows[0];
}

export async function listAttemptsByUser(
  quizId: string,
  userId: number,
): Promise<QuizAttempt[]> {
  return db
    .select()
    .from(quizAttemptsTable)
    .where(
      and(
        eq(quizAttemptsTable.quizId, quizId),
        eq(quizAttemptsTable.userId, userId),
      ),
    )
    .orderBy(desc(quizAttemptsTable.attemptNumber));
}

export async function createAttempt(data: {
  quizId: string;
  userId: number;
  attemptNumber: number;
  expiresAt?: Date | null;
}): Promise<QuizAttempt> {
  const rows = await db
    .insert(quizAttemptsTable)
    .values({
      quizId: data.quizId,
      userId: data.userId,
      attemptNumber: data.attemptNumber,
      status: 'in_progress',
      expiresAt: data.expiresAt ?? null,
    })
    .returning();
  return rows[0];
}

export async function updateAttempt(
  id: string,
  data: Partial<{
    status: QuizAttempt['status'];
    score: number | null;
    maxScore: number | null;
    percentage: number | null;
    passed: boolean | null;
    submittedAt: Date | null;
    gradedAt: Date | null;
    expiresAt: Date | null;
  }>,
): Promise<QuizAttempt | undefined> {
  const rows = await db
    .update(quizAttemptsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(quizAttemptsTable.id, id))
    .returning();
  return rows[0];
}

export async function findAnswer(
  attemptId: string,
  questionId: string,
): Promise<QuizAnswer | undefined> {
  const rows = await db
    .select()
    .from(quizAnswersTable)
    .where(
      and(
        eq(quizAnswersTable.attemptId, attemptId),
        eq(quizAnswersTable.questionId, questionId),
      ),
    )
    .limit(1);
  return rows[0];
}

export async function listAnswersByAttempt(
  attemptId: string,
): Promise<QuizAnswer[]> {
  return db
    .select()
    .from(quizAnswersTable)
    .where(eq(quizAnswersTable.attemptId, attemptId));
}

export async function listAnswerOptionsByAnswerIds(
  answerIds: string[],
): Promise<Array<{ answerId: string; optionId: string }>> {
  if (answerIds.length === 0) return [];
  const rows = await db
    .select()
    .from(quizAnswerOptionsTable)
    .where(inArray(quizAnswerOptionsTable.answerId, answerIds));
  return rows.map((r) => ({ answerId: r.answerId, optionId: r.optionId }));
}

export async function upsertAnswer(data: {
  attemptId: string;
  questionId: string;
  textAnswer?: string | null;
  selectedOptionIds?: string[];
}): Promise<QuizAnswer> {
  return db.transaction(async (tx) => {
    const existing = await tx
      .select()
      .from(quizAnswersTable)
      .where(
        and(
          eq(quizAnswersTable.attemptId, data.attemptId),
          eq(quizAnswersTable.questionId, data.questionId),
        ),
      )
      .limit(1);

    let answer: QuizAnswer;
    if (existing[0]) {
      const rows = await tx
        .update(quizAnswersTable)
        .set({
          textAnswer: data.textAnswer ?? null,
          updatedAt: new Date(),
        })
        .where(eq(quizAnswersTable.id, existing[0].id))
        .returning();
      answer = rows[0];
    } else {
      const rows = await tx
        .insert(quizAnswersTable)
        .values({
          attemptId: data.attemptId,
          questionId: data.questionId,
          textAnswer: data.textAnswer ?? null,
        })
        .returning();
      answer = rows[0];
    }

    await tx
      .delete(quizAnswerOptionsTable)
      .where(eq(quizAnswerOptionsTable.answerId, answer.id));

    if (data.selectedOptionIds && data.selectedOptionIds.length > 0) {
      await tx.insert(quizAnswerOptionsTable).values(
        data.selectedOptionIds.map((optionId) => ({
          answerId: answer.id,
          optionId,
        })),
      );
    }

    return answer;
  });
}

export async function updateAnswerAutoGrade(
  answerId: string,
  data: {
    score: number;
    isCorrect: boolean;
  },
): Promise<QuizAnswer | undefined> {
  const rows = await db
    .update(quizAnswersTable)
    .set({
      score: data.score,
      isCorrect: data.isCorrect,
      updatedAt: new Date(),
    })
    .where(eq(quizAnswersTable.id, answerId))
    .returning();
  return rows[0];
}

export async function updateAnswerGrade(
  answerId: string,
  data: {
    score: number;
    isCorrect?: boolean | null;
    feedback?: string | null;
    gradedById: number;
  },
): Promise<QuizAnswer | undefined> {
  const rows = await db
    .update(quizAnswersTable)
    .set({
      score: data.score,
      isCorrect: data.isCorrect ?? null,
      feedback: data.feedback ?? null,
      gradedById: data.gradedById,
      gradedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(quizAnswersTable.id, answerId))
    .returning();
  return rows[0];
}

export async function findAnswerById(
  answerId: string,
): Promise<QuizAnswer | undefined> {
  const rows = await db
    .select()
    .from(quizAnswersTable)
    .where(eq(quizAnswersTable.id, answerId))
    .limit(1);
  return rows[0];
}
