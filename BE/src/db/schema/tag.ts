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

export const tagTypeEnum = pgEnum('tag_type', ['course', 'post', 'global']);
export const tagStatusEnum = pgEnum('tag_status', ['active', 'inactive']);

export const tagsTable = pgTable(
  'tags',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull(),
    slug: varchar('slug', { length: 100 }).notNull(),
    description: text('description'),
    type: tagTypeEnum('type').notNull(),
    status: tagStatusEnum('status').notNull().default('active'),
    level: varchar('level', { length: 50 }),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_tags_type_slug').on(table.type, table.slug),
    index('idx_tags_type').on(table.type),
    index('idx_tags_status').on(table.status),
    index('idx_tags_sort_order').on(table.sortOrder),
  ],
);

export type Tag = typeof tagsTable.$inferSelect;
export type NewTag = typeof tagsTable.$inferInsert;
export type TagType = (typeof tagTypeEnum.enumValues)[number];
export type TagStatus = (typeof tagStatusEnum.enumValues)[number];
