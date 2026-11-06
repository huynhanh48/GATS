DROP INDEX IF EXISTS "idx_categories_parent";
--> statement-breakpoint
ALTER TABLE "categories"
  DROP COLUMN IF EXISTS "parent_id",
  DROP COLUMN IF EXISTS "sort_order",
  DROP COLUMN IF EXISTS "seo_title",
  DROP COLUMN IF EXISTS "seo_description";
--> statement-breakpoint
ALTER TABLE "tags"
  DROP COLUMN IF EXISTS "description";
