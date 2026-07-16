import {
  index,
  integer,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { lessonsTable } from './lesson';
import { mediaTable } from './media';

export const lessonAttachmentsTable = pgTable(
  'lesson_attachments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    lessonId: uuid('lesson_id')
      .notNull()
      .references(() => lessonsTable.id, { onDelete: 'cascade' }),
    mediaId: uuid('media_id')
      .notNull()
      .references(() => mediaTable.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }),
    order: integer('order').notNull().default(0),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_lesson_attachments_unique').on(
      table.lessonId,
      table.mediaId,
    ),
    index('idx_lesson_attachments_lesson').on(table.lessonId),
    index('idx_lesson_attachments_media').on(table.mediaId),
  ],
);

export type LessonAttachment = typeof lessonAttachmentsTable.$inferSelect;
export type NewLessonAttachment = typeof lessonAttachmentsTable.$inferInsert;
