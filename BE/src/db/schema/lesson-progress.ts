import {
  boolean,
  index,
  integer,
  pgTable,
  real,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { coursesTable } from './course';
import { lessonsTable } from './lesson';
import { usersTable } from './user';
import { videosTable } from './video';

export const lessonProgressTable = pgTable(
  'lesson_progress',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: integer('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    courseId: uuid('course_id')
      .notNull()
      .references(() => coursesTable.id, { onDelete: 'cascade' }),
    lessonId: uuid('lesson_id')
      .notNull()
      .references(() => lessonsTable.id, { onDelete: 'cascade' }),
    videoId: uuid('video_id').references(() => videosTable.id, {
      onDelete: 'set null',
    }),
    watchedSeconds: integer('watched_seconds').notNull().default(0),
    durationSeconds: integer('duration_seconds'),
    percent: integer('percent').notNull().default(0),
    isCompleted: boolean('is_completed').notNull().default(false),
    completedAt: timestamp('completed_at'),
    bestScore: real('best_score'),
    bestPercentage: real('best_percentage'),
    isPassed: boolean('is_passed').notNull().default(false),
    attemptCount: integer('attempt_count').notNull().default(0),
    lastWatchedAt: timestamp('last_watched_at').notNull().defaultNow(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_lesson_progress_user_lesson').on(
      table.userId,
      table.lessonId,
    ),
    index('idx_lesson_progress_user_course').on(table.userId, table.courseId),
  ],
);

export type LessonProgress = typeof lessonProgressTable.$inferSelect;
export type NewLessonProgress = typeof lessonProgressTable.$inferInsert;
