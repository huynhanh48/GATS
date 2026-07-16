import {
  index,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { coursesTable } from './course';
import { usersTable } from './user';

export const enrollmentSourceEnum = pgEnum('enrollment_source', [
  'free',
  'paid',
  'admin_granted',
]);

export const enrollmentStatusEnum = pgEnum('enrollment_status', [
  'active',
  'expired',
  'cancelled',
]);

export const courseEnrollmentsTable = pgTable(
  'course_enrollments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: integer('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    courseId: uuid('course_id')
      .notNull()
      .references(() => coursesTable.id, { onDelete: 'cascade' }),
    source: enrollmentSourceEnum('source').notNull().default('paid'),
    status: enrollmentStatusEnum('status').notNull().default('active'),
    enrolledAt: timestamp('enrolled_at').notNull().defaultNow(),
    expiredAt: timestamp('expired_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_course_enrollments_user_course').on(
      table.userId,
      table.courseId,
    ),
    index('idx_course_enrollments_user').on(table.userId),
    index('idx_course_enrollments_course').on(table.courseId),
  ],
);

export type CourseEnrollment = typeof courseEnrollmentsTable.$inferSelect;
export type NewCourseEnrollment = typeof courseEnrollmentsTable.$inferInsert;
export type EnrollmentSource = (typeof enrollmentSourceEnum.enumValues)[number];
export type EnrollmentStatus =
  (typeof enrollmentStatusEnum.enumValues)[number];
