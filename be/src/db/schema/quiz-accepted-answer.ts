import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { quizQuestionsTable } from './quiz-question';

export const quizAcceptedAnswersTable = pgTable(
  'quiz_accepted_answers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    questionId: uuid('question_id')
      .notNull()
      .references(() => quizQuestionsTable.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    isExact: boolean('is_exact').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [index('idx_quiz_accepted_answers_question').on(table.questionId)],
);

export type QuizAcceptedAnswer = typeof quizAcceptedAnswersTable.$inferSelect;
export type NewQuizAcceptedAnswer =
  typeof quizAcceptedAnswersTable.$inferInsert;
