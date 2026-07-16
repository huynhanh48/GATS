CREATE TABLE "post_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_tag_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"post_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "comments" DROP CONSTRAINT "comments_parent_id_comments_id_fkey";--> statement-breakpoint
CREATE INDEX "idx_post_tags_slug" ON "post_tags" ("slug");--> statement-breakpoint
CREATE INDEX "idx_post_tags_name" ON "post_tags" ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_post_tag_assignments_unique" ON "post_tag_assignments" ("post_id","tag_id");--> statement-breakpoint
CREATE INDEX "idx_post_tag_assignments_post" ON "post_tag_assignments" ("post_id");--> statement-breakpoint
CREATE INDEX "idx_post_tag_assignments_tag" ON "post_tag_assignments" ("tag_id");--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_id_comments_id_fk" FOREIGN KEY ("parent_id") REFERENCES "comments"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "post_tag_assignments" ADD CONSTRAINT "post_tag_assignments_post_id_posts_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "post_tag_assignments" ADD CONSTRAINT "post_tag_assignments_tag_id_post_tags_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "post_tags"("id") ON DELETE CASCADE;