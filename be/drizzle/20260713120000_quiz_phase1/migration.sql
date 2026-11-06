DO $$
DECLARE
	table_names text[];
BEGIN
	SELECT array_agg(format('%I', table_name))
	INTO table_names
	FROM information_schema.tables
	WHERE table_schema = 'public'
		AND table_name = ANY (ARRAY[
			'quiz_answer_options',
			'quiz_answers',
			'quiz_attempts',
			'quiz_options',
			'quiz_accepted_answers',
			'quiz_question_answers',
			'quiz_questions',
			'quizzes'
		]);

	IF table_names IS NOT NULL THEN
		EXECUTE 'TRUNCATE TABLE ' || array_to_string(table_names, ', ') || ' CASCADE';
	END IF;
END $$;--> statement-breakpoint
DROP TABLE IF EXISTS "quiz_question_answers" CASCADE;--> statement-breakpoint
ALTER TABLE "quiz_questions" DROP CONSTRAINT IF EXISTS "quiz_questions_type_check";--> statement-breakpoint
DO $$
BEGIN
	IF EXISTS (
		SELECT 1
		FROM information_schema.columns
		WHERE table_schema = 'public'
			AND table_name = 'quiz_questions'
			AND column_name = 'title'
	)
	AND NOT EXISTS (
		SELECT 1
		FROM information_schema.columns
		WHERE table_schema = 'public'
			AND table_name = 'quiz_questions'
			AND column_name = 'question'
	) THEN
		ALTER TABLE "quiz_questions" RENAME COLUMN "title" TO "question";
	ELSIF NOT EXISTS (
		SELECT 1
		FROM information_schema.columns
		WHERE table_schema = 'public'
			AND table_name = 'quiz_questions'
			AND column_name = 'question'
	) THEN
		ALTER TABLE "quiz_questions" ADD COLUMN "question" text NOT NULL DEFAULT '';
		ALTER TABLE "quiz_questions" ALTER COLUMN "question" DROP DEFAULT;
	END IF;
END $$;--> statement-breakpoint
ALTER TABLE "quiz_questions" ALTER COLUMN "type" TYPE text USING "type"::text;--> statement-breakpoint
DROP TYPE IF EXISTS "public"."quiz_question_type";--> statement-breakpoint
CREATE TYPE "public"."quiz_question_type" AS ENUM('single_choice', 'fill_blank');--> statement-breakpoint
ALTER TABLE "quiz_questions" ALTER COLUMN "type" TYPE "public"."quiz_question_type" USING "type"::"public"."quiz_question_type";--> statement-breakpoint
ALTER TABLE "quiz_questions" ALTER COLUMN "order" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "quiz_questions" ALTER COLUMN "created_at" TYPE timestamp with time zone USING "created_at" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "quiz_questions" ALTER COLUMN "updated_at" TYPE timestamp with time zone USING "updated_at" AT TIME ZONE 'UTC';--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_quiz_questions_quiz_order_unique" ON "quiz_questions" USING btree ("quiz_id","order");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quiz_question_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"answer" text NOT NULL,
	"is_correct" boolean DEFAULT false NOT NULL,
	"type" "public"."quiz_question_type" NOT NULL,
	"order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
DO $$
BEGIN
	ALTER TABLE "quiz_question_answers" ADD CONSTRAINT "quiz_question_answers_question_id_quiz_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."quiz_questions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_quiz_question_answers_question_order" ON "quiz_question_answers" USING btree ("question_id","order");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_quiz_question_answers_question_type" ON "quiz_question_answers" USING btree ("question_id","type");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_quiz_question_answers_question_order_unique" ON "quiz_question_answers" USING btree ("question_id","order");
