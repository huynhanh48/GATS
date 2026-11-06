ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "prompt_item_key" varchar(160);
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "prompt_title_snapshot" varchar(255);
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "prompt_price_snapshot" integer;
CREATE INDEX IF NOT EXISTS "orders_paid_prompt_owner_idx" ON "orders" ("user_id", "prompt_item_key", "status");
