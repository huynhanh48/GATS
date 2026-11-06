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

export const PROGRESS_EVENT_TYPES = [
  'started',
  'heartbeat',
  'position',
  'completed',
] as const;

export type ProgressEventType = (typeof PROGRESS_EVENT_TYPES)[number];

export const progressEventsTable = pgTable(
  'progress_events',
  {
    eventId: uuid('event_id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    deviceId: varchar('device_id', { length: 128 }).notNull(),
    courseId: uuid('course_id')
      .notNull()
      .references(() => coursesTable.id, { onDelete: 'cascade' }),
    lessonId: uuid('lesson_id')
      .notNull()
      .references(() => lessonsTable.id, { onDelete: 'cascade' }),
    type: varchar('type', { length: 32 }).notNull(),
    positionSeconds: integer('position_seconds'),
    occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull(),
    clientSequence: integer('client_sequence').notNull().default(0),
    contentVersion: varchar('content_version', { length: 64 }),
    processedAt: timestamp('processed_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('idx_progress_events_user_occurred').on(
      table.userId,
      table.occurredAt,
    ),
    index('idx_progress_events_user_lesson').on(table.userId, table.lessonId),
  ],
);

export type ProgressEvent = typeof progressEventsTable.$inferSelect;
