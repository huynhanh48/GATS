import {
  index,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { usersTable } from './user';

export const mediaKindEnum = pgEnum('media_kind', ['thumbnail', 'file']);

export const mediaTable = pgTable(
  'media',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    kind: mediaKindEnum('kind').notNull(),
    originalName: varchar('original_name', { length: 255 }).notNull(),
    storageKey: varchar('storage_key', { length: 512 }).notNull(),
    mimeType: varchar('mime_type', { length: 128 }).notNull(),
    size: integer('size').notNull(),
    url: varchar('url', { length: 1024 }).notNull(),
    uploadedBy: integer('uploaded_by').references(() => usersTable.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_media_storage_key').on(table.storageKey),
    index('idx_media_kind').on(table.kind),
    index('idx_media_created_at').on(table.createdAt),
  ],
);

export type Media = typeof mediaTable.$inferSelect;
export type NewMedia = typeof mediaTable.$inferInsert;
export type MediaKind = (typeof mediaKindEnum.enumValues)[number];
