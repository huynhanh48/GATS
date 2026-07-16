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

export const courseStatusEnum = pgEnum('course_status', [
  'draft',
  'published',
  'archived',
]);

export const courseLevelEnum = pgEnum('course_level', [
  'beginner',
  'intermediate',
  'advanced',
]);

export const coursesTable = pgTable(
  'courses',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull(),
    description: text('description'),
    thumbnail: varchar('thumbnail', { length: 512 }),
    introVideo: varchar('intro_video', { length: 512 }),
    price: integer('price').notNull().default(0),
    salePrice: integer('sale_price'),
    level: courseLevelEnum('level').notNull().default('beginner'),
    status: courseStatusEnum('status').notNull().default('draft'),
    instructorId: integer('instructor_id').references(() => usersTable.id, {
      onDelete: 'set null',
    }),
    categoryId: uuid('category_id').references(() => categoriesTable.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    publishedAt: timestamp('published_at'),
    deletedAt: timestamp('deleted_at'),
    deletedById: integer('deleted_by_id').references(() => usersTable.id, {
      onDelete: 'set null',
    }),
  },
  (table) => [
    index('idx_courses_status').on(table.status),
    index('idx_courses_slug').on(table.slug),
    index('idx_courses_instructor').on(table.instructorId),
    index('idx_courses_category').on(table.categoryId),
    index('idx_courses_level').on(table.level),
    index('idx_courses_deleted_at').on(table.deletedAt),
    uniqueIndex('idx_courses_slug_active')
      .on(table.slug)
      .where(sql`${table.deletedAt} is null`),
  ],
);

export type Course = typeof coursesTable.$inferSelect;
export type NewCourse = typeof coursesTable.$inferInsert;
export type CourseStatus = (typeof courseStatusEnum.enumValues)[number];
export type CourseLevel = (typeof courseLevelEnum.enumValues)[number];
