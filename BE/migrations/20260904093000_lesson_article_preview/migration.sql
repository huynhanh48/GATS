ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "is_article_preview" boolean DEFAULT false NOT NULL;
ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "video_preview_duration_seconds" integer DEFAULT 180 NOT NULL;
ALTER TABLE "lessons" ADD CONSTRAINT "chk_lesson_video_preview_duration" CHECK ("video_preview_duration_seconds" BETWEEN 30 AND 600);
