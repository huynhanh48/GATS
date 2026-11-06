import { index, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { coursesTable } from './course';
import { lessonsTable } from './lesson';
import { usersTable } from './user';

export const lessonNotesTable = pgTable(
  'lesson_notes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: integer('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    lessonId: uuid('lesson_id')
      .notNull()
      .references(() => lessonsTable.id, { onDelete: 'cascade' }),
    courseId: uuid('course_id')
      .notNull()
      .references(() => coursesTable.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    timestampSeconds: integer('timestamp_seconds'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_lesson_notes_user_lesson').on(table.userId, table.lessonId),
    index('idx_lesson_notes_user_course').on(table.userId, table.courseId),
  ],
);

export type LessonNote = typeof lessonNotesTable.$inferSelect;
export type NewLessonNote = typeof lessonNotesTable.$inferInsert;
