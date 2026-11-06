DO $$
BEGIN
	IF EXISTS (
		SELECT 1
		FROM information_schema.columns
		WHERE table_schema = 'public'
			AND table_name = 'lessons'
			AND column_name = 'text_content'
	)
	AND NOT EXISTS (
		SELECT 1
		FROM information_schema.columns
		WHERE table_schema = 'public'
			AND table_name = 'lessons'
			AND column_name = 'content'
	) THEN
		ALTER TABLE "lessons" RENAME COLUMN "text_content" TO "content";
	ELSIF NOT EXISTS (
		SELECT 1
		FROM information_schema.columns
		WHERE table_schema = 'public'
			AND table_name = 'lessons'
			AND column_name = 'content'
	) THEN
		ALTER TABLE "lessons" ADD COLUMN "content" text;
	END IF;
END $$;--> statement-breakpoint
DO $$
BEGIN
	CREATE TYPE "public"."quiz_attempt_status" AS ENUM('in_progress', 'submitted', 'graded', 'expired');
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$
BEGIN
	CREATE TYPE "public"."quiz_question_type" AS ENUM('single_choice', 'multiple_choice', 'true_false', 'short_answer', 'essay');
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$
BEGIN
	CREATE TYPE "public"."assignment_submission_status" AS ENUM('draft', 'submitted', 'graded', 'returned');
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quizzes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lesson_id" uuid NOT NULL,
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
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "quizzes_lesson_id_unique" UNIQUE("lesson_id")
);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quiz_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quiz_id" uuid NOT NULL,
	"type" "quiz_question_type" NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"explanation" text,
	"points" real DEFAULT 1 NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"is_required" boolean DEFAULT true NOT NULL,
	"case_sensitive" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quiz_options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"content" text NOT NULL,
	"is_correct" boolean DEFAULT false NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quiz_accepted_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"content" text NOT NULL,
	"is_exact" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quiz_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quiz_id" uuid NOT NULL,
	"user_id" integer NOT NULL,
	"attempt_number" integer NOT NULL,
	"status" "quiz_attempt_status" DEFAULT 'in_progress' NOT NULL,
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
);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quiz_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
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
);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quiz_answer_options" (
	"answer_id" uuid NOT NULL,
	"option_id" uuid NOT NULL,
	CONSTRAINT "quiz_answer_options_answer_id_option_id_pk" PRIMARY KEY("answer_id","option_id")
);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lesson_id" uuid NOT NULL,
	"title" varchar(255),
	"due_at" timestamp,
	"max_score" real DEFAULT 100 NOT NULL,
	"max_file_size_mb" integer,
	"allowed_submission_types" text DEFAULT '["text","url","file"]' NOT NULL,
	"late_submission_allowed" boolean DEFAULT false NOT NULL,
	"max_submissions" integer DEFAULT 1 NOT NULL,
	"passing_score" real DEFAULT 70 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "assignments_lesson_id_unique" UNIQUE("lesson_id")
);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "assignment_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assignment_id" uuid NOT NULL,
	"user_id" integer NOT NULL,
	"submission_number" integer DEFAULT 1 NOT NULL,
	"status" "assignment_submission_status" DEFAULT 'draft' NOT NULL,
	"text_content" text,
	"url" varchar(2048),
	"score" real,
	"feedback" text,
	"graded_by_id" integer,
	"graded_at" timestamp,
	"submitted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "assignment_attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid NOT NULL,
	"file_name" varchar(512) NOT NULL,
	"storage_key" varchar(512) NOT NULL,
	"mime_type" varchar(255),
	"size" bigint,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD COLUMN IF NOT EXISTS "best_score" real;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD COLUMN IF NOT EXISTS "best_percentage" real;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD COLUMN IF NOT EXISTS "is_passed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD COLUMN IF NOT EXISTS "attempt_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
DO $$
BEGIN
	ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$
BEGIN
	ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$
BEGIN
	ALTER TABLE "quiz_options" ADD CONSTRAINT "quiz_options_question_id_quiz_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."quiz_questions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$
BEGIN
	ALTER TABLE "quiz_accepted_answers" ADD CONSTRAINT "quiz_accepted_answers_question_id_quiz_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."quiz_questions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$
BEGIN
	ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$
BEGIN
	ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$
BEGIN
	ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_attempt_id_quiz_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."quiz_attempts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$
BEGIN
	ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_question_id_quiz_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."quiz_questions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$
BEGIN
	ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_graded_by_id_users_id_fk" FOREIGN KEY ("graded_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$
BEGIN
	ALTER TABLE "quiz_answer_options" ADD CONSTRAINT "quiz_answer_options_answer_id_quiz_answers_id_fk" FOREIGN KEY ("answer_id") REFERENCES "public"."quiz_answers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$
BEGIN
	ALTER TABLE "quiz_answer_options" ADD CONSTRAINT "quiz_answer_options_option_id_quiz_options_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."quiz_options"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$
BEGIN
	ALTER TABLE "assignments" ADD CONSTRAINT "assignments_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$
BEGIN
	ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_assignment_id_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."assignments"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$
BEGIN
	ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$
BEGIN
	ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_graded_by_id_users_id_fk" FOREIGN KEY ("graded_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$
BEGIN
	ALTER TABLE "assignment_attachments" ADD CONSTRAINT "assignment_attachments_submission_id_assignment_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."assignment_submissions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_quiz_questions_quiz_order" ON "quiz_questions" USING btree ("quiz_id","order");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_quiz_options_question_order" ON "quiz_options" USING btree ("question_id","order");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_quiz_accepted_answers_question" ON "quiz_accepted_answers" USING btree ("question_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_quiz_attempts_unique" ON "quiz_attempts" USING btree ("quiz_id","user_id","attempt_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_quiz_attempts_user_quiz" ON "quiz_attempts" USING btree ("user_id","quiz_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_quiz_answers_attempt_question" ON "quiz_answers" USING btree ("attempt_id","question_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_assignment_submissions_unique" ON "assignment_submissions" USING btree ("assignment_id","user_id","submission_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_assignment_submissions_assignment" ON "assignment_submissions" USING btree ("assignment_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_assignment_submissions_user" ON "assignment_submissions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_assignment_attachments_submission" ON "assignment_attachments" USING btree ("submission_id");
