-- Additive migration for schema present in TS but missing from prior SQL:
-- leads, payment_exceptions, coupons/redemptions, certificates,
-- lesson Q&A/notes/bookmarks, notifications, audit_logs,
-- lessons.linked_post_id, orders coupon columns.
-- Safe to re-run on partially-applied DBs (IF NOT EXISTS / guarded ADD COLUMN).

DO $$ BEGIN
  CREATE TYPE "public"."lead_status" AS ENUM(
    'new', 'contacted', 'qualified', 'converted', 'lost', 'spam'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint

DO $$ BEGIN
  CREATE TYPE "public"."payment_exception_type" AS ENUM(
    'amount_mismatch', 'txn_ref_not_found', 'txn_ref_mismatch', 'txn_not_found'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint

DO $$ BEGIN
  CREATE TYPE "public"."coupon_type" AS ENUM('percent', 'fixed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint

DO $$ BEGIN
  CREATE TYPE "public"."certificate_status" AS ENUM('issued', 'revoked');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"email" varchar(255),
	"message" text,
	"source" varchar(100) DEFAULT 'homepage_cta' NOT NULL,
	"status" "lead_status" DEFAULT 'new' NOT NULL,
	"assignee_user_id" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "payment_exceptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "payment_exception_type" NOT NULL,
	"order_id" uuid,
	"txn_ref" varchar(255),
	"expected_amount" integer,
	"actual_amount" integer,
	"raw_payload" jsonb,
	"resolved" boolean DEFAULT false NOT NULL,
	"resolved_by_id" integer,
	"resolved_at" timestamp,
	"resolution_note" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "coupons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(50) NOT NULL,
	"description" varchar(255),
	"type" "coupon_type" DEFAULT 'percent' NOT NULL,
	"value" integer NOT NULL,
	"max_uses" integer,
	"used_count" integer DEFAULT 0 NOT NULL,
	"min_order_amount" integer DEFAULT 0 NOT NULL,
	"starts_at" timestamp,
	"ends_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "coupon_redemptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"coupon_id" uuid NOT NULL,
	"order_id" uuid NOT NULL,
	"user_id" integer NOT NULL,
	"discount_amount" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "certificates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"certificate_number" varchar(40) NOT NULL,
	"user_id" integer NOT NULL,
	"course_id" uuid NOT NULL,
	"status" "certificate_status" DEFAULT 'issued' NOT NULL,
	"issued_by_id" integer,
	"issued_at" timestamp DEFAULT now() NOT NULL,
	"revoked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "lesson_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lesson_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"user_id" integer NOT NULL,
	"content" text NOT NULL,
	"is_resolved" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "lesson_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"user_id" integer NOT NULL,
	"content" text NOT NULL,
	"is_instructor_answer" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "lesson_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"lesson_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"content" text NOT NULL,
	"timestamp_seconds" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "lesson_bookmarks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"lesson_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"label" varchar(255),
	"timestamp_seconds" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"body" text,
	"href" varchar(500),
	"entity_id" varchar(64),
	"is_read" boolean DEFAULT false NOT NULL,
	"source" varchar(20) DEFAULT 'system' NOT NULL,
	"created_by_user_id" integer,
	"audience_label" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_user_id" integer,
	"action" varchar(100) NOT NULL,
	"resource_type" varchar(50) NOT NULL,
	"resource_id" text NOT NULL,
	"meta" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "lessons" ADD COLUMN "linked_post_id" uuid;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "orders" ADD COLUMN "coupon_id" uuid;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "orders" ADD COLUMN "coupon_code" varchar(50);
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "orders" ADD COLUMN "discount_amount" integer DEFAULT 0 NOT NULL;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;--> statement-breakpoint

-- Foreign keys (ignore if already present)
DO $$ BEGIN
  ALTER TABLE "leads" ADD CONSTRAINT "leads_assignee_user_id_users_id_fkey"
    FOREIGN KEY ("assignee_user_id") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "payment_exceptions" ADD CONSTRAINT "payment_exceptions_order_id_orders_id_fkey"
    FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "payment_exceptions" ADD CONSTRAINT "payment_exceptions_resolved_by_id_users_id_fkey"
    FOREIGN KEY ("resolved_by_id") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "coupons" ADD CONSTRAINT "coupons_created_by_id_users_id_fkey"
    FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_coupon_id_coupons_id_fkey"
    FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_order_id_orders_id_fkey"
    FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_user_id_users_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "certificates" ADD CONSTRAINT "certificates_user_id_users_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "certificates" ADD CONSTRAINT "certificates_course_id_courses_id_fkey"
    FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "certificates" ADD CONSTRAINT "certificates_issued_by_id_users_id_fkey"
    FOREIGN KEY ("issued_by_id") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "lesson_questions" ADD CONSTRAINT "lesson_questions_lesson_id_lessons_id_fkey"
    FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "lesson_questions" ADD CONSTRAINT "lesson_questions_course_id_courses_id_fkey"
    FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "lesson_questions" ADD CONSTRAINT "lesson_questions_user_id_users_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "lesson_answers" ADD CONSTRAINT "lesson_answers_question_id_lesson_questions_id_fkey"
    FOREIGN KEY ("question_id") REFERENCES "lesson_questions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "lesson_answers" ADD CONSTRAINT "lesson_answers_user_id_users_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "lesson_notes" ADD CONSTRAINT "lesson_notes_user_id_users_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "lesson_notes" ADD CONSTRAINT "lesson_notes_lesson_id_lessons_id_fkey"
    FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "lesson_notes" ADD CONSTRAINT "lesson_notes_course_id_courses_id_fkey"
    FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "lesson_bookmarks" ADD CONSTRAINT "lesson_bookmarks_user_id_users_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "lesson_bookmarks" ADD CONSTRAINT "lesson_bookmarks_lesson_id_lessons_id_fkey"
    FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "lesson_bookmarks" ADD CONSTRAINT "lesson_bookmarks_course_id_courses_id_fkey"
    FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "notifications" ADD CONSTRAINT "notifications_created_by_user_id_users_id_fkey"
    FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_users_id_fkey"
    FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "lessons" ADD CONSTRAINT "lessons_linked_post_id_posts_id_fkey"
    FOREIGN KEY ("linked_post_id") REFERENCES "posts"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "idx_leads_created_at" ON "leads" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_leads_status" ON "leads" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_payment_exceptions_type" ON "payment_exceptions" ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_payment_exceptions_resolved" ON "payment_exceptions" ("resolved");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_payment_exceptions_order" ON "payment_exceptions" ("order_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_payment_exceptions_created_at" ON "payment_exceptions" ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_coupons_code" ON "coupons" ("code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_coupons_active" ON "coupons" ("is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_coupon_redemptions_coupon" ON "coupon_redemptions" ("coupon_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_coupon_redemptions_order" ON "coupon_redemptions" ("order_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_certificates_number" ON "certificates" ("certificate_number");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_certificates_user_course" ON "certificates" ("user_id","course_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_certificates_course" ON "certificates" ("course_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_lesson_questions_lesson" ON "lesson_questions" ("lesson_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_lesson_questions_course" ON "lesson_questions" ("course_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_lesson_questions_user" ON "lesson_questions" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_lesson_answers_question" ON "lesson_answers" ("question_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_lesson_notes_user_lesson" ON "lesson_notes" ("user_id","lesson_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_lesson_notes_user_course" ON "lesson_notes" ("user_id","course_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_lesson_bookmarks_user_lesson" ON "lesson_bookmarks" ("user_id","lesson_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_lesson_bookmarks_user_course" ON "lesson_bookmarks" ("user_id","course_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notifications_created_at" ON "notifications" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notifications_is_read" ON "notifications" ("is_read");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notifications_type" ON "notifications" ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notifications_source" ON "notifications" ("source");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_logs_resource" ON "audit_logs" ("resource_type","resource_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_logs_actor" ON "audit_logs" ("actor_user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_logs_created_at" ON "audit_logs" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_lessons_linked_post" ON "lessons" ("linked_post_id");
