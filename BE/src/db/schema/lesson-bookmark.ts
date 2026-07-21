import {
  index,
  integer,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { coursesTable } from './course';
import { lessonsTable } from './lesson';
import { usersTable } from './user';

export const lessonBookmarksTable = pgTable(
  'lesson_bookmarks',
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
    label: varchar('label', { length: 255 }),
    timestampSeconds: integer('timestamp_seconds'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_lesson_bookmarks_user_lesson').on(table.userId, table.lessonId),
    index('idx_lesson_bookmarks_user_course').on(table.userId, table.courseId),
  ],
);

export type LessonBookmark = typeof lessonBookmarksTable.$inferSelect;
export type NewLessonBookmark = typeof lessonBookmarksTable.$inferInsert;
