CREATE TABLE IF NOT EXISTS "course_review_milestones" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "course_id" uuid NOT NULL REFERENCES "courses"("id") ON DELETE CASCADE,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "milestone" integer NOT NULL,
  "progress_percent" integer NOT NULL,
  "completed_lessons" integer NOT NULL,
  "total_lessons" integer NOT NULL,
  "status" varchar(24) DEFAULT 'prompted' NOT NULL,
  "source" varchar(32) NOT NULL,
  "device_id" varchar(128),
  "metadata" jsonb,
  "prompted_at" timestamp with time zone,
  "resolved_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "chk_course_review_milestone_value" CHECK ("milestone" IN (25, 50, 75, 100)),
  CONSTRAINT "chk_course_review_milestone_status" CHECK ("status" IN ('skipped', 'prompted', 'dismissed', 'reviewed'))
);

CREATE UNIQUE INDEX IF NOT EXISTS "idx_course_review_milestones_user_course_milestone"
  ON "course_review_milestones" ("user_id", "course_id", "milestone");
CREATE INDEX IF NOT EXISTS "idx_course_review_milestones_user_course"
  ON "course_review_milestones" ("user_id", "course_id");
