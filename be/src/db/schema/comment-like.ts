import {
  index,
  integer,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { commentsTable } from './comment';
import { usersTable } from './user';

export const commentLikesTable = pgTable(
  'comment_likes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    commentId: uuid('comment_id')
      .notNull()
      .references(() => commentsTable.id, { onDelete: 'cascade' }),
    userId: integer('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_comment_likes_unique').on(table.commentId, table.userId),
    index('idx_comment_likes_comment').on(table.commentId),
    index('idx_comment_likes_user').on(table.userId),
  ],
);

export type CommentLike = typeof commentLikesTable.$inferSelect;
export type NewCommentLike = typeof commentLikesTable.$inferInsert;
