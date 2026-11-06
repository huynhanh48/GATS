CREATE TYPE "category_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "category_type" AS ENUM('course', 'post');--> statement-breakpoint
CREATE TYPE "tag_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "tag_type" AS ENUM('course', 'post', 'global');--> statement-breakpoint
CREATE TYPE "comment_status" AS ENUM('visible', 'hidden', 'deleted');--> statement-breakpoint
CREATE TYPE "course_level" AS ENUM('beginner', 'intermediate', 'advanced');--> statement-breakpoint
CREATE TYPE "course_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "enrollment_source" AS ENUM('free', 'paid', 'admin_granted');--> statement-breakpoint
CREATE TYPE "enrollment_status" AS ENUM('active', 'expired', 'cancelled');--> statement-breakpoint
CREATE TYPE "lesson_type" AS ENUM('video', 'text', 'quiz', 'assignment');--> statement-breakpoint
CREATE TYPE "quiz_attempt_status" AS ENUM('in_progress', 'submitted', 'graded', 'expired');--> statement-breakpoint
CREATE TYPE "quiz_question_type" AS ENUM('single_choice', 'multiple_choice', 'fill_blank');--> statement-breakpoint
CREATE TYPE "assignment_submission_status" AS ENUM('draft', 'submitted', 'graded', 'returned');--> statement-breakpoint
CREATE TYPE "post_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "post_visibility" AS ENUM('public', 'private', 'members_only');--> statement-breakpoint
CREATE TYPE "permission_action" AS ENUM('read', 'create', 'update', 'delete');--> statement-breakpoint
CREATE TYPE "auth_type" AS ENUM('facebook', 'apple', 'google', 'default');--> statement-breakpoint
CREATE TYPE "video_status" AS ENUM('pending_upload', 'uploaded', 'processing', 'ready', 'failed');--> statement-breakpoint
CREATE TYPE "video_storage_provider" AS ENUM('firebase', 's3', 'gcs', 'r2', 'local');--> statement-breakpoint
CREATE TYPE "media_kind" AS ENUM('thumbnail', 'file');--> statement-breakpoint
CREATE TYPE "order_status" AS ENUM('pending', 'paid', 'cancelled', 'refunded');--> statement-breakpoint
CREATE TYPE "payment_method" AS ENUM('vnpay', 'bank_transfer', 'momo', 'wallet');--> statement-breakpoint
CREATE TYPE "transaction_status" AS ENUM('pending', 'success', 'failed');--> statement-breakpoint
CREATE TYPE "payment_exception_type" AS ENUM('amount_mismatch', 'txn_ref_not_found', 'txn_ref_mismatch', 'txn_not_found');--> statement-breakpoint
CREATE TYPE "lead_status" AS ENUM('new', 'contacted', 'qualified', 'converted', 'lost', 'spam');--> statement-breakpoint
CREATE TYPE "coupon_type" AS ENUM('percent', 'fixed');--> statement-breakpoint
CREATE TYPE "certificate_status" AS ENUM('issued', 'revoked');--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"thumbnail" varchar(512),
	"icon" varchar(100),
	"type" "category_type" NOT NULL,
	"status" "category_status" DEFAULT 'active'::"category_status" NOT NULL,
	"parent_id" uuid,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"seo_title" varchar(255),
	"seo_description" varchar(512),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"type" "tag_type" NOT NULL,
	"status" "tag_status" DEFAULT 'active'::"tag_status" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_tags" (
	"course_id" uuid,
	"tag_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "course_tags_pkey" PRIMARY KEY("course_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"post_id" uuid NOT NULL,
	"user_id" integer NOT NULL,
	"parent_id" uuid,
	"content" text NOT NULL,
	"status" "comment_status" DEFAULT 'visible'::"comment_status" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comment_likes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"comment_id" uuid NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"thumbnail" varchar(512),
	"intro_video" varchar(512),
	"price" integer DEFAULT 0 NOT NULL,
	"sale_price" integer,
	"level" "course_level" DEFAULT 'beginner'::"course_level" NOT NULL,
	"status" "course_status" DEFAULT 'draft'::"course_status" NOT NULL,
	"instructor_id" integer,
	"category_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"published_at" timestamp,
	"deleted_at" timestamp,
	"deleted_by_id" integer
);
--> statement-breakpoint
CREATE TABLE "course_includes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"course_id" uuid NOT NULL,
	"key" varchar(100) NOT NULL,
	"label" varchar(255) NOT NULL,
	"value" integer,
	"unit" varchar(50),
	"order" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_learning_outcomes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"course_id" uuid NOT NULL,
	"content" text NOT NULL,
	"order" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"course_id" uuid NOT NULL,
	"user_id" integer NOT NULL,
	"rating" integer NOT NULL,
	"content" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "chk_course_reviews_rating" CHECK ("rating" >= 1 AND "rating" <= 5)
);
--> statement-breakpoint
CREATE TABLE "course_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"course_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"order" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" integer NOT NULL,
	"course_id" uuid NOT NULL,
	"source" "enrollment_source" DEFAULT 'paid'::"enrollment_source" NOT NULL,
	"status" "enrollment_status" DEFAULT 'active'::"enrollment_status" NOT NULL,
	"enrolled_at" timestamp DEFAULT now() NOT NULL,
	"expired_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lessons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"course_id" uuid NOT NULL,
	"section_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"type" "lesson_type" DEFAULT 'video'::"lesson_type" NOT NULL,
	"order" integer NOT NULL,
	"content" text,
	"is_preview" boolean DEFAULT false NOT NULL,
	"duration" integer,
	"linked_post_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lesson_attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"lesson_id" uuid NOT NULL,
	"media_id" uuid NOT NULL,
	"title" varchar(255),
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lesson_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" integer NOT NULL,
	"course_id" uuid NOT NULL,
	"lesson_id" uuid NOT NULL,
	"video_id" uuid,
	"watched_seconds" integer DEFAULT 0 NOT NULL,
	"duration_seconds" integer,
	"percent" integer DEFAULT 0 NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp,
	"best_score" real,
	"best_percentage" real,
	"is_passed" boolean DEFAULT false NOT NULL,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"last_watched_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quizzes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"lesson_id" uuid NOT NULL UNIQUE,
	"title" varchar(255),
	"description" text,
	"passing_score" real DEFAULT 70 NOT NULL,
	"time_limit" integer,
	"max_attempts" integer DEFAULT 1 NOT NULL,
	"shuffle_questions" boolean DEFAULT false NOT NULL,
	"shuffle_options" boolean DEFAULT false NOT NULL,
	"show_result" boolean DEFAULT true NOT NULL,
	"show_correct_answer" boolean DEFAULT false NOT NULL,
	"show_explanation" boolean DEFAULT true NOT NULL,
	"available_from" timestamp,
	"available_until" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"quiz_id" uuid NOT NULL,
	"type" "quiz_question_type" NOT NULL,
	"question" text NOT NULL,
	"description" text,
	"explanation" text,
	"points" real DEFAULT 1 NOT NULL,
	"order" integer NOT NULL,
	"is_required" boolean DEFAULT true NOT NULL,
	"case_sensitive" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_question_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"question_id" uuid NOT NULL,
	"answer" text NOT NULL,
	"is_correct" boolean DEFAULT false NOT NULL,
	"type" "quiz_question_type" NOT NULL,
	"order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"question_id" uuid NOT NULL,
	"content" text NOT NULL,
	"is_correct" boolean DEFAULT false NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_accepted_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"question_id" uuid NOT NULL,
	"content" text NOT NULL,
	"is_exact" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"quiz_id" uuid NOT NULL,
	"user_id" integer NOT NULL,
	"attempt_number" integer NOT NULL,
	"status" "quiz_attempt_status" DEFAULT 'in_progress'::"quiz_attempt_status" NOT NULL,
	"score" real,
	"max_score" real,
	"percentage" real,
	"passed" boolean,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"submitted_at" timestamp,
	"graded_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"attempt_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"text_answer" text,
	"is_correct" boolean,
	"score" real,
	"feedback" text,
	"graded_by_id" integer,
	"graded_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_answer_options" (
	"answer_id" uuid,
	"option_id" uuid,
	CONSTRAINT "quiz_answer_options_pkey" PRIMARY KEY("answer_id","option_id")
);
--> statement-breakpoint
CREATE TABLE "assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"lesson_id" uuid NOT NULL UNIQUE,
	"title" varchar(255),
	"due_at" timestamp,
	"max_score" real DEFAULT 100 NOT NULL,
	"max_file_size_mb" integer,
	"allowed_submission_types" text DEFAULT '["text","url","file"]' NOT NULL,
	"late_submission_allowed" boolean DEFAULT false NOT NULL,
	"max_submissions" integer DEFAULT 1 NOT NULL,
	"passing_score" real DEFAULT 70 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assignment_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"assignment_id" uuid NOT NULL,
	"user_id" integer NOT NULL,
	"submission_number" integer DEFAULT 1 NOT NULL,
	"status" "assignment_submission_status" DEFAULT 'draft'::"assignment_submission_status" NOT NULL,
	"text_content" text,
	"url" varchar(2048),
	"score" real,
	"feedback" text,
	"graded_by_id" integer,
	"graded_at" timestamp,
	"submitted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assignment_attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"submission_id" uuid NOT NULL,
	"file_name" varchar(512) NOT NULL,
	"storage_key" varchar(512) NOT NULL,
	"mime_type" varchar(255),
	"size" bigint,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"author_id" integer NOT NULL,
	"category_id" uuid,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"excerpt" text,
	"content" text NOT NULL,
	"thumbnail" varchar(512),
	"status" "post_status" DEFAULT 'draft'::"post_status" NOT NULL,
	"visibility" "post_visibility" DEFAULT 'public'::"post_visibility" NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"deleted_by_id" integer
);
--> statement-breakpoint
CREATE TABLE "post_likes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"post_id" uuid NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_tags" (
	"post_id" uuid,
	"tag_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "post_tags_pkey" PRIMARY KEY("post_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "permissions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(64) NOT NULL,
	"resource_type" varchar(64) NOT NULL,
	"action" "permission_action" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "roles_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(64) NOT NULL UNIQUE,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"role_id" integer,
	"permission_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "role_permissions_pkey" PRIMARY KEY("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_name" varchar(50) NOT NULL UNIQUE,
	"password_hash" varchar(255),
	"verified" boolean DEFAULT false NOT NULL,
	"email" varchar(255) NOT NULL UNIQUE,
	"type" "auth_type" DEFAULT 'default'::"auth_type" NOT NULL,
	"provider_id" varchar(255),
	"verify_token" varchar(255),
	"access_token" varchar(512),
	"token_expires_at" timestamp,
	"is_locked" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_roles_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer NOT NULL,
	"role_id" integer NOT NULL,
	"resource_type" varchar(64),
	"resource_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "videos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"course_id" uuid NOT NULL,
	"lesson_id" uuid NOT NULL UNIQUE,
	"title" varchar(255),
	"storage_provider" "video_storage_provider" DEFAULT 's3'::"video_storage_provider" NOT NULL,
	"original_key" varchar(512),
	"hls_key" varchar(512),
	"mp4_url" varchar(512),
	"duration" integer,
	"size" bigint,
	"upload_id" varchar(255),
	"status" "video_status" DEFAULT 'pending_upload'::"video_status" NOT NULL,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "video_renditions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"video_id" uuid NOT NULL,
	"resolution" varchar(16) NOT NULL,
	"bitrate" integer,
	"playlist_key" varchar(512) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"kind" "media_kind" NOT NULL,
	"original_name" varchar(255) NOT NULL,
	"storage_key" varchar(512) NOT NULL,
	"mime_type" varchar(128) NOT NULL,
	"size" integer NOT NULL,
	"url" varchar(1024) NOT NULL,
	"uploaded_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cart_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"cart_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "carts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" integer NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"order_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"course_name" varchar(255) NOT NULL,
	"price" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" integer NOT NULL,
	"total_amount" integer NOT NULL,
	"status" "order_status" DEFAULT 'pending'::"order_status" NOT NULL,
	"payment_method" "payment_method",
	"customer_name" varchar(255),
	"customer_email" varchar(255),
	"customer_phone" varchar(20),
	"notes" text,
	"coupon_id" uuid,
	"coupon_code" varchar(50),
	"discount_amount" integer DEFAULT 0 NOT NULL,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"order_id" uuid NOT NULL UNIQUE,
	"txn_ref" varchar(255) NOT NULL UNIQUE,
	"amount" integer NOT NULL,
	"payment_method" varchar(50),
	"status" "transaction_status" DEFAULT 'pending'::"transaction_status" NOT NULL,
	"gateway_response" jsonb,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_exceptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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
);
--> statement-breakpoint
CREATE TABLE "bank_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"label" varchar(100) NOT NULL,
	"bank_name" varchar(100) NOT NULL,
	"bank_code" varchar(50) NOT NULL,
	"account_number" varchar(30) NOT NULL,
	"account_holder" varchar(100) NOT NULL,
	"bank_branch" varchar(100),
	"is_default" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"email" varchar(255),
	"message" text,
	"source" varchar(100) DEFAULT 'homepage_cta' NOT NULL,
	"status" "lead_status" DEFAULT 'new'::"lead_status" NOT NULL,
	"assignee_user_id" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"actor_user_id" integer,
	"action" varchar(100) NOT NULL,
	"resource_type" varchar(50) NOT NULL,
	"resource_id" text NOT NULL,
	"meta" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coupon_redemptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"coupon_id" uuid NOT NULL,
	"order_id" uuid NOT NULL,
	"user_id" integer NOT NULL,
	"discount_amount" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coupons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"code" varchar(50) NOT NULL,
	"description" varchar(255),
	"type" "coupon_type" DEFAULT 'percent'::"coupon_type" NOT NULL,
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
);
--> statement-breakpoint
CREATE TABLE "certificates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"certificate_number" varchar(40) NOT NULL,
	"user_id" integer NOT NULL,
	"course_id" uuid NOT NULL,
	"status" "certificate_status" DEFAULT 'issued'::"certificate_status" NOT NULL,
	"issued_by_id" integer,
	"issued_at" timestamp DEFAULT now() NOT NULL,
	"revoked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lesson_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"lesson_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"user_id" integer NOT NULL,
	"content" text NOT NULL,
	"is_resolved" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lesson_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"question_id" uuid NOT NULL,
	"user_id" integer NOT NULL,
	"content" text NOT NULL,
	"is_instructor_answer" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lesson_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" integer NOT NULL,
	"lesson_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"content" text NOT NULL,
	"timestamp_seconds" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lesson_bookmarks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" integer NOT NULL,
	"lesson_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"label" varchar(255),
	"timestamp_seconds" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_chat_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"course_id" uuid NOT NULL,
	"sender_id" integer NOT NULL,
	"content" text NOT NULL,
	"pinned_at" timestamp,
	"pinned_by_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "idx_categories_type_slug" ON "categories" ("type","slug");--> statement-breakpoint
CREATE INDEX "idx_categories_type" ON "categories" ("type");--> statement-breakpoint
CREATE INDEX "idx_categories_status" ON "categories" ("status");--> statement-breakpoint
CREATE INDEX "idx_categories_parent" ON "categories" ("parent_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_tags_type_slug" ON "tags" ("type","slug");--> statement-breakpoint
CREATE INDEX "idx_tags_type" ON "tags" ("type");--> statement-breakpoint
CREATE INDEX "idx_tags_status" ON "tags" ("status");--> statement-breakpoint
CREATE INDEX "idx_course_tags_course" ON "course_tags" ("course_id");--> statement-breakpoint
CREATE INDEX "idx_course_tags_tag" ON "course_tags" ("tag_id");--> statement-breakpoint
CREATE INDEX "idx_comments_post" ON "comments" ("post_id");--> statement-breakpoint
CREATE INDEX "idx_comments_user" ON "comments" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_comments_parent" ON "comments" ("parent_id");--> statement-breakpoint
CREATE INDEX "idx_comments_status" ON "comments" ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_comment_likes_unique" ON "comment_likes" ("comment_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_comment_likes_comment" ON "comment_likes" ("comment_id");--> statement-breakpoint
CREATE INDEX "idx_comment_likes_user" ON "comment_likes" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_courses_status" ON "courses" ("status");--> statement-breakpoint
CREATE INDEX "idx_courses_slug" ON "courses" ("slug");--> statement-breakpoint
CREATE INDEX "idx_courses_instructor" ON "courses" ("instructor_id");--> statement-breakpoint
CREATE INDEX "idx_courses_category" ON "courses" ("category_id");--> statement-breakpoint
CREATE INDEX "idx_courses_level" ON "courses" ("level");--> statement-breakpoint
CREATE INDEX "idx_courses_deleted_at" ON "courses" ("deleted_at");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_courses_slug_active" ON "courses" ("slug") WHERE "deleted_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_course_includes_course_order" ON "course_includes" ("course_id","order");--> statement-breakpoint
CREATE INDEX "idx_course_includes_course" ON "course_includes" ("course_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_course_learning_outcomes_course_order" ON "course_learning_outcomes" ("course_id","order");--> statement-breakpoint
CREATE INDEX "idx_course_learning_outcomes_course" ON "course_learning_outcomes" ("course_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_course_reviews_course_user" ON "course_reviews" ("course_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_course_reviews_course" ON "course_reviews" ("course_id");--> statement-breakpoint
CREATE INDEX "idx_course_reviews_user" ON "course_reviews" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_course_sections_course" ON "course_sections" ("course_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_course_sections_course_order" ON "course_sections" ("course_id","order");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_course_enrollments_user_course" ON "course_enrollments" ("user_id","course_id");--> statement-breakpoint
CREATE INDEX "idx_course_enrollments_user" ON "course_enrollments" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_course_enrollments_course" ON "course_enrollments" ("course_id");--> statement-breakpoint
CREATE INDEX "idx_lessons_course" ON "lessons" ("course_id");--> statement-breakpoint
CREATE INDEX "idx_lessons_section" ON "lessons" ("section_id");--> statement-breakpoint
CREATE INDEX "idx_lessons_linked_post" ON "lessons" ("linked_post_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_lessons_section_order" ON "lessons" ("section_id","order");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_lesson_attachments_unique" ON "lesson_attachments" ("lesson_id","media_id");--> statement-breakpoint
CREATE INDEX "idx_lesson_attachments_lesson" ON "lesson_attachments" ("lesson_id");--> statement-breakpoint
CREATE INDEX "idx_lesson_attachments_media" ON "lesson_attachments" ("media_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_lesson_progress_user_lesson" ON "lesson_progress" ("user_id","lesson_id");--> statement-breakpoint
CREATE INDEX "idx_lesson_progress_user_course" ON "lesson_progress" ("user_id","course_id");--> statement-breakpoint
CREATE INDEX "idx_quiz_questions_quiz_order" ON "quiz_questions" ("quiz_id","order");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_quiz_questions_quiz_order_unique" ON "quiz_questions" ("quiz_id","order");--> statement-breakpoint
CREATE INDEX "idx_quiz_question_answers_question_order" ON "quiz_question_answers" ("question_id","order");--> statement-breakpoint
CREATE INDEX "idx_quiz_question_answers_question_type" ON "quiz_question_answers" ("question_id","type");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_quiz_question_answers_question_order_unique" ON "quiz_question_answers" ("question_id","order");--> statement-breakpoint
CREATE INDEX "idx_quiz_options_question_order" ON "quiz_options" ("question_id","order");--> statement-breakpoint
CREATE INDEX "idx_quiz_accepted_answers_question" ON "quiz_accepted_answers" ("question_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_quiz_attempts_unique" ON "quiz_attempts" ("quiz_id","user_id","attempt_number");--> statement-breakpoint
CREATE INDEX "idx_quiz_attempts_user_quiz" ON "quiz_attempts" ("user_id","quiz_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_quiz_answers_attempt_question" ON "quiz_answers" ("attempt_id","question_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_assignment_submissions_unique" ON "assignment_submissions" ("assignment_id","user_id","submission_number");--> statement-breakpoint
CREATE INDEX "idx_assignment_submissions_assignment" ON "assignment_submissions" ("assignment_id");--> statement-breakpoint
CREATE INDEX "idx_assignment_submissions_user" ON "assignment_submissions" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_assignment_attachments_submission" ON "assignment_attachments" ("submission_id");--> statement-breakpoint
CREATE INDEX "idx_posts_author" ON "posts" ("author_id");--> statement-breakpoint
CREATE INDEX "idx_posts_category" ON "posts" ("category_id");--> statement-breakpoint
CREATE INDEX "idx_posts_status" ON "posts" ("status");--> statement-breakpoint
CREATE INDEX "idx_posts_visibility" ON "posts" ("visibility");--> statement-breakpoint
CREATE INDEX "idx_posts_published_at" ON "posts" ("published_at");--> statement-breakpoint
CREATE INDEX "idx_posts_slug" ON "posts" ("slug");--> statement-breakpoint
CREATE INDEX "idx_posts_deleted_at" ON "posts" ("deleted_at");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_posts_slug_active" ON "posts" ("slug") WHERE "deleted_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_post_likes_unique" ON "post_likes" ("post_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_post_likes_post" ON "post_likes" ("post_id");--> statement-breakpoint
CREATE INDEX "idx_post_likes_user" ON "post_likes" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_post_tags_post" ON "post_tags" ("post_id");--> statement-breakpoint
CREATE INDEX "idx_post_tags_tag" ON "post_tags" ("tag_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_permissions_resource_action_unique" ON "permissions" ("resource_type","action");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_permissions_name_unique" ON "permissions" ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_user_roles_unique" ON "user_roles" ("user_id","role_id",COALESCE("resource_id", '00000000-0000-0000-0000-000000000000'::uuid));--> statement-breakpoint
CREATE INDEX "idx_user_roles_user_lookup" ON "user_roles" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_roles_resource_lookup" ON "user_roles" ("user_id","resource_type","resource_id");--> statement-breakpoint
CREATE INDEX "idx_user_roles_role_lookup" ON "user_roles" ("role_id");--> statement-breakpoint
CREATE INDEX "idx_videos_course" ON "videos" ("course_id");--> statement-breakpoint
CREATE INDEX "idx_videos_status" ON "videos" ("status");--> statement-breakpoint
CREATE INDEX "idx_video_renditions_video" ON "video_renditions" ("video_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_video_renditions_video_resolution" ON "video_renditions" ("video_id","resolution");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_media_storage_key" ON "media" ("storage_key");--> statement-breakpoint
CREATE INDEX "idx_media_kind" ON "media" ("kind");--> statement-breakpoint
CREATE INDEX "idx_media_created_at" ON "media" ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_cart_items_cart_course" ON "cart_items" ("cart_id","course_id");--> statement-breakpoint
CREATE INDEX "idx_payment_exceptions_type" ON "payment_exceptions" ("type");--> statement-breakpoint
CREATE INDEX "idx_payment_exceptions_resolved" ON "payment_exceptions" ("resolved");--> statement-breakpoint
CREATE INDEX "idx_payment_exceptions_order" ON "payment_exceptions" ("order_id");--> statement-breakpoint
CREATE INDEX "idx_payment_exceptions_created_at" ON "payment_exceptions" ("created_at");--> statement-breakpoint
CREATE INDEX "idx_leads_created_at" ON "leads" ("created_at");--> statement-breakpoint
CREATE INDEX "idx_leads_status" ON "leads" ("status");--> statement-breakpoint
CREATE INDEX "idx_notifications_created_at" ON "notifications" ("created_at");--> statement-breakpoint
CREATE INDEX "idx_notifications_is_read" ON "notifications" ("is_read");--> statement-breakpoint
CREATE INDEX "idx_notifications_type" ON "notifications" ("type");--> statement-breakpoint
CREATE INDEX "idx_notifications_source" ON "notifications" ("source");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_resource" ON "audit_logs" ("resource_type","resource_id");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_actor" ON "audit_logs" ("actor_user_id");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_created_at" ON "audit_logs" ("created_at");--> statement-breakpoint
CREATE INDEX "idx_coupon_redemptions_coupon" ON "coupon_redemptions" ("coupon_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_coupon_redemptions_order" ON "coupon_redemptions" ("order_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_coupons_code" ON "coupons" ("code");--> statement-breakpoint
CREATE INDEX "idx_coupons_active" ON "coupons" ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_certificates_number" ON "certificates" ("certificate_number");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_certificates_user_course" ON "certificates" ("user_id","course_id");--> statement-breakpoint
CREATE INDEX "idx_certificates_course" ON "certificates" ("course_id");--> statement-breakpoint
CREATE INDEX "idx_lesson_questions_lesson" ON "lesson_questions" ("lesson_id");--> statement-breakpoint
CREATE INDEX "idx_lesson_questions_course" ON "lesson_questions" ("course_id");--> statement-breakpoint
CREATE INDEX "idx_lesson_questions_user" ON "lesson_questions" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_lesson_answers_question" ON "lesson_answers" ("question_id");--> statement-breakpoint
CREATE INDEX "idx_lesson_notes_user_lesson" ON "lesson_notes" ("user_id","lesson_id");--> statement-breakpoint
CREATE INDEX "idx_lesson_notes_user_course" ON "lesson_notes" ("user_id","course_id");--> statement-breakpoint
CREATE INDEX "idx_lesson_bookmarks_user_lesson" ON "lesson_bookmarks" ("user_id","lesson_id");--> statement-breakpoint
CREATE INDEX "idx_lesson_bookmarks_user_course" ON "lesson_bookmarks" ("user_id","course_id");--> statement-breakpoint
CREATE INDEX "idx_course_chat_messages_course_created" ON "course_chat_messages" ("course_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_course_chat_messages_sender" ON "course_chat_messages" ("sender_id");--> statement-breakpoint
CREATE INDEX "idx_course_chat_messages_pinned" ON "course_chat_messages" ("course_id","pinned_at");--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "course_tags" ADD CONSTRAINT "course_tags_course_id_courses_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "course_tags" ADD CONSTRAINT "course_tags_tag_id_tags_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_posts_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_id_comments_id_fk" FOREIGN KEY ("parent_id") REFERENCES "comments"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "comment_likes" ADD CONSTRAINT "comment_likes_comment_id_comments_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "comment_likes" ADD CONSTRAINT "comment_likes_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_instructor_id_users_id_fkey" FOREIGN KEY ("instructor_id") REFERENCES "users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_category_id_categories_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_deleted_by_id_users_id_fkey" FOREIGN KEY ("deleted_by_id") REFERENCES "users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "course_includes" ADD CONSTRAINT "course_includes_course_id_courses_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "course_learning_outcomes" ADD CONSTRAINT "course_learning_outcomes_course_id_courses_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "course_reviews" ADD CONSTRAINT "course_reviews_course_id_courses_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "course_reviews" ADD CONSTRAINT "course_reviews_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "course_sections" ADD CONSTRAINT "course_sections_course_id_courses_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_course_id_courses_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_course_id_courses_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_section_id_course_sections_id_fkey" FOREIGN KEY ("section_id") REFERENCES "course_sections"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_linked_post_id_posts_id_fkey" FOREIGN KEY ("linked_post_id") REFERENCES "posts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lesson_attachments" ADD CONSTRAINT "lesson_attachments_lesson_id_lessons_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "lesson_attachments" ADD CONSTRAINT "lesson_attachments_media_id_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_course_id_courses_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_lesson_id_lessons_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_video_id_videos_id_fkey" FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_lesson_id_lessons_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_quiz_id_quizzes_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "quiz_question_answers" ADD CONSTRAINT "quiz_question_answers_question_id_quiz_questions_id_fkey" FOREIGN KEY ("question_id") REFERENCES "quiz_questions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "quiz_options" ADD CONSTRAINT "quiz_options_question_id_quiz_questions_id_fkey" FOREIGN KEY ("question_id") REFERENCES "quiz_questions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "quiz_accepted_answers" ADD CONSTRAINT "quiz_accepted_answers_question_id_quiz_questions_id_fkey" FOREIGN KEY ("question_id") REFERENCES "quiz_questions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_quiz_id_quizzes_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_attempt_id_quiz_attempts_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "quiz_attempts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_question_id_quiz_questions_id_fkey" FOREIGN KEY ("question_id") REFERENCES "quiz_questions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_graded_by_id_users_id_fkey" FOREIGN KEY ("graded_by_id") REFERENCES "users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "quiz_answer_options" ADD CONSTRAINT "quiz_answer_options_answer_id_quiz_answers_id_fkey" FOREIGN KEY ("answer_id") REFERENCES "quiz_answers"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "quiz_answer_options" ADD CONSTRAINT "quiz_answer_options_option_id_quiz_options_id_fkey" FOREIGN KEY ("option_id") REFERENCES "quiz_options"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_lesson_id_lessons_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_assignment_id_assignments_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "assignments"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_graded_by_id_users_id_fkey" FOREIGN KEY ("graded_by_id") REFERENCES "users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "assignment_attachments" ADD CONSTRAINT "assignment_attachments_C9NTygk3xSfd_fkey" FOREIGN KEY ("submission_id") REFERENCES "assignment_submissions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_users_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_category_id_categories_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_deleted_by_id_users_id_fkey" FOREIGN KEY ("deleted_by_id") REFERENCES "users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_post_id_posts_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_post_id_posts_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_tag_id_tags_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_course_id_courses_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_lesson_id_lessons_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "video_renditions" ADD CONSTRAINT "video_renditions_video_id_videos_id_fkey" FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_uploaded_by_users_id_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_carts_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "carts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_course_id_courses_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_course_id_courses_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id");--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_order_id_orders_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "payment_exceptions" ADD CONSTRAINT "payment_exceptions_order_id_orders_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "payment_exceptions" ADD CONSTRAINT "payment_exceptions_resolved_by_id_users_id_fkey" FOREIGN KEY ("resolved_by_id") REFERENCES "users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_assignee_user_id_users_id_fkey" FOREIGN KEY ("assignee_user_id") REFERENCES "users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_created_by_user_id_users_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_users_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_coupon_id_coupons_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_order_id_orders_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_created_by_id_users_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_course_id_courses_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_issued_by_id_users_id_fkey" FOREIGN KEY ("issued_by_id") REFERENCES "users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lesson_questions" ADD CONSTRAINT "lesson_questions_lesson_id_lessons_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "lesson_questions" ADD CONSTRAINT "lesson_questions_course_id_courses_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "lesson_questions" ADD CONSTRAINT "lesson_questions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "lesson_answers" ADD CONSTRAINT "lesson_answers_question_id_lesson_questions_id_fkey" FOREIGN KEY ("question_id") REFERENCES "lesson_questions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "lesson_answers" ADD CONSTRAINT "lesson_answers_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "lesson_notes" ADD CONSTRAINT "lesson_notes_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "lesson_notes" ADD CONSTRAINT "lesson_notes_lesson_id_lessons_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "lesson_notes" ADD CONSTRAINT "lesson_notes_course_id_courses_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "lesson_bookmarks" ADD CONSTRAINT "lesson_bookmarks_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "lesson_bookmarks" ADD CONSTRAINT "lesson_bookmarks_lesson_id_lessons_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "lesson_bookmarks" ADD CONSTRAINT "lesson_bookmarks_course_id_courses_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "course_chat_messages" ADD CONSTRAINT "course_chat_messages_course_id_courses_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "course_chat_messages" ADD CONSTRAINT "course_chat_messages_sender_id_users_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "course_chat_messages" ADD CONSTRAINT "course_chat_messages_pinned_by_id_users_id_fkey" FOREIGN KEY ("pinned_by_id") REFERENCES "users"("id") ON DELETE SET NULL;