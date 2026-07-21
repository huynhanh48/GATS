import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { usersTable } from './user';

export const leadStatusEnum = pgEnum('lead_status', [
  'new',
  'contacted',
  'qualified',
  'converted',
  'lost',
  'spam',
]);

export const leadsTable = pgTable(
  'leads',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 20 }).notNull(),
    email: varchar('email', { length: 255 }),
    message: text('message'),
    source: varchar('source', { length: 100 }).notNull().default('homepage_cta'),
    status: leadStatusEnum('status').notNull().default('new'),
    assigneeUserId: integer('assignee_user_id').references(() => usersTable.id, {
      onDelete: 'set null',
    }),
    notes: text('notes'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_leads_created_at').on(table.createdAt),
    index('idx_leads_status').on(table.status),
  ],
);

export type Lead = typeof leadsTable.$inferSelect;
export type NewLead = typeof leadsTable.$inferInsert;
export type LeadStatus = (typeof leadStatusEnum.enumValues)[number];
