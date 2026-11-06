import {
  boolean,
  integer,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { lessonsTable } from './lesson';

export const assignmentsTable = pgTable('assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  lessonId: uuid('lesson_id')
    .notNull()
    .unique()
    .references(() => lessonsTable.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }),
  dueAt: timestamp('due_at'),
  maxScore: real('max_score').notNull().default(100),
  maxFileSizeMb: integer('max_file_size_mb'),
  allowedSubmissionTypes: text('allowed_submission_types')
    .notNull()
    .default('["text","url","file"]'),
  lateSubmissionAllowed: boolean('late_submission_allowed')
    .notNull()
    .default(false),
  maxSubmissions: integer('max_submissions').notNull().default(1),
  passingScore: real('passing_score').notNull().default(70),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type Assignment = typeof assignmentsTable.$inferSelect;
export type NewAssignment = typeof assignmentsTable.$inferInsert;
