CREATE TABLE IF NOT EXISTS "category_tags" (
  "category_id" uuid NOT NULL REFERENCES "categories"("id") ON DELETE CASCADE,
  "tag_id" uuid NOT NULL REFERENCES "tags"("id") ON DELETE CASCADE,
  "created_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "category_tags_category_id_tag_id_pk" PRIMARY KEY ("category_id", "tag_id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_category_tags_category" ON "category_tags" ("category_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_category_tags_tag" ON "category_tags" ("tag_id");
