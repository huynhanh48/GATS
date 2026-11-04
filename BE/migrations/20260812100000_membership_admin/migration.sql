DO $$ BEGIN
  CREATE TYPE "membership_billing_interval" AS ENUM ('lifetime', 'monthly', 'yearly');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "membership_status" AS ENUM ('active', 'cancelled', 'expired', 'revoked');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "membership_source" AS ENUM ('purchase', 'admin_granted', 'promotion', 'migration', 'compensation');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "membership_plans" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "code" varchar(64) NOT NULL,
  "name" varchar(120) NOT NULL,
  "description" text,
  "billing_interval" "membership_billing_interval" NOT NULL,
  "duration_days" integer,
  "price" integer DEFAULT 0 NOT NULL,
  "ai_daily_limit" integer DEFAULT 5 NOT NULL,
  "mentor_reviews_per_month" integer DEFAULT 0 NOT NULL,
  "features" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "display_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "idx_membership_plans_code" ON "membership_plans" ("code");
CREATE INDEX IF NOT EXISTS "idx_membership_plans_active_order" ON "membership_plans" ("is_active", "display_order");

CREATE TABLE IF NOT EXISTS "user_memberships" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "plan_id" uuid NOT NULL REFERENCES "membership_plans"("id"),
  "status" "membership_status" DEFAULT 'active' NOT NULL,
  "source" "membership_source" DEFAULT 'admin_granted' NOT NULL,
  "started_at" timestamp with time zone DEFAULT now() NOT NULL,
  "current_period_start" timestamp with time zone DEFAULT now() NOT NULL,
  "current_period_end" timestamp with time zone,
  "cancel_at_period_end" boolean DEFAULT false NOT NULL,
  "price_snapshot" integer DEFAULT 0 NOT NULL,
  "granted_by" integer REFERENCES "users"("id") ON DELETE set null,
  "grant_reason" text,
  "revoked_by" integer REFERENCES "users"("id") ON DELETE set null,
  "revoked_at" timestamp with time zone,
  "revoke_reason" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_user_memberships_user" ON "user_memberships" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_user_memberships_plan" ON "user_memberships" ("plan_id");
CREATE INDEX IF NOT EXISTS "idx_user_memberships_status_end" ON "user_memberships" ("status", "current_period_end");

INSERT INTO "membership_plans"
  ("code", "name", "description", "billing_interval", "duration_days", "price", "ai_daily_limit", "mentor_reviews_per_month", "features", "display_order")
VALUES
  ('BASIC', 'GATS Basic', 'Gói miễn phí mặc định', 'lifetime', NULL, 0, 5, 0, '["Bài học mở", "5 câu hỏi AI mỗi ngày"]', 10),
  ('PLUS_MONTHLY', 'GATS Plus tháng', 'Học không giới hạn theo tháng', 'monthly', 30, 199000, -1, 0, '["Toàn bộ khóa học tiêu chuẩn", "AI Coach không giới hạn", "Tải tài liệu"]', 20),
  ('PLUS_YEARLY', 'GATS Plus năm', 'Học không giới hạn theo năm', 'yearly', 365, 1790000, -1, 0, '["Toàn bộ khóa học tiêu chuẩn", "AI Coach không giới hạn", "Tải tài liệu"]', 30),
  ('PRO_YEARLY', 'GATS Pro năm', 'Đồng hành chuyên sâu cùng mentor', 'yearly', 365, 3990000, -1, 2, '["Toàn bộ quyền lợi Plus", "Khóa chuyên sâu", "2 buổi mentor mỗi tháng"]', 40)
ON CONFLICT ("code") DO NOTHING;

DO $$ BEGIN
  CREATE TYPE "coupon_scope" AS ENUM ('all', 'course', 'membership');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "coupons" ADD COLUMN IF NOT EXISTS "scope" "coupon_scope" DEFAULT 'all' NOT NULL;
ALTER TABLE "coupons" ADD COLUMN IF NOT EXISTS "membership_plan_id" uuid;
DO $$ BEGIN
  ALTER TABLE "coupons"
    ADD CONSTRAINT "coupons_membership_plan_id_membership_plans_id_fk"
    FOREIGN KEY ("membership_plan_id") REFERENCES "membership_plans"("id") ON DELETE set null;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
