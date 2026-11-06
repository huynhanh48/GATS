ALTER TABLE "tags" ADD COLUMN IF NOT EXISTS "description" text;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "levels" (
  "code" varchar(50) PRIMARY KEY,
  "name" varchar(100) NOT NULL,
  "description" text,
  "sort_order" integer NOT NULL DEFAULT 0,
  "status" varchar(20) NOT NULL DEFAULT 'active',
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "levels_code_check" CHECK ("code" IN ('beginner', 'intermediate', 'advanced')),
  CONSTRAINT "levels_status_check" CHECK ("status" IN ('active', 'inactive'))
);
--> statement-breakpoint
INSERT INTO "levels" ("code", "name", "description", "sort_order") VALUES
  ('beginner', 'Cơ bản', NULL, 0),
  ('intermediate', 'Trung cấp', NULL, 1),
  ('advanced', 'Nâng cao', NULL, 2)
ON CONFLICT ("code") DO NOTHING;
