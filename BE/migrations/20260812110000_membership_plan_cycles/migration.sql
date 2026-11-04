ALTER TABLE "membership_plans" ADD COLUMN IF NOT EXISTS "monthly_price" integer;
ALTER TABLE "membership_plans" ADD COLUMN IF NOT EXISTS "yearly_price" integer;
ALTER TABLE "membership_plans" ADD COLUMN IF NOT EXISTS "monthly_duration_days" integer;
ALTER TABLE "membership_plans" ADD COLUMN IF NOT EXISTS "yearly_duration_days" integer;

ALTER TABLE "user_memberships" ADD COLUMN IF NOT EXISTS "billing_interval" "membership_billing_interval";

UPDATE "user_memberships" um
SET "billing_interval" = mp."billing_interval"
FROM "membership_plans" mp
WHERE um."plan_id" = mp."id" AND um."billing_interval" IS NULL;

UPDATE "membership_plans"
SET
  "name" = 'GATS Basic',
  "monthly_price" = 0,
  "yearly_price" = 0,
  "monthly_duration_days" = NULL,
  "yearly_duration_days" = NULL
WHERE "code" = 'BASIC';

UPDATE "membership_plans"
SET
  "code" = 'PLUS',
  "name" = 'GATS Plus',
  "monthly_price" = 199000,
  "yearly_price" = 1790000,
  "monthly_duration_days" = 30,
  "yearly_duration_days" = 365
WHERE "code" = 'PLUS_MONTHLY';

UPDATE "membership_plans"
SET
  "code" = 'PRO',
  "name" = 'GATS Pro',
  "monthly_price" = NULL,
  "yearly_price" = 3990000,
  "monthly_duration_days" = NULL,
  "yearly_duration_days" = 365
WHERE "code" = 'PRO_YEARLY';

UPDATE "user_memberships"
SET "plan_id" = (SELECT "id" FROM "membership_plans" WHERE "code" = 'PLUS')
WHERE "plan_id" = (SELECT "id" FROM "membership_plans" WHERE "code" = 'PLUS_YEARLY');

UPDATE "coupons"
SET "membership_plan_id" = (SELECT "id" FROM "membership_plans" WHERE "code" = 'PLUS')
WHERE "membership_plan_id" = (SELECT "id" FROM "membership_plans" WHERE "code" = 'PLUS_YEARLY');

DELETE FROM "membership_plans" WHERE "code" = 'PLUS_YEARLY';

ALTER TABLE "user_memberships" ALTER COLUMN "billing_interval" SET NOT NULL;
ALTER TABLE "membership_plans" DROP COLUMN IF EXISTS "billing_interval";
ALTER TABLE "membership_plans" DROP COLUMN IF EXISTS "duration_days";
ALTER TABLE "membership_plans" DROP COLUMN IF EXISTS "price";
