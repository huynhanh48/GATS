import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { coursesTable } from './course';
import { usersTable } from './user';

export const courseChatMessagesTable = pgTable(
  'course_chat_messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    courseId: uuid('course_id')
      .notNull()
      .references(() => coursesTable.id, { onDelete: 'cascade' }),
    senderId: integer('sender_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    pinnedAt: timestamp('pinned_at'),
    pinnedById: integer('pinned_by_id').references(() => usersTable.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_course_chat_messages_course_created').on(
      table.courseId,
      table.createdAt,
    ),
    index('idx_course_chat_messages_sender').on(table.senderId),
    index('idx_course_chat_messages_pinned').on(
      table.courseId,
      table.pinnedAt,
    ),
  ],
);

export type CourseChatMessage =
  typeof courseChatMessagesTable.$inferSelect;
export type NewCourseChatMessage =
  typeof courseChatMessagesTable.$inferInsert;
