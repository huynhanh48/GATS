import {
  boolean,
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

import { coursesTable } from './course';
import { courseSectionsTable } from './course-section';
import { postsTable } from './post';

export const lessonTypeEnum = pgEnum('lesson_type', [
  'video',
  'text',
  'quiz',
  'assignment',
]);

export const lessonsTable = pgTable(
  'lessons',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    courseId: uuid('course_id')
      .notNull()
      .references(() => coursesTable.id, { onDelete: 'cascade' }),
    sectionId: uuid('section_id')
      .notNull()
      .references(() => courseSectionsTable.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    type: lessonTypeEnum('type').notNull().default('video'),
    order: integer('order').notNull(),
    content: text('content'),
    isPreview: boolean('is_preview').notNull().default(false),
    duration: integer('duration'),
    linkedPostId: uuid('linked_post_id').references(() => postsTable.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_lessons_course').on(table.courseId),
    index('idx_lessons_section').on(table.sectionId),
    index('idx_lessons_linked_post').on(table.linkedPostId),
    uniqueIndex('idx_lessons_section_order').on(table.sectionId, table.order),
  ],
);

export type Lesson = typeof lessonsTable.$inferSelect;
export type NewLesson = typeof lessonsTable.$inferInsert;
