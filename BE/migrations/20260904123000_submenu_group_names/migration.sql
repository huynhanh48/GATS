-- 1. Rename the 3 parent groups to 'Nhóm khóa học cơ bản/trung cấp/nâng cao' while preserving beginner/intermediate/advanced in icon
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
-- 2. Remove legacy submenu items pointing directly to courses
DELETE FROM "course_menu_items" WHERE "parent_id" IS NOT NULL AND "course_id" IS NOT NULL;
--> statement-breakpoint
-- 3. Delete submenu items that don't have matching published non-deleted courses in the group's level
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
--> statement-breakpoint
-- 4. Ensure existing matching tags with published courses have entries in their group
INSERT INTO "course_menu_items" ("title", "parent_id", "url", "description", "sort_order", "is_active")
SELECT topic.name,
       topic.group_id,
       '/courses?level=' || topic.level || '&tag=' || topic.slug,
       topic.description,
       (row_number() OVER (PARTITION BY topic.group_id ORDER BY topic.name) - 1)::integer,
       true
FROM (
  SELECT DISTINCT t.name, t.slug, t.description, c.level::text AS level, g.id AS group_id
  FROM "course_tags" ct
  JOIN "courses" c ON c.id = ct.course_id
  JOIN "tags" t ON t.id = ct.tag_id
  JOIN "course_menu_items" g ON g.parent_id IS NULL AND g.icon = c.level::text
  WHERE c.status = 'published'
    AND c.deleted_at IS NULL
    AND t.status = 'active'
    AND t.type IN ('course', 'global')
    AND t.slug <> 'ai'
) topic
WHERE NOT EXISTS (
  SELECT 1 FROM "course_menu_items" existing
  WHERE existing.parent_id = topic.group_id
    AND existing.url = '/courses?level=' || topic.level || '&tag=' || topic.slug
);
