ALTER TYPE "video_storage_provider" ADD VALUE IF NOT EXISTS 'local';
--> statement-breakpoint
ALTER TABLE "videos" ALTER COLUMN "storage_provider" SET DEFAULT 'local';
