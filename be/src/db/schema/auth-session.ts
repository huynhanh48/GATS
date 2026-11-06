import {
  index,
  integer,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

import { usersTable } from './user';

export const authSessionsTable = pgTable(
  'auth_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: integer('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    deviceId: varchar('device_id', { length: 128 }).notNull(),
    platform: varchar('platform', { length: 32 }),
    appVersion: varchar('app_version', { length: 32 }),
    refreshTokenHash: varchar('refresh_token_hash', { length: 128 }).notNull(),
    familyId: uuid('family_id').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    lastUsedAt: timestamp('last_used_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('idx_auth_sessions_user').on(table.userId),
    index('idx_auth_sessions_refresh_hash').on(table.refreshTokenHash),
    index('idx_auth_sessions_family').on(table.familyId),
    uniqueIndex('idx_auth_sessions_user_device_active')
      .on(table.userId, table.deviceId)
      .where(sql`${table.revokedAt} is null`),
  ],
);

export type AuthSession = typeof authSessionsTable.$inferSelect;
export type NewAuthSession = typeof authSessionsTable.$inferInsert;
