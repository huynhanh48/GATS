import { integer, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const levelsTable = pgTable('levels', {
  code: varchar('code', { length: 50 }).primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  sortOrder: integer('sort_order').notNull().default(0),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type Level = typeof levelsTable.$inferSelect;
export type NewLevel = typeof levelsTable.$inferInsert;
