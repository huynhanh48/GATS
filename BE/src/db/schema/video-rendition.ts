import {
  index,
  integer,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { videosTable } from './video';

export const videoRenditionsTable = pgTable(
  'video_renditions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    videoId: uuid('video_id')
      .notNull()
      .references(() => videosTable.id, { onDelete: 'cascade' }),
    resolution: varchar('resolution', { length: 16 }).notNull(),
    bitrate: integer('bitrate'),
    playlistKey: varchar('playlist_key', { length: 512 }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_video_renditions_video').on(table.videoId),
    uniqueIndex('idx_video_renditions_video_resolution').on(
      table.videoId,
      table.resolution,
    ),
  ],
);

export type VideoRendition = typeof videoRenditionsTable.$inferSelect;
export type NewVideoRendition = typeof videoRenditionsTable.$inferInsert;
