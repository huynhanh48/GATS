CREATE TABLE IF NOT EXISTS "course_chat_messages" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "course_id" uuid NOT NULL,
  "sender_id" integer NOT NULL,
  "content" text NOT NULL,
  "pinned_at" timestamp,
  "pinned_by_id" integer,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "course_chat_messages"
    ADD CONSTRAINT "course_chat_messages_course_id_courses_id_fkey"
    FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "course_chat_messages"
    ADD CONSTRAINT "course_chat_messages_sender_id_users_id_fkey"
    FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "course_chat_messages"
    ADD CONSTRAINT "course_chat_messages_pinned_by_id_users_id_fkey"
    FOREIGN KEY ("pinned_by_id") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "idx_course_chat_messages_course_created"
  ON "course_chat_messages" ("course_id", "created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_course_chat_messages_sender"
  ON "course_chat_messages" ("sender_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_course_chat_messages_pinned"
  ON "course_chat_messages" ("course_id", "pinned_at");
