CREATE TYPE "public"."media_kind" AS ENUM('thumbnail', 'file');--> statement-breakpoint
CREATE TABLE "media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" "media_kind" NOT NULL,
	"original_name" varchar(255) NOT NULL,
	"storage_key" varchar(512) NOT NULL,
	"mime_type" varchar(128) NOT NULL,
	"size" integer NOT NULL,
	"url" varchar(1024) NOT NULL,
	"uploaded_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_uploaded_by_users_id_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_media_storage_key" ON "media" USING btree ("storage_key");--> statement-breakpoint
CREATE INDEX "idx_media_kind" ON "media" USING btree ("kind");--> statement-breakpoint
CREATE INDEX "idx_media_created_at" ON "media" USING btree ("created_at");
