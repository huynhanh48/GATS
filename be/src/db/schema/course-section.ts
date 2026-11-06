import {
  index,
  integer,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { coursesTable } from './course';

export const courseSectionsTable = pgTable(
  'course_sections',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    courseId: uuid('course_id')
      .notNull()
      .references(() => coursesTable.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    order: integer('order').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_course_sections_course').on(table.courseId),
    uniqueIndex('idx_course_sections_course_order').on(
      table.courseId,
      table.order,
    ),
  ],
);

export type CourseSection = typeof courseSectionsTable.$inferSelect;
export type NewCourseSection = typeof courseSectionsTable.$inferInsert;
