ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "sort_order" integer DEFAULT 0 NOT NULL;
CREATE INDEX IF NOT EXISTS "idx_categories_sort_order" ON "categories" ("sort_order");
--> statement-breakpoint
ALTER TABLE "tags" ADD COLUMN IF NOT EXISTS "sort_order" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tags_sort_order" ON "tags" ("sort_order");
