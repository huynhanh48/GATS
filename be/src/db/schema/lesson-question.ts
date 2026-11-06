import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { coursesTable } from './course';
import { lessonsTable } from './lesson';
import { usersTable } from './user';

export const lessonQuestionsTable = pgTable(
  'lesson_questions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    lessonId: uuid('lesson_id')
      .notNull()
      .references(() => lessonsTable.id, { onDelete: 'cascade' }),
    courseId: uuid('course_id')
      .notNull()
      .references(() => coursesTable.id, { onDelete: 'cascade' }),
    userId: integer('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    isResolved: boolean('is_resolved').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_lesson_questions_lesson').on(table.lessonId),
    index('idx_lesson_questions_course').on(table.courseId),
    index('idx_lesson_questions_user').on(table.userId),
  ],
);

export type LessonQuestion = typeof lessonQuestionsTable.$inferSelect;
export type NewLessonQuestion = typeof lessonQuestionsTable.$inferInsert;
