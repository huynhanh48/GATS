-- Mobile experience P0/P1 foundation

CREATE TABLE IF NOT EXISTS "auth_sessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "device_id" varchar(128) NOT NULL,
  "platform" varchar(32),
  "app_version" varchar(32),
  "refresh_token_hash" varchar(128) NOT NULL,
  "family_id" uuid NOT NULL,
  "expires_at" timestamp with time zone NOT NULL,
  "last_used_at" timestamp with time zone DEFAULT now() NOT NULL,
  "revoked_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_auth_sessions_user"
  ON "auth_sessions" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_auth_sessions_refresh_hash"
  ON "auth_sessions" ("refresh_token_hash");
CREATE INDEX IF NOT EXISTS "idx_auth_sessions_family"
  ON "auth_sessions" ("family_id");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_auth_sessions_user_device_active"
  ON "auth_sessions" ("user_id", "device_id")
  WHERE "revoked_at" IS NULL;

CREATE TABLE IF NOT EXISTS "idempotency_keys" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "key" varchar(128) NOT NULL,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "route" varchar(255) NOT NULL,
  "request_hash" varchar(64) NOT NULL,
  "response_status" integer NOT NULL,
  "response_body" jsonb NOT NULL,
  "expires_at" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "idx_idempotency_user_key_route"
  ON "idempotency_keys" ("user_id", "key", "route");
CREATE INDEX IF NOT EXISTS "idx_idempotency_expires"
  ON "idempotency_keys" ("expires_at");

CREATE TABLE IF NOT EXISTS "progress_events" (
  "event_id" uuid PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "device_id" varchar(128) NOT NULL,
  "course_id" uuid NOT NULL REFERENCES "courses"("id") ON DELETE CASCADE,
  "lesson_id" uuid NOT NULL REFERENCES "lessons"("id") ON DELETE CASCADE,
  "type" varchar(32) NOT NULL,
  "position_seconds" integer,
  "occurred_at" timestamp with time zone NOT NULL,
  "client_sequence" integer NOT NULL DEFAULT 0,
  "content_version" varchar(64),
  "processed_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_progress_events_user_occurred"
  ON "progress_events" ("user_id", "occurred_at");
CREATE INDEX IF NOT EXISTS "idx_progress_events_user_lesson"
  ON "progress_events" ("user_id", "lesson_id");

CREATE TABLE IF NOT EXISTS "user_devices" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "device_uuid" varchar(128) NOT NULL,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "push_token" varchar(512),
  "platform" varchar(32) NOT NULL,
  "app_version" varchar(32),
  "locale" varchar(16),
  "timezone" varchar(64) DEFAULT 'Asia/Ho_Chi_Minh',
  "push_permission" varchar(32) DEFAULT 'unknown',
  "last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
  "token_invalidated_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "idx_user_devices_user_uuid"
  ON "user_devices" ("user_id", "device_uuid");
CREATE INDEX IF NOT EXISTS "idx_user_devices_push_token"
  ON "user_devices" ("push_token")
  WHERE "push_token" IS NOT NULL;

CREATE TABLE IF NOT EXISTS "notification_preferences" (
  "user_id" integer PRIMARY KEY REFERENCES "users"("id") ON DELETE CASCADE,
  "daily_reminder_enabled" boolean DEFAULT true NOT NULL,
  "daily_reminder_time" varchar(8) DEFAULT '20:00',
  "marketing_opt_in" boolean DEFAULT false NOT NULL,
  "learning_updates" boolean DEFAULT true NOT NULL,
  "course_chat_activity" boolean DEFAULT true NOT NULL,
  "quiet_hours_start" varchar(8),
  "quiet_hours_end" varchar(8),
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "notifications"
  ADD COLUMN IF NOT EXISTS "user_id" integer REFERENCES "users"("id") ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS "idx_notifications_user_id"
  ON "notifications" ("user_id", "created_at" DESC);

CREATE TABLE IF NOT EXISTS "push_outbox" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "device_id" uuid REFERENCES "user_devices"("id") ON DELETE SET NULL,
  "notification_id" uuid REFERENCES "notifications"("id") ON DELETE SET NULL,
  "title" varchar(255) NOT NULL,
  "body" text,
  "deep_link" varchar(500),
  "dedupe_key" varchar(128),
  "status" varchar(32) DEFAULT 'pending' NOT NULL,
  "attempts" integer DEFAULT 0 NOT NULL,
  "last_error" text,
  "scheduled_at" timestamp with time zone DEFAULT now() NOT NULL,
  "sent_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "idx_push_outbox_dedupe"
  ON "push_outbox" ("user_id", "dedupe_key")
  WHERE "dedupe_key" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "idx_push_outbox_pending"
  ON "push_outbox" ("status", "scheduled_at");

CREATE TABLE IF NOT EXISTS "xp_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "source_type" varchar(64) NOT NULL,
  "source_id" varchar(128) NOT NULL,
  "points" integer NOT NULL,
  "occurred_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "idx_xp_events_unique_source"
  ON "xp_events" ("user_id", "source_type", "source_id");
CREATE INDEX IF NOT EXISTS "idx_xp_events_user"
  ON "xp_events" ("user_id", "occurred_at" DESC);

CREATE TABLE IF NOT EXISTS "user_learning_stats" (
  "user_id" integer PRIMARY KEY REFERENCES "users"("id") ON DELETE CASCADE,
  "total_xp" integer DEFAULT 0 NOT NULL,
  "streak_days" integer DEFAULT 0 NOT NULL,
  "longest_streak" integer DEFAULT 0 NOT NULL,
  "last_active_date" date,
  "daily_goal_minutes" integer DEFAULT 10 NOT NULL,
  "timezone" varchar(64) DEFAULT 'Asia/Ho_Chi_Minh' NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "daily_checkins" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "checkin_date" date NOT NULL,
  "xp_awarded" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "idx_daily_checkins_user_date"
  ON "daily_checkins" ("user_id", "checkin_date");

CREATE TABLE IF NOT EXISTS "flashcard_decks" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "course_id" uuid REFERENCES "courses"("id") ON DELETE CASCADE,
  "title" varchar(255) NOT NULL,
  "version" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "flashcards" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "deck_id" uuid NOT NULL REFERENCES "flashcard_decks"("id") ON DELETE CASCADE,
  "front" text NOT NULL,
  "back" text NOT NULL,
  "version" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_flashcards_deck"
  ON "flashcards" ("deck_id");

CREATE TABLE IF NOT EXISTS "flashcard_user_state" (
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "card_id" uuid NOT NULL REFERENCES "flashcards"("id") ON DELETE CASCADE,
  "ease" real DEFAULT 2.5 NOT NULL,
  "interval_days" integer DEFAULT 0 NOT NULL,
  "lapse_count" integer DEFAULT 0 NOT NULL,
  "due_at" timestamp with time zone,
  "last_reviewed_at" timestamp with time zone,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY ("user_id", "card_id")
);

CREATE INDEX IF NOT EXISTS "idx_flashcard_user_due"
  ON "flashcard_user_state" ("user_id", "due_at");

CREATE TABLE IF NOT EXISTS "flashcard_review_events" (
  "event_id" uuid PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "card_id" uuid NOT NULL REFERENCES "flashcards"("id") ON DELETE CASCADE,
  "rating" varchar(16) NOT NULL,
  "occurred_at" timestamp with time zone NOT NULL,
  "processed_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "recommendation_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" integer REFERENCES "users"("id") ON DELETE SET NULL,
  "device_id" varchar(128),
  "course_id" uuid REFERENCES "courses"("id") ON DELETE SET NULL,
  "event_type" varchar(32) NOT NULL,
  "algorithm_version" varchar(32),
  "meta" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_recommendation_events_user"
  ON "recommendation_events" ("user_id", "created_at" DESC);
