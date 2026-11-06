CREATE TABLE "course_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"user_id" integer NOT NULL,
	"rating" integer NOT NULL,
	"content" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "chk_course_reviews_rating" CHECK ("rating" >= 1 AND "rating" <= 5)
);
--> statement-breakpoint
CREATE TABLE "course_learning_outcomes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"content" text NOT NULL,
	"order" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_includes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"key" varchar(100) NOT NULL,
	"label" varchar(255) NOT NULL,
	"value" integer,
	"unit" varchar(50),
	"order" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "course_reviews" ADD CONSTRAINT "course_reviews_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "course_reviews" ADD CONSTRAINT "course_reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "course_learning_outcomes" ADD CONSTRAINT "course_learning_outcomes_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "course_includes" ADD CONSTRAINT "course_includes_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "idx_course_reviews_course_user" ON "course_reviews" ("course_id","user_id");
--> statement-breakpoint
CREATE INDEX "idx_course_reviews_course" ON "course_reviews" ("course_id");
--> statement-breakpoint
CREATE INDEX "idx_course_reviews_user" ON "course_reviews" ("user_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "idx_course_learning_outcomes_course_order" ON "course_learning_outcomes" ("course_id","order");
--> statement-breakpoint
CREATE INDEX "idx_course_learning_outcomes_course" ON "course_learning_outcomes" ("course_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "idx_course_includes_course_order" ON "course_includes" ("course_id","order");
--> statement-breakpoint
CREATE INDEX "idx_course_includes_course" ON "course_includes" ("course_id");
