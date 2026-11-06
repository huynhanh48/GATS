import { pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core';

import { quizAnswersTable } from './quiz-answer';
import { quizQuestionAnswersTable } from './quiz-question-answer';

export const quizAnswerOptionsTable = pgTable(
  'quiz_answer_options',
  {
    answerId: uuid('answer_id')
      .notNull()
      .references(() => quizAnswersTable.id, { onDelete: 'cascade' }),
    optionId: uuid('option_id')
      .notNull()
      .references(() => quizQuestionAnswersTable.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.answerId, table.optionId] })],
);

export type QuizAnswerOption = typeof quizAnswerOptionsTable.$inferSelect;
export type NewQuizAnswerOption = typeof quizAnswerOptionsTable.$inferInsert;

