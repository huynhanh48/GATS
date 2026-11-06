CREATE TYPE "enrollment_source" AS ENUM('free', 'paid', 'admin_granted');--> statement-breakpoint
CREATE TYPE "enrollment_status" AS ENUM('active', 'expired', 'cancelled');--> statement-breakpoint
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
	"last_watched_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "idx_course_enrollments_user_course" ON "course_enrollments" ("user_id","course_id");--> statement-breakpoint
CREATE INDEX "idx_course_enrollments_user" ON "course_enrollments" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_course_enrollments_course" ON "course_enrollments" ("course_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_lesson_progress_user_lesson" ON "lesson_progress" ("user_id","lesson_id");--> statement-breakpoint
CREATE INDEX "idx_lesson_progress_user_course" ON "lesson_progress" ("user_id","course_id");--> statement-breakpoint
ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_course_id_courses_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_course_id_courses_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_lesson_id_lessons_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_video_id_videos_id_fkey" FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE SET NULL;