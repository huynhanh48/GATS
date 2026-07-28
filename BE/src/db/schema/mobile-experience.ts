import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

import { coursesTable } from './course';
import { notificationsTable } from './notification';
import { usersTable } from './user';

export const userDevicesTable = pgTable(
  'user_devices',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    deviceUuid: varchar('device_uuid', { length: 128 }).notNull(),
    userId: integer('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    pushToken: varchar('push_token', { length: 512 }),
    platform: varchar('platform', { length: 32 }).notNull(),
    appVersion: varchar('app_version', { length: 32 }),
    locale: varchar('locale', { length: 16 }),
    timezone: varchar('timezone', { length: 64 }).default('Asia/Ho_Chi_Minh'),
    pushPermission: varchar('push_permission', { length: 32 }).default(
      'unknown',
    ),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    tokenInvalidatedAt: timestamp('token_invalidated_at', {
      withTimezone: true,
    }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_user_devices_user_uuid').on(
      table.userId,
      table.deviceUuid,
    ),
    index('idx_user_devices_push_token')
      .on(table.pushToken)
      .where(sql`${table.pushToken} is not null`),
  ],
);

export const notificationPreferencesTable = pgTable(
  'notification_preferences',
  {
    userId: integer('user_id')
      .primaryKey()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    dailyReminderEnabled: boolean('daily_reminder_enabled')
      .notNull()
      .default(true),
    dailyReminderTime: varchar('daily_reminder_time', { length: 8 }).default(
      '20:00',
    ),
    marketingOptIn: boolean('marketing_opt_in').notNull().default(false),
    learningUpdates: boolean('learning_updates').notNull().default(true),
    courseChatActivity: boolean('course_chat_activity').notNull().default(true),
    quietHoursStart: varchar('quiet_hours_start', { length: 8 }),
    quietHoursEnd: varchar('quiet_hours_end', { length: 8 }),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
);

export const pushOutboxTable = pgTable(
  'push_outbox',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: integer('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    deviceId: uuid('device_id').references(() => userDevicesTable.id, {
      onDelete: 'set null',
    }),
    notificationId: uuid('notification_id').references(
      () => notificationsTable.id,
      { onDelete: 'set null' },
    ),
    title: varchar('title', { length: 255 }).notNull(),
    body: text('body'),
    deepLink: varchar('deep_link', { length: 500 }),
    dedupeKey: varchar('dedupe_key', { length: 128 }),
    status: varchar('status', { length: 32 }).notNull().default('pending'),
    attempts: integer('attempts').notNull().default(0),
    lastError: text('last_error'),
    scheduledAt: timestamp('scheduled_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    sentAt: timestamp('sent_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_push_outbox_dedupe')
      .on(table.userId, table.dedupeKey)
      .where(sql`${table.dedupeKey} is not null`),
    index('idx_push_outbox_pending').on(table.status, table.scheduledAt),
  ],
);

export const xpEventsTable = pgTable(
  'xp_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: integer('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    sourceType: varchar('source_type', { length: 64 }).notNull(),
    sourceId: varchar('source_id', { length: 128 }).notNull(),
    points: integer('points').notNull(),
    occurredAt: timestamp('occurred_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_xp_events_unique_source').on(
      table.userId,
      table.sourceType,
      table.sourceId,
    ),
    index('idx_xp_events_user').on(table.userId, table.occurredAt),
  ],
);

export const userLearningStatsTable = pgTable('user_learning_stats', {
  userId: integer('user_id')
    .primaryKey()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  totalXp: integer('total_xp').notNull().default(0),
  streakDays: integer('streak_days').notNull().default(0),
  longestStreak: integer('longest_streak').notNull().default(0),
  lastActiveDate: date('last_active_date'),
  dailyGoalMinutes: integer('daily_goal_minutes').notNull().default(10),
  timezone: varchar('timezone', { length: 64 })
    .notNull()
    .default('Asia/Ho_Chi_Minh'),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const dailyCheckinsTable = pgTable(
  'daily_checkins',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: integer('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    checkinDate: date('checkin_date').notNull(),
    xpAwarded: integer('xp_awarded').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_daily_checkins_user_date').on(
      table.userId,
      table.checkinDate,
    ),
  ],
);

export const flashcardDecksTable = pgTable('flashcard_decks', {
  id: uuid('id').primaryKey().defaultRandom(),
  courseId: uuid('course_id').references(() => coursesTable.id, {
    onDelete: 'cascade',
  }),
  title: varchar('title', { length: 255 }).notNull(),
  version: integer('version').notNull().default(1),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const flashcardsTable = pgTable(
  'flashcards',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    deckId: uuid('deck_id')
      .notNull()
      .references(() => flashcardDecksTable.id, { onDelete: 'cascade' }),
    front: text('front').notNull(),
    back: text('back').notNull(),
    version: integer('version').notNull().default(1),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index('idx_flashcards_deck').on(table.deckId)],
);

export const flashcardUserStateTable = pgTable(
  'flashcard_user_state',
  {
    userId: integer('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    cardId: uuid('card_id')
      .notNull()
      .references(() => flashcardsTable.id, { onDelete: 'cascade' }),
    ease: real('ease').notNull().default(2.5),
    intervalDays: integer('interval_days').notNull().default(0),
    lapseCount: integer('lapse_count').notNull().default(0),
    dueAt: timestamp('due_at', { withTimezone: true }),
    lastReviewedAt: timestamp('last_reviewed_at', { withTimezone: true }),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.cardId] }),
    index('idx_flashcard_user_due').on(table.userId, table.dueAt),
  ],
);

export const flashcardReviewEventsTable = pgTable('flashcard_review_events', {
  eventId: uuid('event_id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  cardId: uuid('card_id')
    .notNull()
    .references(() => flashcardsTable.id, { onDelete: 'cascade' }),
  rating: varchar('rating', { length: 16 }).notNull(),
  occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull(),
  processedAt: timestamp('processed_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const recommendationEventsTable = pgTable(
  'recommendation_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: integer('user_id').references(() => usersTable.id, {
      onDelete: 'set null',
    }),
    deviceId: varchar('device_id', { length: 128 }),
    courseId: uuid('course_id').references(() => coursesTable.id, {
      onDelete: 'set null',
    }),
    eventType: varchar('event_type', { length: 32 }).notNull(),
    algorithmVersion: varchar('algorithm_version', { length: 32 }),
    meta: jsonb('meta'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('idx_recommendation_events_user').on(table.userId, table.createdAt),
  ],
);

export type UserDevice = typeof userDevicesTable.$inferSelect;
export type XpEvent = typeof xpEventsTable.$inferSelect;
export type UserLearningStats = typeof userLearningStatsTable.$inferSelect;
