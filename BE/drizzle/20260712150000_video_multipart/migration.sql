ALTER TABLE "videos" ALTER COLUMN "size" TYPE bigint;
ALTER TABLE "videos" ADD COLUMN IF NOT EXISTS "upload_id" varchar(255);
