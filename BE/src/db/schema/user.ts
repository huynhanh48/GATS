import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

export const authTypeEnum = pgEnum('auth_type', [
  'facebook',
  'apple',
  'google',
  'default',
]);

export const usersTable = pgTable('users', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userName: varchar('user_name', { length: 50 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }),
  verified: boolean().notNull().default(false),
  email: varchar({ length: 255 }).notNull().unique(),
  type: authTypeEnum().notNull().default('default'),
  providerId: varchar('provider_id', { length: 255 }),
  verifyToken: varchar('verify_token', { length: 255 }),
  accessToken: varchar('access_token', { length: 512 }),
  tokenExpiresAt: timestamp('token_expires_at'),
  isLocked: boolean('is_locked').notNull().default(false),
  onboardingAnswers: jsonb('onboarding_answers'),
  onboardingCompletedAt: timestamp('onboarding_completed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;
