import { sql } from 'drizzle-orm';
import {
  index,
  integer,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { usersTable } from './user';

export const aiCoachSessionsTable = pgTable(
  'ai_coach_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: integer('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull().default('Cuộc trò chuyện mới'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => [
    index('idx_ai_coach_sessions_user').on(table.userId),
    index('idx_ai_coach_sessions_deleted_at').on(table.deletedAt),
  ],
);

export type AiCoachSession = typeof aiCoachSessionsTable.$inferSelect;
export type NewAiCoachSession = typeof aiCoachSessionsTable.$inferInsert;
