import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { lessonQuestionsTable } from './lesson-question';
import { usersTable } from './user';

export const lessonAnswersTable = pgTable(
  'lesson_answers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    questionId: uuid('question_id')
      .notNull()
      .references(() => lessonQuestionsTable.id, { onDelete: 'cascade' }),
    userId: integer('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    isInstructorAnswer: boolean('is_instructor_answer')
      .notNull()
      .default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [index('idx_lesson_answers_question').on(table.questionId)],
);

export type LessonAnswer = typeof lessonAnswersTable.$inferSelect;
export type NewLessonAnswer = typeof lessonAnswersTable.$inferInsert;
