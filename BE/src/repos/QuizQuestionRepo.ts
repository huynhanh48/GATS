import { and, asc, eq, inArray, max, sql } from 'drizzle-orm';

import db from '@src/db';
import {
  type QuizQuestion,
  quizQuestionsTable,
  type QuizQuestionType,
} from '@src/db/schema/quiz-question';
import {
  type QuizQuestionAnswer,
  quizQuestionAnswersTable,
} from '@src/db/schema/quiz-question-answer';

const ORDER_CONFLICT_CODE = '23505';
const MAX_ORDER_RETRIES = 3;
const REORDER_OFFSET = 100000;

type AnswerInput = {
  answer: string;
  isCorrect: boolean;
};

type QuestionWithAnswers = QuizQuestion & {
  answers: QuizQuestionAnswer[];
};

function isUniqueConflict(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === ORDER_CONFLICT_CODE
  );
}

function mapAnswers(
  questionId: string,
  type: QuizQuestionType,
  answers: AnswerInput[],
) {
  return answers.map((answer, index) => ({
    questionId,
    answer: answer.answer,
    isCorrect: answer.isCorrect,
    type,
    order: index,
  }));
}

export async function findById(id: string): Promise<QuizQuestion | undefined> {
  const rows = await db
    .select()
    .from(quizQuestionsTable)
    .where(eq(quizQuestionsTable.id, id))
    .limit(1);
  return rows[0];
}

export async function findByIdWithAnswers(
  id: string,
): Promise<QuestionWithAnswers | undefined> {
  const question = await findById(id);
  if (!question) return undefined;
  const answers = await listAnswersByQuestionId(id);
  return { ...question, answers };
}

export async function listByQuizId(quizId: string): Promise<QuizQuestion[]> {
  return db
    .select()
    .from(quizQuestionsTable)
    .where(eq(quizQuestionsTable.quizId, quizId))
    .orderBy(asc(quizQuestionsTable.order));
}

export async function listWithAnswersByQuizId(
  quizId: string,
): Promise<QuestionWithAnswers[]> {
  const questions = await listByQuizId(quizId);
  const answers = await listAnswersByQuestionIds(questions.map((q) => q.id));
  return questions.map((question) => ({
    ...question,
    answers: answers.filter((answer) => answer.questionId === question.id),
  }));
}

export async function listAnswersByQuestionId(
  questionId: string,
): Promise<QuizQuestionAnswer[]> {
  return db
    .select()
    .from(quizQuestionAnswersTable)
    .where(eq(quizQuestionAnswersTable.questionId, questionId))
    .orderBy(asc(quizQuestionAnswersTable.order));
}

export async function listAnswersByQuestionIds(
  questionIds: string[],
): Promise<QuizQuestionAnswer[]> {
  if (questionIds.length === 0) return [];
  return db
    .select()
    .from(quizQuestionAnswersTable)
    .where(inArray(quizQuestionAnswersTable.questionId, questionIds))
    .orderBy(asc(quizQuestionAnswersTable.order));
}

export async function getNextOrder(quizId: string): Promise<number> {
  const [result] = await db
    .select({ maxOrder: max(quizQuestionsTable.order) })
    .from(quizQuestionsTable)
    .where(eq(quizQuestionsTable.quizId, quizId));
  return (result?.maxOrder ?? -1) + 1;
}

export async function createQuestionWithAnswers(data: {
  quizId: string;
  type: QuizQuestionType;
  question: string;
  description?: string | null;
  explanation?: string | null;
  points?: number;
  isRequired?: boolean;
  caseSensitive?: boolean;
  answers: AnswerInput[];
}): Promise<QuestionWithAnswers> {
  for (let attempt = 1; attempt <= MAX_ORDER_RETRIES; attempt += 1) {
    try {
      return await db.transaction(async (tx) => {
        await tx.execute(
          sql`select id from quizzes where id = ${data.quizId} for update`,
        );
        const [orderRow] = await tx
          .select({ maxOrder: max(quizQuestionsTable.order) })
          .from(quizQuestionsTable)
          .where(eq(quizQuestionsTable.quizId, data.quizId));
        const nextOrder = (orderRow?.maxOrder ?? -1) + 1;

        const questionRows = await tx
          .insert(quizQuestionsTable)
          .values({
            quizId: data.quizId,
            type: data.type,
            question: data.question,
            description: data.description ?? null,
            explanation: data.explanation ?? null,
            points: data.points ?? 1,
            order: nextOrder,
            isRequired: data.isRequired ?? true,
            caseSensitive: data.caseSensitive ?? false,
          })
          .returning();

        const question = questionRows[0];
        const answers = data.answers.length
          ? await tx
              .insert(quizQuestionAnswersTable)
              .values(mapAnswers(question.id, data.type, data.answers))
              .returning()
          : [];

        return { ...question, answers };
      });
    } catch (error) {
      if (!isUniqueConflict(error) || attempt === MAX_ORDER_RETRIES) {
        throw error;
      }
    }
  }

  throw new Error('Failed to create quiz question');
}

export async function createQuestion(data: {
  quizId: string;
  type: QuizQuestionType;
  question?: string;
  title?: string;
  description?: string | null;
  explanation?: string | null;
  points?: number;
  order?: number;
  isRequired?: boolean;
  caseSensitive?: boolean;
}): Promise<QuizQuestion> {
  const rows = await db
    .insert(quizQuestionsTable)
    .values({
      quizId: data.quizId,
      type: data.type,
      question: data.question ?? data.title ?? '',
      description: data.description ?? null,
      explanation: data.explanation ?? null,
      points: data.points ?? 1,
      order: data.order ?? (await getNextOrder(data.quizId)),
      isRequired: data.isRequired ?? true,
      caseSensitive: data.caseSensitive ?? false,
    })
    .returning();
  return rows[0];
}

export async function createAnswers(
  questionId: string,
  type: QuizQuestionType,
  answers: AnswerInput[],
): Promise<QuizQuestionAnswer[]> {
  if (answers.length === 0) return [];
  return db
    .insert(quizQuestionAnswersTable)
    .values(mapAnswers(questionId, type, answers))
    .returning();
}

export async function updateQuestionWithAnswers(
  id: string,
  data: {
    type: QuizQuestionType;
    question: string;
    description?: string | null;
    explanation?: string | null;
    points?: number;
    isRequired?: boolean;
    caseSensitive?: boolean;
    answers: AnswerInput[];
  },
): Promise<QuestionWithAnswers | undefined> {
  return db.transaction(async (tx) => {
    const existing = await tx
      .select()
      .from(quizQuestionsTable)
      .where(eq(quizQuestionsTable.id, id))
      .limit(1);
    if (!existing[0]) return undefined;

    const updatedRows = await tx
      .update(quizQuestionsTable)
      .set({
        type: data.type,
        question: data.question,
        description: data.description ?? null,
        explanation: data.explanation ?? null,
        points: data.points ?? 1,
        isRequired: data.isRequired ?? true,
        caseSensitive: data.caseSensitive ?? false,
        updatedAt: new Date(),
      })
      .where(eq(quizQuestionsTable.id, id))
      .returning();

    await tx
      .delete(quizQuestionAnswersTable)
      .where(eq(quizQuestionAnswersTable.questionId, id));

    const answers = data.answers.length
      ? await tx
          .insert(quizQuestionAnswersTable)
          .values(mapAnswers(id, data.type, data.answers))
          .returning()
      : [];

    return { ...updatedRows[0], answers };
  });
}

export async function updateQuestion(
  id: string,
  data: Partial<{
    type: QuizQuestionType;
    question: string;
    title: string;
    description: string | null;
    explanation: string | null;
    points: number;
    order: number;
    isRequired: boolean;
    caseSensitive: boolean;
  }>,
): Promise<QuizQuestion | undefined> {
  const rows = await db
    .update(quizQuestionsTable)
    .set({
      ...(data.type !== undefined ? { type: data.type } : {}),
      ...(data.question !== undefined
        ? { question: data.question }
        : data.title !== undefined
          ? { question: data.title }
          : {}),
      ...(data.description !== undefined
        ? { description: data.description }
        : {}),
      ...(data.explanation !== undefined
        ? { explanation: data.explanation }
        : {}),
      ...(data.points !== undefined ? { points: data.points } : {}),
      ...(data.order !== undefined ? { order: data.order } : {}),
      ...(data.isRequired !== undefined ? { isRequired: data.isRequired } : {}),
      ...(data.caseSensitive !== undefined
        ? { caseSensitive: data.caseSensitive }
        : {}),
      updatedAt: new Date(),
    })
    .where(eq(quizQuestionsTable.id, id))
    .returning();
  return rows[0];
}

export async function removeQuestion(id: string): Promise<boolean> {
  return db.transaction(async (tx) => {
    const existing = await tx
      .select()
      .from(quizQuestionsTable)
      .where(eq(quizQuestionsTable.id, id))
      .limit(1);
    const question = existing[0];
    if (!question) return false;

    await tx.delete(quizQuestionsTable).where(eq(quizQuestionsTable.id, id));

    const remaining = await tx
      .select()
      .from(quizQuestionsTable)
      .where(eq(quizQuestionsTable.quizId, question.quizId))
      .orderBy(asc(quizQuestionsTable.order));

    for (let index = 0; index < remaining.length; index += 1) {
      await tx
        .update(quizQuestionsTable)
        .set({ order: index + REORDER_OFFSET, updatedAt: new Date() })
        .where(eq(quizQuestionsTable.id, remaining[index].id));
    }

    for (let index = 0; index < remaining.length; index += 1) {
      await tx
        .update(quizQuestionsTable)
        .set({ order: index, updatedAt: new Date() })
        .where(eq(quizQuestionsTable.id, remaining[index].id));
    }

    return true;
  });
}

export async function reorderQuestions(
  quizId: string,
  questionIds: string[],
): Promise<void> {
  await db.transaction(async (tx) => {
    const questions = await tx
      .select()
      .from(quizQuestionsTable)
      .where(eq(quizQuestionsTable.quizId, quizId))
      .orderBy(asc(quizQuestionsTable.order));

    const knownIds = new Set(questions.map((question) => question.id));
    const requestedIds = new Set(questionIds);
    if (
      questionIds.length !== questions.length ||
      requestedIds.size !== questionIds.length ||
      questionIds.some((id) => !knownIds.has(id))
    ) {
      throw new Error('Invalid question reorder payload');
    }

    for (const question of questions) {
      await tx
        .update(quizQuestionsTable)
        .set({
          order: question.order + REORDER_OFFSET,
          updatedAt: new Date(),
        })
        .where(eq(quizQuestionsTable.id, question.id));
    }

    for (let index = 0; index < questionIds.length; index += 1) {
      await tx
        .update(quizQuestionsTable)
        .set({ order: index, updatedAt: new Date() })
        .where(
          and(
            eq(quizQuestionsTable.id, questionIds[index]),
            eq(quizQuestionsTable.quizId, quizId),
          ),
        );
    }
  });
}

export async function findQuestionQuizId(
  questionId: string,
): Promise<string | undefined> {
  const row = await findById(questionId);
  return row?.quizId;
}

export async function listOptionsByQuestionIds(questionIds: string[]) {
  const answers = await listAnswersByQuestionIds(questionIds);
  return answers.map((answer) => ({
    ...answer,
    content: answer.answer,
  }));
}

export async function listAcceptedAnswersByQuestionIds(questionIds: string[]) {
  const answers = await listAnswersByQuestionIds(questionIds);
  return answers
    .filter((answer) => answer.isCorrect)
    .map((answer) => ({
      ...answer,
      content: answer.answer,
      isExact: true,
    }));
}

export async function createOptions(
  questionId: string,
  options: Array<{ content: string; isCorrect: boolean; order: number }>,
) {
  const question = await findById(questionId);
  if (!question) return [];
  return createAnswers(
    questionId,
    question.type,
    options
      .sort((a, b) => a.order - b.order)
      .map((option) => ({
        answer: option.content,
        isCorrect: option.isCorrect,
      })),
  );
}

export async function createAcceptedAnswers(
  questionId: string,
  answers: Array<{ content: string }>,
) {
  const question = await findById(questionId);
  if (!question) return [];
  return createAnswers(
    questionId,
    question.type,
    answers.map((answer) => ({
      answer: answer.content,
      isCorrect: true,
    })),
  );
}

export async function replaceOptions(
  questionId: string,
  options: Array<{ content: string; isCorrect: boolean; order: number }>,
) {
  const question = await findById(questionId);
  if (!question) return [];
  await db
    .delete(quizQuestionAnswersTable)
    .where(eq(quizQuestionAnswersTable.questionId, questionId));
  return createOptions(questionId, options);
}

export async function replaceAcceptedAnswers(
  questionId: string,
  answers: Array<{ content: string }>,
) {
  const question = await findById(questionId);
  if (!question) return [];
  await db
    .delete(quizQuestionAnswersTable)
    .where(eq(quizQuestionAnswersTable.questionId, questionId));
  return createAcceptedAnswers(questionId, answers);
}
