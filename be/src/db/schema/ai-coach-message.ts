import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { aiCoachSessionsTable } from './ai-coach-session';

export const aiCoachMessagesTable = pgTable(
  'ai_coach_messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => aiCoachSessionsTable.id, { onDelete: 'cascade' }),
    text: text('text').notNull(),
    isUser: boolean('is_user').notNull().default(true),
    timestamp: timestamp('timestamp').notNull().defaultNow(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_ai_coach_messages_session').on(table.sessionId),
    index('idx_ai_coach_messages_timestamp').on(table.timestamp),
  ],
);

export type AiCoachMessage = typeof aiCoachMessagesTable.$inferSelect;
export type NewAiCoachMessage = typeof aiCoachMessagesTable.$inferInsert;
