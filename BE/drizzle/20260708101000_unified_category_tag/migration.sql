CREATE TYPE "public"."category_type" AS ENUM('course', 'post');--> statement-breakpoint
CREATE TYPE "public"."category_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."tag_type" AS ENUM('course', 'post', 'global');--> statement-breakpoint
CREATE TYPE "public"."tag_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"thumbnail" varchar(512),
	"icon" varchar(100),
	"type" "category_type" NOT NULL,
	"status" "category_status" DEFAULT 'active' NOT NULL,
	"parent_id" uuid,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"seo_title" varchar(255),
	"seo_description" varchar(512),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
INSERT INTO "categories" ("id", "name", "slug", "type", "status", "sort_order", "created_at", "updated_at")
SELECT "id", "name", "slug", 'course', 'active', 0, "created_at", "updated_at"
FROM "course_categories";--> statement-breakpoint
ALTER TABLE "courses" DROP CONSTRAINT IF EXISTS "courses_category_id_course_categories_id_fkey";--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"type" "tag_type" NOT NULL,
	"status" "tag_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
INSERT INTO "tags" ("id", "name", "slug", "type", "status", "created_at", "updated_at")
SELECT "id", "name", "slug", 'post', 'active', "created_at", "updated_at"
FROM "post_tags";--> statement-breakpoint
CREATE TABLE "post_tags_junction" (
	"post_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "post_tags_junction_post_id_tag_id_pk" PRIMARY KEY("post_id","tag_id")
);--> statement-breakpoint
INSERT INTO "post_tags_junction" ("post_id", "tag_id", "created_at")
SELECT "post_id", "tag_id", "created_at"
FROM "post_tag_assignments";--> statement-breakpoint
DROP TABLE "post_tag_assignments";--> statement-breakpoint
DROP TABLE "post_tags";--> statement-breakpoint
ALTER TABLE "post_tags_junction" RENAME TO "post_tags";--> statement-breakpoint
CREATE TABLE "course_tags" (
	"course_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "course_tags_course_id_tag_id_pk" PRIMARY KEY("course_id","tag_id")
);--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "category_id" uuid;--> statement-breakpoint
DROP TABLE "course_categories";--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_tags" ADD CONSTRAINT "course_tags_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_tags" ADD CONSTRAINT "course_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_categories_type_slug" ON "categories" USING btree ("type","slug");--> statement-breakpoint
CREATE INDEX "idx_categories_type" ON "categories" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_categories_status" ON "categories" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_categories_parent" ON "categories" USING btree ("parent_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_tags_type_slug" ON "tags" USING btree ("type","slug");--> statement-breakpoint
CREATE INDEX "idx_tags_type" ON "tags" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_tags_status" ON "tags" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_post_tags_post" ON "post_tags" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "idx_post_tags_tag" ON "post_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "idx_course_tags_course" ON "course_tags" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "idx_course_tags_tag" ON "course_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "idx_posts_category" ON "posts" USING btree ("category_id");
