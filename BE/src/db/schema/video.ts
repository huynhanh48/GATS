import {
  bigint,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { coursesTable } from './course';
import { lessonsTable } from './lesson';

export const videoStorageProviderEnum = pgEnum('video_storage_provider', [
  'firebase',
  's3',
  'gcs',
  'r2',
  'local',
]);

export const videoStatusEnum = pgEnum('video_status', [
  'pending_upload',
  'uploaded',
  'processing',
  'ready',
  'failed',
]);

export const videosTable = pgTable(
  'videos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    courseId: uuid('course_id')
      .notNull()
      .references(() => coursesTable.id, { onDelete: 'cascade' }),
    lessonId: uuid('lesson_id')
      .notNull()
      .unique()
      .references(() => lessonsTable.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }),
    storageProvider: videoStorageProviderEnum('storage_provider')
      .notNull()
      .default('s3'),
    originalKey: varchar('original_key', { length: 512 }),
    hlsKey: varchar('hls_key', { length: 512 }),
    mp4Url: varchar('mp4_url', { length: 512 }),
    duration: integer('duration'),
    size: bigint('size', { mode: 'number' }),
    uploadId: varchar('upload_id', { length: 255 }),
    status: videoStatusEnum('status').notNull().default('pending_upload'),
    errorMessage: text('error_message'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_videos_course').on(table.courseId),
    index('idx_videos_status').on(table.status),
  ],
);

export type Video = typeof videosTable.$inferSelect;
export type NewVideo = typeof videosTable.$inferInsert;
export type VideoStatus = (typeof videoStatusEnum.enumValues)[number];
