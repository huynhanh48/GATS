import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { quizQuestionsTable } from './quiz-question';

export const quizOptionsTable = pgTable(
  'quiz_options',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    questionId: uuid('question_id')
      .notNull()
      .references(() => quizQuestionsTable.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    isCorrect: boolean('is_correct').notNull().default(false),
    order: integer('order').notNull().default(0),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_quiz_options_question_order').on(table.questionId, table.order),
  ],
);

export type QuizOption = typeof quizOptionsTable.$inferSelect;
export type NewQuizOption = typeof quizOptionsTable.$inferInsert;
