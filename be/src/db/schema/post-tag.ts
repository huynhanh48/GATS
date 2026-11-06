import {
  index,
  pgTable,
  primaryKey,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { postsTable } from './post';
import { tagsTable } from './tag';

export const postTagsTable = pgTable(
  'post_tags',
  {
    postId: uuid('post_id')
      .notNull()
      .references(() => postsTable.id, { onDelete: 'cascade' }),
    tagId: uuid('tag_id')
      .notNull()
      .references(() => tagsTable.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.postId, table.tagId] }),
    index('idx_post_tags_post').on(table.postId),
    index('idx_post_tags_tag').on(table.tagId),
  ],
);

export type PostTag = typeof postTagsTable.$inferSelect;
export type NewPostTag = typeof postTagsTable.$inferInsert;
