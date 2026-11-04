-- 1. Migrate level-based groups to category-based groups
UPDATE "course_menu_items"
SET "icon" = 'ai-office', "title" = 'AI cho công sở'
WHERE "parent_id" IS NULL AND "icon" = 'beginner';
--> statement-breakpoint
UPDATE "course_menu_items"
SET "icon" = 'automation', "title" = 'Automation'
WHERE "parent_id" IS NULL AND "icon" = 'intermediate';
--> statement-breakpoint
UPDATE "course_menu_items"
SET "icon" = 'programming', "title" = 'Lập trình'
WHERE "parent_id" IS NULL AND "icon" = 'advanced';
--> statement-breakpoint
-- 2. Migrate existing child item URLs from level to category
UPDATE "course_menu_items"
SET "url" = replace("url", 'level=beginner', 'category=ai-office')
WHERE "url" LIKE '%level=beginner%';
--> statement-breakpoint
UPDATE "course_menu_items"
SET "url" = replace("url", 'level=intermediate', 'category=automation')
WHERE "url" LIKE '%level=intermediate%';
--> statement-breakpoint
UPDATE "course_menu_items"
SET "url" = replace("url", 'level=advanced', 'category=programming')
WHERE "url" LIKE '%level=advanced%';
