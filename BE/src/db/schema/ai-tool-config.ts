import { boolean, jsonb, pgEnum, pgTable, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';

export const aiToolTypeEnum = pgEnum('ai_tool_type', [
  'prompt',
  'api_provider',
  'skill',
  'mcp',
  'tool',
  'stem',
]);

export const aiToolConfigsTable = pgTable('ai_tool_configs', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: aiToolTypeEnum('type').notNull(),
  itemKey: varchar('item_key', { length: 100 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  isPublic: boolean('is_public').notNull().default(true),
  isPaid: boolean('is_paid').notNull().default(false),
  websiteUrl: varchar('website_url', { length: 1000 }),
  payload: jsonb('payload').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [uniqueIndex('idx_ai_tool_configs_type_key').on(table.type, table.itemKey)]);

export type AiToolConfig = typeof aiToolConfigsTable.$inferSelect;
