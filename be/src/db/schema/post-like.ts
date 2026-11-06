import {
  index,
  integer,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { postsTable } from './post';
import { usersTable } from './user';

export const postLikesTable = pgTable(
  'post_likes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    postId: uuid('post_id')
      .notNull()
      .references(() => postsTable.id, { onDelete: 'cascade' }),
    userId: integer('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_post_likes_unique').on(table.postId, table.userId),
    index('idx_post_likes_post').on(table.postId),
    index('idx_post_likes_user').on(table.userId),
  ],
);

export type PostLike = typeof postLikesTable.$inferSelect;
export type NewPostLike = typeof postLikesTable.$inferInsert;
