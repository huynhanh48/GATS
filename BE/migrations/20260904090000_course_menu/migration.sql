CREATE TABLE IF NOT EXISTS "course_menu_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "title" varchar(255) NOT NULL,
  "parent_id" uuid,
  "course_id" uuid,
  "url" varchar(500),
  "badge" varchar(50),
  "icon" varchar(100),
  "description" text,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "course_menu_items_parent_id_course_menu_items_id_fk" FOREIGN KEY ("parent_id") REFERENCES "course_menu_items"("id") ON DELETE restrict,
  CONSTRAINT "course_menu_items_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE set null,
  CONSTRAINT "chk_course_menu_not_self_parent" CHECK ("parent_id" IS NULL OR "parent_id" <> "id"),
  CONSTRAINT "chk_course_menu_group_or_entry" CHECK (("parent_id" IS NULL AND "course_id" IS NULL AND "url" IS NULL) OR ("parent_id" IS NOT NULL AND ("course_id" IS NOT NULL OR "url" IS NOT NULL)))
);
CREATE INDEX IF NOT EXISTS "idx_course_menu_parent_order" ON "course_menu_items" ("parent_id", "sort_order");
CREATE INDEX IF NOT EXISTS "idx_course_menu_active_order" ON "course_menu_items" ("is_active", "sort_order");
CREATE INDEX IF NOT EXISTS "idx_course_menu_course" ON "course_menu_items" ("course_id");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_course_menu_parent_course" ON "course_menu_items" ("parent_id", "course_id") WHERE "course_id" IS NOT NULL;
