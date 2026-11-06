import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { usersTable } from './user';

export const membershipBillingIntervalEnum = pgEnum(
  'membership_billing_interval',
  ['lifetime', 'monthly', 'yearly'],
);

export const membershipStatusEnum = pgEnum('membership_status', [
  'active',
  'cancelled',
  'expired',
  'revoked',
]);

export const membershipSourceEnum = pgEnum('membership_source', [
  'purchase',
  'admin_granted',
  'promotion',
  'migration',
  'compensation',
]);

export const membershipPlansTable = pgTable(
  'membership_plans',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    code: varchar('code', { length: 64 }).notNull(),
    name: varchar('name', { length: 120 }).notNull(),
    description: text('description'),
    monthlyPrice: integer('monthly_price'),
    yearlyPrice: integer('yearly_price'),
    monthlyDurationDays: integer('monthly_duration_days'),
    yearlyDurationDays: integer('yearly_duration_days'),
    aiDailyLimit: integer('ai_daily_limit').notNull().default(5),
    mentorReviewsPerMonth: integer('mentor_reviews_per_month').notNull().default(0),
    features: jsonb('features').$type<string[]>().notNull().default([]),
    isActive: boolean('is_active').notNull().default(true),
    displayOrder: integer('display_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_membership_plans_code').on(table.code),
    index('idx_membership_plans_active_order').on(
      table.isActive,
      table.displayOrder,
    ),
  ],
);

export const userMembershipsTable = pgTable(
  'user_memberships',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: integer('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    planId: uuid('plan_id')
      .notNull()
      .references(() => membershipPlansTable.id),
    billingInterval: membershipBillingIntervalEnum('billing_interval').notNull(),
    status: membershipStatusEnum('status').notNull().default('active'),
    source: membershipSourceEnum('source').notNull().default('admin_granted'),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
    currentPeriodStart: timestamp('current_period_start', { withTimezone: true })
      .notNull()
      .defaultNow(),
    currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }),
    cancelAtPeriodEnd: boolean('cancel_at_period_end').notNull().default(false),
    priceSnapshot: integer('price_snapshot').notNull().default(0),
    grantedBy: integer('granted_by').references(() => usersTable.id, {
      onDelete: 'set null',
    }),
    grantReason: text('grant_reason'),
    revokedBy: integer('revoked_by').references(() => usersTable.id, {
      onDelete: 'set null',
    }),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    revokeReason: text('revoke_reason'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_user_memberships_user').on(table.userId),
    index('idx_user_memberships_plan').on(table.planId),
    index('idx_user_memberships_status_end').on(
      table.status,
      table.currentPeriodEnd,
    ),
  ],
);

export type MembershipPlan = typeof membershipPlansTable.$inferSelect;
export type NewMembershipPlan = typeof membershipPlansTable.$inferInsert;
export type UserMembership = typeof userMembershipsTable.$inferSelect;
export type NewUserMembership = typeof userMembershipsTable.$inferInsert;
