import { sql } from 'drizzle-orm';
import {
  check,
  index,
  integer,
  jsonb,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { coursesTable } from './course';
import { usersTable } from './user';

export const courseReviewMilestonesTable = pgTable(
  'course_review_milestones',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    courseId: uuid('course_id')
      .notNull()
      .references(() => coursesTable.id, { onDelete: 'cascade' }),
    userId: integer('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    milestone: integer('milestone').notNull(),
    progressPercent: integer('progress_percent').notNull(),
    completedLessons: integer('completed_lessons').notNull(),
    totalLessons: integer('total_lessons').notNull(),
    status: varchar('status', { length: 24 }).notNull().default('prompted'),
    source: varchar('source', { length: 32 }).notNull(),
    deviceId: varchar('device_id', { length: 128 }),
    metadata: jsonb('metadata').$type<Record<string, unknown>>(),
    promptedAt: timestamp('prompted_at', { withTimezone: true }),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_course_review_milestones_user_course_milestone').on(
      table.userId,
      table.courseId,
      table.milestone,
    ),
    index('idx_course_review_milestones_user_course').on(
      table.userId,
      table.courseId,
    ),
    check(
      'chk_course_review_milestone_value',
      sql`${table.milestone} IN (25, 50, 75, 100)`,
    ),
    check(
      'chk_course_review_milestone_status',
      sql`${table.status} IN ('skipped', 'prompted', 'dismissed', 'reviewed')`,
    ),
  ],
);

export type CourseReviewMilestone =
  typeof courseReviewMilestonesTable.$inferSelect;
