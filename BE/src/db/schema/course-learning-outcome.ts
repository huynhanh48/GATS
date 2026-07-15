import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { coursesTable } from './course';

export const courseLearningOutcomesTable = pgTable(
  'course_learning_outcomes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    courseId: uuid('course_id')
      .notNull()
      .references(() => coursesTable.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    order: integer('order').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_course_learning_outcomes_course_order').on(
      table.courseId,
      table.order,
    ),
    index('idx_course_learning_outcomes_course').on(table.courseId),
  ],
);

export type CourseLearningOutcome =
  typeof courseLearningOutcomesTable.$inferSelect;
export type NewCourseLearningOutcome =
  typeof courseLearningOutcomesTable.$inferInsert;
