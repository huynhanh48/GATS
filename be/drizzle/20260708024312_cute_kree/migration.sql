CREATE TABLE "course_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_courses_category" ON "courses" ("category_id");--> statement-breakpoint
CREATE INDEX "idx_courses_level" ON "courses" ("level");--> statement-breakpoint
CREATE INDEX "idx_course_categories_slug" ON "course_categories" ("slug");--> statement-breakpoint
CREATE INDEX "idx_course_categories_name" ON "course_categories" ("name");--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_category_id_course_categories_id_fkey" FOREIGN KEY ("category_id") REFERENCES "course_categories"("id") ON DELETE SET NULL;