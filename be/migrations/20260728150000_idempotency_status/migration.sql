ALTER TABLE "idempotency_keys"
  ADD COLUMN IF NOT EXISTS "status" varchar(32) NOT NULL DEFAULT 'completed';

CREATE INDEX IF NOT EXISTS "idx_idempotency_status"
  ON "idempotency_keys" ("status", "expires_at");
