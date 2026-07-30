ALTER TYPE "order_status" ADD VALUE 'refund_pending' BEFORE 'refunded';--> statement-breakpoint
ALTER TYPE "payment_exception_type" ADD VALUE 'late_payment_recovered';--> statement-breakpoint
CREATE TABLE "banned_words" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"word" varchar(100) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"note" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" integer NOT NULL,
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
--> statement-breakpoint
CREATE TABLE "idempotency_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"key" varchar(128) NOT NULL,
	"user_id" integer NOT NULL,
	"route" varchar(255) NOT NULL,
	"request_hash" varchar(64) NOT NULL,
	"response_status" integer NOT NULL,
	"response_body" jsonb NOT NULL,
	"status" varchar(32) DEFAULT 'completed' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "progress_events" (
	"event_id" uuid PRIMARY KEY,
	"user_id" integer NOT NULL,
	"device_id" varchar(128) NOT NULL,
	"course_id" uuid NOT NULL,
	"lesson_id" uuid NOT NULL,
	"type" varchar(32) NOT NULL,
	"position_seconds" integer,
	"occurred_at" timestamp with time zone NOT NULL,
	"client_sequence" integer DEFAULT 0 NOT NULL,
	"content_version" varchar(64),
	"processed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_checkins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" integer NOT NULL,
	"checkin_date" date NOT NULL,
	"xp_awarded" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flashcard_decks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"course_id" uuid,
	"lesson_id" uuid,
	"title" varchar(255) NOT NULL,
	"description" text,
	"status" varchar(32) DEFAULT 'draft' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flashcard_review_events" (
	"event_id" uuid PRIMARY KEY,
	"user_id" integer NOT NULL,
	"card_id" uuid NOT NULL,
	"rating" varchar(16) NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"processed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flashcard_user_state" (
	"user_id" integer,
	"card_id" uuid,
	"ease" real DEFAULT 2.5 NOT NULL,
	"interval_days" integer DEFAULT 0 NOT NULL,
	"lapse_count" integer DEFAULT 0 NOT NULL,
	"due_at" timestamp with time zone,
	"last_reviewed_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "flashcard_user_state_pkey" PRIMARY KEY("user_id","card_id")
);
--> statement-breakpoint
CREATE TABLE "flashcards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"deck_id" uuid NOT NULL,
	"front" text NOT NULL,
	"back" text NOT NULL,
	"hint" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"status" varchar(32) DEFAULT 'published' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_preferences" (
	"user_id" integer PRIMARY KEY,
	"daily_reminder_enabled" boolean DEFAULT true NOT NULL,
	"daily_reminder_time" varchar(8) DEFAULT '20:00',
	"marketing_opt_in" boolean DEFAULT false NOT NULL,
	"learning_updates" boolean DEFAULT true NOT NULL,
	"course_chat_activity" boolean DEFAULT true NOT NULL,
	"quiet_hours_start" varchar(8),
	"quiet_hours_end" varchar(8),
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "push_outbox" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" integer NOT NULL,
	"device_id" uuid,
	"notification_id" uuid,
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
--> statement-breakpoint
CREATE TABLE "recommendation_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" integer,
	"device_id" varchar(128),
	"course_id" uuid,
	"event_type" varchar(32) NOT NULL,
	"algorithm_version" varchar(32),
	"meta" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_devices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"device_uuid" varchar(128) NOT NULL,
	"user_id" integer NOT NULL,
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
--> statement-breakpoint
CREATE TABLE "user_learning_stats" (
	"user_id" integer PRIMARY KEY,
	"total_xp" integer DEFAULT 0 NOT NULL,
	"streak_days" integer DEFAULT 0 NOT NULL,
	"longest_streak" integer DEFAULT 0 NOT NULL,
	"last_active_date" date,
	"daily_goal_minutes" integer DEFAULT 10 NOT NULL,
	"timezone" varchar(64) DEFAULT 'Asia/Ho_Chi_Minh' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "xp_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" integer NOT NULL,
	"source_type" varchar(64) NOT NULL,
	"source_id" varchar(128) NOT NULL,
	"points" integer NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_coach_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" integer NOT NULL,
	"title" varchar(255) DEFAULT 'Cuộc trò chuyện mới' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ai_coach_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"session_id" uuid NOT NULL,
	"text" text NOT NULL,
	"is_user" boolean DEFAULT true NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "onboarding_answers" jsonb;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "onboarding_completed_at" timestamp;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "audio_flac_key" varchar(512);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "refund_reason_code" varchar(50);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "refund_reason_note" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "refund_bank_name" varchar(120);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "refund_account_number" varchar(50);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "refund_account_holder" varchar(255);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "refund_requested_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "refund_completed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "user_id" integer;--> statement-breakpoint
ALTER TABLE "course_includes" ALTER COLUMN "value" SET DATA TYPE varchar(100) USING "value"::varchar(100);--> statement-breakpoint
CREATE INDEX "idx_notifications_user_id" ON "notifications" ("user_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_banned_words_word_lower" ON "banned_words" (lower("word"));--> statement-breakpoint
CREATE INDEX "idx_auth_sessions_user" ON "auth_sessions" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_auth_sessions_refresh_hash" ON "auth_sessions" ("refresh_token_hash");--> statement-breakpoint
CREATE INDEX "idx_auth_sessions_family" ON "auth_sessions" ("family_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_auth_sessions_user_device_active" ON "auth_sessions" ("user_id","device_id") WHERE "revoked_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_idempotency_user_key_route" ON "idempotency_keys" ("user_id","key","route");--> statement-breakpoint
CREATE INDEX "idx_idempotency_expires" ON "idempotency_keys" ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_idempotency_status" ON "idempotency_keys" ("status","expires_at");--> statement-breakpoint
CREATE INDEX "idx_progress_events_user_occurred" ON "progress_events" ("user_id","occurred_at");--> statement-breakpoint
CREATE INDEX "idx_progress_events_user_lesson" ON "progress_events" ("user_id","lesson_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_daily_checkins_user_date" ON "daily_checkins" ("user_id","checkin_date");--> statement-breakpoint
CREATE INDEX "idx_flashcard_decks_course_status" ON "flashcard_decks" ("course_id","status","sort_order");--> statement-breakpoint
CREATE INDEX "idx_flashcard_user_due" ON "flashcard_user_state" ("user_id","due_at");--> statement-breakpoint
CREATE INDEX "idx_flashcards_deck" ON "flashcards" ("deck_id");--> statement-breakpoint
CREATE INDEX "idx_flashcards_deck_status_order" ON "flashcards" ("deck_id","status","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_push_outbox_dedupe" ON "push_outbox" ("user_id","dedupe_key") WHERE "dedupe_key" is not null;--> statement-breakpoint
CREATE INDEX "idx_push_outbox_pending" ON "push_outbox" ("status","scheduled_at");--> statement-breakpoint
CREATE INDEX "idx_recommendation_events_user" ON "recommendation_events" ("user_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_user_devices_user_uuid" ON "user_devices" ("user_id","device_uuid");--> statement-breakpoint
CREATE INDEX "idx_user_devices_push_token" ON "user_devices" ("push_token") WHERE "push_token" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_xp_events_unique_source" ON "xp_events" ("user_id","source_type","source_id");--> statement-breakpoint
CREATE INDEX "idx_xp_events_user" ON "xp_events" ("user_id","occurred_at");--> statement-breakpoint
CREATE INDEX "idx_ai_coach_sessions_user" ON "ai_coach_sessions" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_ai_coach_sessions_deleted_at" ON "ai_coach_sessions" ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_ai_coach_messages_session" ON "ai_coach_messages" ("session_id");--> statement-breakpoint
CREATE INDEX "idx_ai_coach_messages_timestamp" ON "ai_coach_messages" ("timestamp");--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "idempotency_keys" ADD CONSTRAINT "idempotency_keys_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "progress_events" ADD CONSTRAINT "progress_events_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "progress_events" ADD CONSTRAINT "progress_events_course_id_courses_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "progress_events" ADD CONSTRAINT "progress_events_lesson_id_lessons_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "daily_checkins" ADD CONSTRAINT "daily_checkins_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "flashcard_decks" ADD CONSTRAINT "flashcard_decks_course_id_courses_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "flashcard_decks" ADD CONSTRAINT "flashcard_decks_lesson_id_lessons_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "flashcard_review_events" ADD CONSTRAINT "flashcard_review_events_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "flashcard_review_events" ADD CONSTRAINT "flashcard_review_events_card_id_flashcards_id_fkey" FOREIGN KEY ("card_id") REFERENCES "flashcards"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "flashcard_user_state" ADD CONSTRAINT "flashcard_user_state_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "flashcard_user_state" ADD CONSTRAINT "flashcard_user_state_card_id_flashcards_id_fkey" FOREIGN KEY ("card_id") REFERENCES "flashcards"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "flashcards" ADD CONSTRAINT "flashcards_deck_id_flashcard_decks_id_fkey" FOREIGN KEY ("deck_id") REFERENCES "flashcard_decks"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "push_outbox" ADD CONSTRAINT "push_outbox_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "push_outbox" ADD CONSTRAINT "push_outbox_device_id_user_devices_id_fkey" FOREIGN KEY ("device_id") REFERENCES "user_devices"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "push_outbox" ADD CONSTRAINT "push_outbox_notification_id_notifications_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "notifications"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "recommendation_events" ADD CONSTRAINT "recommendation_events_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "recommendation_events" ADD CONSTRAINT "recommendation_events_course_id_courses_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "user_devices" ADD CONSTRAINT "user_devices_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_learning_stats" ADD CONSTRAINT "user_learning_stats_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "xp_events" ADD CONSTRAINT "xp_events_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "ai_coach_sessions" ADD CONSTRAINT "ai_coach_sessions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "ai_coach_messages" ADD CONSTRAINT "ai_coach_messages_session_id_ai_coach_sessions_id_fkey" FOREIGN KEY ("session_id") REFERENCES "ai_coach_sessions"("id") ON DELETE CASCADE;