import {
  index,
  integer,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { assignmentsTable } from './assignment';
import { usersTable } from './user';

export const assignmentSubmissionStatusEnum = pgEnum(
  'assignment_submission_status',
  ['draft', 'submitted', 'graded', 'returned'],
);

export const assignmentSubmissionsTable = pgTable(
  'assignment_submissions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    assignmentId: uuid('assignment_id')
      .notNull()
      .references(() => assignmentsTable.id, { onDelete: 'cascade' }),
    userId: integer('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    submissionNumber: integer('submission_number').notNull().default(1),
    status: assignmentSubmissionStatusEnum('status').notNull().default('draft'),
    textContent: text('text_content'),
    url: varchar('url', { length: 2048 }),
    score: real('score'),
    feedback: text('feedback'),
    gradedById: integer('graded_by_id').references(() => usersTable.id, {
      onDelete: 'set null',
    }),
    gradedAt: timestamp('graded_at'),
    submittedAt: timestamp('submitted_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_assignment_submissions_unique').on(
      table.assignmentId,
      table.userId,
      table.submissionNumber,
    ),
    index('idx_assignment_submissions_assignment').on(table.assignmentId),
    index('idx_assignment_submissions_user').on(table.userId),
  ],
);

export type AssignmentSubmission =
  typeof assignmentSubmissionsTable.$inferSelect;
export type NewAssignmentSubmission =
  typeof assignmentSubmissionsTable.$inferInsert;
export type AssignmentSubmissionStatus =
  (typeof assignmentSubmissionStatusEnum.enumValues)[number];
