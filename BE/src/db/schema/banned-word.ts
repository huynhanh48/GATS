import {
  boolean,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const bannedWordsTable = pgTable(
  'banned_words',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    /** Stored trimmed; matching is case-insensitive. */
    word: varchar('word', { length: 100 }).notNull(),
    isActive: boolean('is_active').notNull().default(true),
    note: varchar('note', { length: 255 }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_banned_words_word_lower').on(sql`lower(${table.word})`),
  ],
);

export type BannedWord = typeof bannedWordsTable.$inferSelect;
export type NewBannedWord = typeof bannedWordsTable.$inferInsert;
