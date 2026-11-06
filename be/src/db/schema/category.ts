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

export const categoryTypeEnum = pgEnum('category_type', ['course', 'post']);
export const categoryStatusEnum = pgEnum('category_status', [
  'active',
  'inactive',
]);

export const categoriesTable = pgTable(
  'categories',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull(),
    slug: varchar('slug', { length: 100 }).notNull(),
    description: text('description'),
    thumbnail: varchar('thumbnail', { length: 512 }),
    icon: varchar('icon', { length: 100 }),
    sortOrder: integer('sort_order').notNull().default(0),
    type: categoryTypeEnum('type').notNull(),
    status: categoryStatusEnum('status').notNull().default('active'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_categories_type_slug').on(table.type, table.slug),
    index('idx_categories_type').on(table.type),
    index('idx_categories_status').on(table.status),
    index('idx_categories_sort_order').on(table.sortOrder),
  ],
);

export type Category = typeof categoriesTable.$inferSelect;
export type NewCategory = typeof categoriesTable.$inferInsert;
export type CategoryType = (typeof categoryTypeEnum.enumValues)[number];
export type CategoryStatus = (typeof categoryStatusEnum.enumValues)[number];
