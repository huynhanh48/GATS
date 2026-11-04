import { sql } from 'drizzle-orm';
import { AnyPgColumn, boolean, check, index, integer, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';
import { coursesTable } from './course';

export const courseMenuItemsTable = pgTable('course_menu_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  parentId: uuid('parent_id').references((): AnyPgColumn => courseMenuItemsTable.id, { onDelete: 'restrict' }),
  courseId: uuid('course_id').references(() => coursesTable.id, { onDelete: 'set null' }),
  url: varchar('url', { length: 500 }),
  badge: varchar('badge', { length: 50 }),
  icon: varchar('icon', { length: 100 }),
  description: text('description'),
  sortOrder: integer('sort_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
  index('idx_course_menu_parent_order').on(table.parentId, table.sortOrder),
  index('idx_course_menu_active_order').on(table.isActive, table.sortOrder),
  index('idx_course_menu_course').on(table.courseId),
  uniqueIndex('idx_course_menu_parent_course').on(table.parentId, table.courseId).where(sql`${table.courseId} is not null`),
  check('chk_course_menu_not_self_parent', sql`${table.parentId} is null or ${table.parentId} <> ${table.id}`),
  check('chk_course_menu_group_or_entry', sql`(${table.parentId} is null and ${table.courseId} is null and ${table.url} is null) or (${table.parentId} is not null and (${table.courseId} is not null or ${table.url} is not null))`),
]);

export type CourseMenuItem = typeof courseMenuItemsTable.$inferSelect;
