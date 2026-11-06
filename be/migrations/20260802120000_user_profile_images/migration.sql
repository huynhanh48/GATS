ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "avatar_url" varchar(512),
  ADD COLUMN IF NOT EXISTS "cover_url" varchar(512);
