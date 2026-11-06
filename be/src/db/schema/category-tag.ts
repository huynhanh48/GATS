import {
  index,
  pgTable,
  primaryKey,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { categoriesTable } from './category';
import { tagsTable } from './tag';

export const categoryTagsTable = pgTable(
  'category_tags',
  {
    categoryId: uuid('category_id')
      .notNull()
      .references(() => categoriesTable.id, { onDelete: 'cascade' }),
    tagId: uuid('tag_id')
      .notNull()
      .references(() => tagsTable.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.categoryId, table.tagId] }),
    index('idx_category_tags_category').on(table.categoryId),
    index('idx_category_tags_tag').on(table.tagId),
  ],
);

export type CategoryTag = typeof categoryTagsTable.$inferSelect;
export type NewCategoryTag = typeof categoryTagsTable.$inferInsert;
