UPDATE "course_menu_items"
SET "icon" = CASE
  WHEN lower("title") LIKE '%cơ bản%' THEN 'beginner'
  WHEN lower("title") LIKE '%trung cấp%' THEN 'intermediate'
  WHEN lower("title") LIKE '%nâng cao%' THEN 'advanced'
  ELSE "icon"
END
WHERE "parent_id" IS NULL;
--> statement-breakpoint
DELETE FROM "course_menu_items" WHERE "parent_id" IS NOT NULL AND "course_id" IS NOT NULL;
--> statement-breakpoint
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
) topic
WHERE NOT EXISTS (
  SELECT 1 FROM "course_menu_items" existing
  WHERE existing.parent_id = topic.group_id
    AND existing.url = '/courses?level=' || topic.level || '&tag=' || topic.slug
);
