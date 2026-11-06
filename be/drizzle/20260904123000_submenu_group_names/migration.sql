UPDATE "course_menu_items"
SET "title" = 'Nhóm khóa học cơ bản'
WHERE "parent_id" IS NULL AND ("icon" = 'beginner' OR lower("title") LIKE '%cơ bản%');
--> statement-breakpoint
UPDATE "course_menu_items"
SET "title" = 'Nhóm khóa học trung cấp'
WHERE "parent_id" IS NULL AND ("icon" = 'intermediate' OR lower("title") LIKE '%trung cấp%');
--> statement-breakpoint
UPDATE "course_menu_items"
SET "title" = 'Nhóm khóa học nâng cao'
WHERE "parent_id" IS NULL AND ("icon" = 'advanced' OR lower("title") LIKE '%nâng cao%');
--> statement-breakpoint
DELETE FROM "course_menu_items" WHERE "parent_id" IS NOT NULL AND "course_id" IS NOT NULL;
--> statement-breakpoint
DELETE FROM "course_menu_items" child
WHERE child."parent_id" IS NOT NULL
  AND child."url" LIKE '/courses?level=%'
  AND NOT EXISTS (
    SELECT 1
    FROM "course_menu_items" parent
    JOIN "courses" c ON c.level::text = parent.icon AND c.status = 'published' AND c.deleted_at IS NULL
    JOIN "course_tags" ct ON ct.course_id = c.id
    JOIN "tags" t ON t.id = ct.tag_id AND t.status = 'active'
    WHERE parent.id = child.parent_id
      AND child.url = '/courses?level=' || parent.icon || '&tag=' || t.slug
  );
