CREATE TYPE "comment_status" AS ENUM('visible', 'hidden', 'deleted');--> statement-breakpoint
CREATE TYPE "post_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "post_visibility" AS ENUM('public', 'private', 'members_only');--> statement-breakpoint
CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"post_id" uuid NOT NULL,
	"user_id" integer NOT NULL,
	"parent_id" uuid,
	"content" text NOT NULL,
	"status" "comment_status" DEFAULT 'visible'::"comment_status" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comment_likes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"comment_id" uuid NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"author_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL UNIQUE,
	"excerpt" text,
	"content" text NOT NULL,
	"thumbnail" varchar(512),
	"status" "post_status" DEFAULT 'draft'::"post_status" NOT NULL,
	"visibility" "post_visibility" DEFAULT 'public'::"post_visibility" NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_likes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"post_id" uuid NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_comments_post" ON "comments" ("post_id");--> statement-breakpoint
CREATE INDEX "idx_comments_user" ON "comments" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_comments_parent" ON "comments" ("parent_id");--> statement-breakpoint
CREATE INDEX "idx_comments_status" ON "comments" ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_comment_likes_unique" ON "comment_likes" ("comment_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_comment_likes_comment" ON "comment_likes" ("comment_id");--> statement-breakpoint
CREATE INDEX "idx_comment_likes_user" ON "comment_likes" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_posts_author" ON "posts" ("author_id");--> statement-breakpoint
CREATE INDEX "idx_posts_status" ON "posts" ("status");--> statement-breakpoint
CREATE INDEX "idx_posts_visibility" ON "posts" ("visibility");--> statement-breakpoint
CREATE INDEX "idx_posts_published_at" ON "posts" ("published_at");--> statement-breakpoint
CREATE INDEX "idx_posts_slug" ON "posts" ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_post_likes_unique" ON "post_likes" ("post_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_post_likes_post" ON "post_likes" ("post_id");--> statement-breakpoint
CREATE INDEX "idx_post_likes_user" ON "post_likes" ("user_id");--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_posts_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_id_comments_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "comments"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "comment_likes" ADD CONSTRAINT "comment_likes_comment_id_comments_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "comment_likes" ADD CONSTRAINT "comment_likes_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_users_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_post_id_posts_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;