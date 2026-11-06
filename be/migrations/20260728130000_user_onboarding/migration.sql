ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "onboarding_answers" jsonb,
  ADD COLUMN IF NOT EXISTS "onboarding_completed_at" timestamp;
