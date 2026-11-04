ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "membership_plan_id" uuid;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "membership_billing_interval" varchar(32);
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "membership_price_snapshot" integer;
DO $$ BEGIN
  ALTER TABLE "orders"
    ADD CONSTRAINT "orders_membership_plan_id_membership_plans_id_fk"
    FOREIGN KEY ("membership_plan_id") REFERENCES "membership_plans"("id") ON DELETE restrict;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
