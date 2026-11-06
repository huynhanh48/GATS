import {
  index,
  pgTable,
  primaryKey,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { coursesTable } from './course';
import { tagsTable } from './tag';

export const courseTagsTable = pgTable(
  'course_tags',
  {
    courseId: uuid('course_id')
      .notNull()
      .references(() => coursesTable.id, { onDelete: 'cascade' }),
    tagId: uuid('tag_id')
      .notNull()
      .references(() => tagsTable.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.courseId, table.tagId] }),
    index('idx_course_tags_course').on(table.courseId),
    index('idx_course_tags_tag').on(table.tagId),
  ],
);

export type CourseTag = typeof courseTagsTable.$inferSelect;
export type NewCourseTag = typeof courseTagsTable.$inferInsert;
