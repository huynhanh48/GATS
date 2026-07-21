import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { ordersTable } from './order';
import { usersTable } from './user';

export const paymentExceptionTypeEnum = pgEnum('payment_exception_type', [
  'amount_mismatch',
  'txn_ref_not_found',
  'txn_ref_mismatch',
  'txn_not_found',
]);

export const paymentExceptionsTable = pgTable(
  'payment_exceptions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    type: paymentExceptionTypeEnum('type').notNull(),
    orderId: uuid('order_id').references(() => ordersTable.id, {
      onDelete: 'set null',
    }),
    txnRef: varchar('txn_ref', { length: 255 }),
    expectedAmount: integer('expected_amount'),
    actualAmount: integer('actual_amount'),
    rawPayload: jsonb('raw_payload'),
    resolved: boolean('resolved').notNull().default(false),
    resolvedById: integer('resolved_by_id').references(() => usersTable.id, {
      onDelete: 'set null',
    }),
    resolvedAt: timestamp('resolved_at'),
    resolutionNote: text('resolution_note'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_payment_exceptions_type').on(table.type),
    index('idx_payment_exceptions_resolved').on(table.resolved),
    index('idx_payment_exceptions_order').on(table.orderId),
    index('idx_payment_exceptions_created_at').on(table.createdAt),
  ],
);

export type PaymentException = typeof paymentExceptionsTable.$inferSelect;
export type NewPaymentException = typeof paymentExceptionsTable.$inferInsert;
export type PaymentExceptionType =
  (typeof paymentExceptionTypeEnum.enumValues)[number];
