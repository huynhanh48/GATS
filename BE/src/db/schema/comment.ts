import {
  foreignKey,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { postsTable } from './post';
import { usersTable } from './user';

export const commentStatusEnum = pgEnum('comment_status', [
  'visible',
  'hidden',
  'deleted',
]);

export const commentsTable = pgTable(
  'comments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    postId: uuid('post_id')
      .notNull()
      .references(() => postsTable.id, { onDelete: 'cascade' }),
    userId: integer('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    parentId: uuid('parent_id'),
    content: text('content').notNull(),
    status: commentStatusEnum('status').notNull().default('visible'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
      name: 'comments_parent_id_comments_id_fk',
    }).onDelete('cascade'),
    index('idx_comments_post').on(table.postId),
    index('idx_comments_user').on(table.userId),
    index('idx_comments_parent').on(table.parentId),
    index('idx_comments_status').on(table.status),
  ],
);

export type Comment = typeof commentsTable.$inferSelect;
export type NewComment = typeof commentsTable.$inferInsert;
export type CommentStatus = (typeof commentStatusEnum.enumValues)[number];
