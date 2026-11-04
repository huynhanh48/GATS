import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { ordersTable } from './order';
import { usersTable } from './user';
import { membershipPlansTable } from './membership';

export const couponTypeEnum = pgEnum('coupon_type', ['percent', 'fixed']);
export const couponScopeEnum = pgEnum('coupon_scope', ['all', 'course', 'membership']);

export const couponsTable = pgTable(
  'coupons',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    code: varchar('code', { length: 50 }).notNull(),
    description: varchar('description', { length: 255 }),
    type: couponTypeEnum('type').notNull().default('percent'),
    scope: couponScopeEnum('scope').notNull().default('all'),
    membershipPlanId: uuid('membership_plan_id').references(
      () => membershipPlansTable.id,
      { onDelete: 'set null' },
    ),
    /** percent: 1-100, fixed: VND amount */
    value: integer('value').notNull(),
    /** null = unlimited uses */
    maxUses: integer('max_uses'),
    usedCount: integer('used_count').notNull().default(0),
    minOrderAmount: integer('min_order_amount').notNull().default(0),
    startsAt: timestamp('starts_at'),
    endsAt: timestamp('ends_at'),
    isActive: boolean('is_active').notNull().default(true),
    createdById: integer('created_by_id').references(() => usersTable.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_coupons_code').on(table.code),
    index('idx_coupons_active').on(table.isActive),
  ],
);

export const couponRedemptionsTable = pgTable(
  'coupon_redemptions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    couponId: uuid('coupon_id')
      .notNull()
      .references(() => couponsTable.id, { onDelete: 'cascade' }),
    orderId: uuid('order_id')
      .notNull()
      .references(() => ordersTable.id, { onDelete: 'cascade' }),
    userId: integer('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    discountAmount: integer('discount_amount').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_coupon_redemptions_coupon').on(table.couponId),
    uniqueIndex('idx_coupon_redemptions_order').on(table.orderId),
  ],
);

export type Coupon = typeof couponsTable.$inferSelect;
export type NewCoupon = typeof couponsTable.$inferInsert;
export type CouponType = (typeof couponTypeEnum.enumValues)[number];
export type CouponScope = (typeof couponScopeEnum.enumValues)[number];
export type CouponRedemption = typeof couponRedemptionsTable.$inferSelect;
export type NewCouponRedemption = typeof couponRedemptionsTable.$inferInsert;
