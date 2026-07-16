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

export const courseIncludesTable = pgTable(
  'course_includes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    courseId: uuid('course_id')
      .notNull()
      .references(() => coursesTable.id, { onDelete: 'cascade' }),
    key: varchar('key', { length: 100 }).notNull(),
    label: varchar('label', { length: 255 }).notNull(),
    value: integer('value'),
    unit: varchar('unit', { length: 50 }),
    order: integer('order').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_course_includes_course_order').on(
      table.courseId,
      table.order,
    ),
    index('idx_course_includes_course').on(table.courseId),
  ],
);

export type CourseInclude = typeof courseIncludesTable.$inferSelect;
export type NewCourseInclude = typeof courseIncludesTable.$inferInsert;
