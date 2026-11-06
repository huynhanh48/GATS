ALTER TABLE "courses" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "deleted_by_id" integer;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "deleted_by_id" integer;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_deleted_by_id_users_id_fkey" FOREIGN KEY ("deleted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_deleted_by_id_users_id_fkey" FOREIGN KEY ("deleted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" DROP CONSTRAINT IF EXISTS "courses_slug_key";--> statement-breakpoint
ALTER TABLE "posts" DROP CONSTRAINT IF EXISTS "posts_slug_key";--> statement-breakpoint
CREATE UNIQUE INDEX "idx_courses_slug_active" ON "courses" USING btree ("slug") WHERE "deleted_at" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_posts_slug_active" ON "posts" USING btree ("slug") WHERE "deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "idx_courses_deleted_at" ON "courses" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_posts_deleted_at" ON "posts" USING btree ("deleted_at");
