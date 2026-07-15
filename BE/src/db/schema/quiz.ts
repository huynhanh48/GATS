import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { lessonsTable } from './lesson';

export const quizAttemptStatusEnum = pgEnum('quiz_attempt_status', [
  'in_progress',
  'submitted',
  'graded',
  'expired',
]);

export const quizzesTable = pgTable('quizzes', {
  id: uuid('id').primaryKey().defaultRandom(),
  lessonId: uuid('lesson_id')
    .notNull()
    .unique()
    .references(() => lessonsTable.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }),
  description: text('description'),
  passingScore: real('passing_score').notNull().default(70),
  timeLimit: integer('time_limit'),
  maxAttempts: integer('max_attempts').notNull().default(1),
  shuffleQuestions: boolean('shuffle_questions').notNull().default(false),
  shuffleOptions: boolean('shuffle_options').notNull().default(false),
  showResult: boolean('show_result').notNull().default(true),
  showCorrectAnswer: boolean('show_correct_answer').notNull().default(false),
  showExplanation: boolean('show_explanation').notNull().default(true),
  availableFrom: timestamp('available_from'),
  availableUntil: timestamp('available_until'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type Quiz = typeof quizzesTable.$inferSelect;
export type NewQuiz = typeof quizzesTable.$inferInsert;
export type QuizAttemptStatus =
  (typeof quizAttemptStatusEnum.enumValues)[number];
