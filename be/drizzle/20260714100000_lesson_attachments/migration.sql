CREATE TABLE "lesson_attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lesson_id" uuid NOT NULL,
	"media_id" uuid NOT NULL,
	"title" varchar(255),
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "lesson_attachments" ADD CONSTRAINT "lesson_attachments_lesson_id_lessons_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_attachments" ADD CONSTRAINT "lesson_attachments_media_id_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_lesson_attachments_unique" ON "lesson_attachments" USING btree ("lesson_id","media_id");--> statement-breakpoint
CREATE INDEX "idx_lesson_attachments_lesson" ON "lesson_attachments" USING btree ("lesson_id");--> statement-breakpoint
CREATE INDEX "idx_lesson_attachments_media" ON "lesson_attachments" USING btree ("media_id");
