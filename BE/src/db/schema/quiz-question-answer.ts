import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { quizQuestionsTable, quizQuestionTypeEnum } from './quiz-question';

export const quizQuestionAnswersTable = pgTable(
  'quiz_question_answers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    questionId: uuid('question_id')
      .notNull()
      .references(() => quizQuestionsTable.id, { onDelete: 'cascade' }),
    answer: text('answer').notNull(),
    isCorrect: boolean('is_correct').notNull().default(false),
    type: quizQuestionTypeEnum('type').notNull(),
    order: integer('order').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('idx_quiz_question_answers_question_order').on(
      table.questionId,
      table.order,
    ),
    index('idx_quiz_question_answers_question_type').on(
      table.questionId,
      table.type,
    ),
    uniqueIndex('idx_quiz_question_answers_question_order_unique').on(
      table.questionId,
      table.order,
    ),
  ],
);

export type QuizQuestionAnswer = typeof quizQuestionAnswersTable.$inferSelect;
export type NewQuizQuestionAnswer =
  typeof quizQuestionAnswersTable.$inferInsert;
