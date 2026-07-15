import {
  boolean,
  integer,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { quizAttemptsTable } from './quiz-attempt';
import { quizQuestionsTable } from './quiz-question';
import { usersTable } from './user';

export const quizAnswersTable = pgTable(
  'quiz_answers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    attemptId: uuid('attempt_id')
      .notNull()
      .references(() => quizAttemptsTable.id, { onDelete: 'cascade' }),
    questionId: uuid('question_id')
      .notNull()
      .references(() => quizQuestionsTable.id, { onDelete: 'cascade' }),
    textAnswer: text('text_answer'),
    isCorrect: boolean('is_correct'),
    score: real('score'),
    feedback: text('feedback'),
    gradedById: integer('graded_by_id').references(() => usersTable.id, {
      onDelete: 'set null',
    }),
    gradedAt: timestamp('graded_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_quiz_answers_attempt_question').on(
      table.attemptId,
      table.questionId,
    ),
  ],
);

export type QuizAnswer = typeof quizAnswersTable.$inferSelect;
export type NewQuizAnswer = typeof quizAnswersTable.$inferInsert;
