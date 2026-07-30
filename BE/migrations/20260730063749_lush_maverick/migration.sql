ALTER TABLE "comments" ADD COLUMN IF NOT EXISTS "guest_name" text;
ALTER TABLE "comments" ADD COLUMN IF NOT EXISTS "guest_email" text;
ALTER TABLE "comments" ALTER COLUMN "user_id" DROP NOT NULL;
