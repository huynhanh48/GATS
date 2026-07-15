import {
  boolean,
  index,
  integer,
  pgTable,
  real,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { quizAttemptStatusEnum, quizzesTable } from './quiz';
import { usersTable } from './user';

export const quizAttemptsTable = pgTable(
  'quiz_attempts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    quizId: uuid('quiz_id')
      .notNull()
      .references(() => quizzesTable.id, { onDelete: 'cascade' }),
    userId: integer('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    attemptNumber: integer('attempt_number').notNull(),
    status: quizAttemptStatusEnum('status').notNull().default('in_progress'),
    score: real('score'),
    maxScore: real('max_score'),
    percentage: real('percentage'),
    passed: boolean('passed'),
    startedAt: timestamp('started_at').notNull().defaultNow(),
    submittedAt: timestamp('submitted_at'),
    gradedAt: timestamp('graded_at'),
    expiresAt: timestamp('expires_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_quiz_attempts_unique').on(
      table.quizId,
      table.userId,
      table.attemptNumber,
    ),
    index('idx_quiz_attempts_user_quiz').on(table.userId, table.quizId),
  ],
);

export type QuizAttempt = typeof quizAttemptsTable.$inferSelect;
export type NewQuizAttempt = typeof quizAttemptsTable.$inferInsert;
