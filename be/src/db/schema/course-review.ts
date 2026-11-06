import {
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

import { coursesTable } from './course';
import { usersTable } from './user';

export const courseReviewsTable = pgTable(
  'course_reviews',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    courseId: uuid('course_id')
      .notNull()
      .references(() => coursesTable.id, { onDelete: 'cascade' }),
    userId: integer('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    rating: integer('rating').notNull(),
    content: text('content'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_course_reviews_course_user').on(
      table.courseId,
      table.userId,
    ),
    index('idx_course_reviews_course').on(table.courseId),
    index('idx_course_reviews_user').on(table.userId),
    check(
      'chk_course_reviews_rating',
      sql`${table.rating} >= 1 AND ${table.rating} <= 5`,
    ),
  ],
);

export type CourseReview = typeof courseReviewsTable.$inferSelect;
export type NewCourseReview = typeof courseReviewsTable.$inferInsert;
