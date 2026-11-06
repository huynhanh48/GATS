-- Supersedes the accidental full Drizzle dump that duplicated earlier
-- incremental migrations (refund_pending, mobile experience, banned_words, …).
-- Those are already applied on production via dated folders before this id.
-- Keep only schema that was not covered by prior migrations: AI Coach.

CREATE TABLE IF NOT EXISTS "ai_coach_sessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "title" varchar(255) DEFAULT 'Cuộc trò chuyện mới' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "deleted_at" timestamp
);

CREATE INDEX IF NOT EXISTS "idx_ai_coach_sessions_user"
  ON "ai_coach_sessions" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_ai_coach_sessions_deleted_at"
  ON "ai_coach_sessions" ("deleted_at");

CREATE TABLE IF NOT EXISTS "ai_coach_messages" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "session_id" uuid NOT NULL REFERENCES "ai_coach_sessions"("id") ON DELETE CASCADE,
  "text" text NOT NULL,
  "is_user" boolean DEFAULT true NOT NULL,
  "timestamp" timestamp DEFAULT now() NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_ai_coach_messages_session"
  ON "ai_coach_messages" ("session_id");
CREATE INDEX IF NOT EXISTS "idx_ai_coach_messages_timestamp"
  ON "ai_coach_messages" ("timestamp");
