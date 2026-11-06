import { sql } from 'drizzle-orm';
import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { categoriesTable } from './category';
import { usersTable } from './user';

export const postStatusEnum = pgEnum('post_status', [
  'draft',
  'published',
  'archived',
]);

export const postVisibilityEnum = pgEnum('post_visibility', [
  'public',
  'private',
  'members_only',
]);

export const postsTable = pgTable(
  'posts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    authorId: integer('author_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    categoryId: uuid('category_id').references(() => categoriesTable.id, {
      onDelete: 'set null',
    }),
    title: varchar('title', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull(),
    excerpt: text('excerpt'),
    content: text('content').notNull(),
    thumbnail: varchar('thumbnail', { length: 512 }),
    status: postStatusEnum('status').notNull().default('draft'),
    visibility: postVisibilityEnum('visibility').notNull().default('public'),
    viewCount: integer('view_count').notNull().default(0),
    publishedAt: timestamp('published_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    deletedAt: timestamp('deleted_at'),
    deletedById: integer('deleted_by_id').references(() => usersTable.id, {
      onDelete: 'set null',
    }),
  },
  (table) => [
    index('idx_posts_author').on(table.authorId),
    index('idx_posts_category').on(table.categoryId),
    index('idx_posts_status').on(table.status),
    index('idx_posts_visibility').on(table.visibility),
    index('idx_posts_published_at').on(table.publishedAt),
    index('idx_posts_slug').on(table.slug),
    index('idx_posts_deleted_at').on(table.deletedAt),
    uniqueIndex('idx_posts_slug_active')
      .on(table.slug)
      .where(sql`${table.deletedAt} is null`),
  ],
);

export type Post = typeof postsTable.$inferSelect;
export type NewPost = typeof postsTable.$inferInsert;
export type PostStatus = (typeof postStatusEnum.enumValues)[number];
export type PostVisibility = (typeof postVisibilityEnum.enumValues)[number];
