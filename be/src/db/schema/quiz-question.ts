import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { quizzesTable } from './quiz';

export const quizQuestionTypeEnum = pgEnum('quiz_question_type', [
  'single_choice',
  'multiple_choice',
  'fill_blank',
  'true_false',
  'short_answer',
]);

export const quizQuestionsTable = pgTable(
  'quiz_questions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    quizId: uuid('quiz_id')
      .notNull()
      .references(() => quizzesTable.id, { onDelete: 'cascade' }),
    type: quizQuestionTypeEnum('type').notNull(),
    question: text('question').notNull(),
    description: text('description'),
    explanation: text('explanation'),
    points: real('points').notNull().default(1),
    order: integer('order').notNull(),
    isRequired: boolean('is_required').notNull().default(true),
    caseSensitive: boolean('case_sensitive').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('idx_quiz_questions_quiz_order').on(table.quizId, table.order),
    uniqueIndex('idx_quiz_questions_quiz_order_unique').on(
      table.quizId,
      table.order,
    ),
  ],
);

export type QuizQuestion = typeof quizQuestionsTable.$inferSelect;
export type NewQuizQuestion = typeof quizQuestionsTable.$inferInsert;
export type QuizQuestionType = (typeof quizQuestionTypeEnum.enumValues)[number];
