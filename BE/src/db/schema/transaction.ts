import {
  integer,
  jsonb,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { ordersTable } from './order';

export const transactionStatusEnum = pgEnum('transaction_status', [
  'pending',
  'success',
  'failed',
]);

export const transactionsTable = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id')
    .notNull()
    .unique()
    .references(() => ordersTable.id, { onDelete: 'cascade' }),
  txnRef: varchar('txn_ref', { length: 255 }).notNull().unique(),
  amount: integer('amount').notNull(),
  paymentMethod: varchar('payment_method', { length: 50 }),
  status: transactionStatusEnum('status').notNull().default('pending'),
  gatewayResponse: jsonb('gateway_response'),
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type Transaction = typeof transactionsTable.$inferSelect;
export type NewTransaction = typeof transactionsTable.$inferInsert;
export type TransactionStatus =
  (typeof transactionStatusEnum.enumValues)[number];
