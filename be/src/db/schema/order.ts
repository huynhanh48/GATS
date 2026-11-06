import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { coursesTable } from './course';
import { usersTable } from './user';

export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'paid',
  'cancelled',
  'refund_pending',
  'refunded',
]);

export const paymentMethodEnum = pgEnum('payment_method', [
  'vnpay',
  'bank_transfer',
  'momo',
  'wallet',
]);

export const ordersTable = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: integer('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  totalAmount: integer('total_amount').notNull(),
  status: orderStatusEnum('status').notNull().default('pending'),
  paymentMethod: paymentMethodEnum('payment_method'),
  customerName: varchar('customer_name', { length: 255 }),
  customerEmail: varchar('customer_email', { length: 255 }),
  customerPhone: varchar('customer_phone', { length: 20 }),
  notes: text('notes'),
  /** Soft reference to coupons.id — no FK to avoid a schema cycle; integrity enforced via coupon_redemptions */
  couponId: uuid('coupon_id'),
  couponCode: varchar('coupon_code', { length: 50 }),
  discountAmount: integer('discount_amount').notNull().default(0),
  membershipPlanId: uuid('membership_plan_id'),
  membershipBillingInterval: varchar('membership_billing_interval', { length: 32 }),
  membershipPriceSnapshot: integer('membership_price_snapshot'),
  promptItemKey: varchar('prompt_item_key', { length: 160 }),
  promptTitleSnapshot: varchar('prompt_title_snapshot', { length: 255 }),
  promptPriceSnapshot: integer('prompt_price_snapshot'),
  paidAt: timestamp('paid_at'),
  refundReasonCode: varchar('refund_reason_code', { length: 50 }),
  refundReasonNote: text('refund_reason_note'),
  refundBankName: varchar('refund_bank_name', { length: 120 }),
  refundAccountNumber: varchar('refund_account_number', { length: 50 }),
  refundAccountHolder: varchar('refund_account_holder', { length: 255 }),
  refundRequestedAt: timestamp('refund_requested_at', { withTimezone: true }),
  refundCompletedAt: timestamp('refund_completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const orderItemsTable = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => ordersTable.id, { onDelete: 'cascade' }),
  courseId: uuid('course_id')
    .notNull()
    .references(() => coursesTable.id),
  courseName: varchar('course_name', { length: 255 }).notNull(),
  price: integer('price').notNull(),
  quantity: integer('quantity').notNull().default(1),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type Order = typeof ordersTable.$inferSelect;
export type NewOrder = typeof ordersTable.$inferInsert;
export type OrderItem = typeof orderItemsTable.$inferSelect;
export type NewOrderItem = typeof orderItemsTable.$inferInsert;
export type OrderStatus = (typeof orderStatusEnum.enumValues)[number];
export type PaymentMethod = (typeof paymentMethodEnum.enumValues)[number];
