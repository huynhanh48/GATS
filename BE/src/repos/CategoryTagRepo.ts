import { and, asc, eq, inArray, isNull, sql } from 'drizzle-orm';

import db from '@src/db';
import { categoryTagsTable } from '@src/db/schema/category-tag';
import { tagsTable } from '@src/db/schema/tag';
import { coursesTable } from '@src/db/schema/course';
import { courseTagsTable } from '@src/db/schema/course-tag';
import type { Level } from '@src/models/Level.model';

let tableEnsured = false;
async function ensureTable(): Promise<void> {
  if (tableEnsured) return;
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "category_tags" (
        "category_id" uuid NOT NULL REFERENCES "categories"("id") ON DELETE CASCADE,
        "tag_id" uuid NOT NULL REFERENCES "tags"("id") ON DELETE CASCADE,
        "created_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "category_tags_category_id_tag_id_pk" PRIMARY KEY ("category_id", "tag_id")
      );
      CREATE INDEX IF NOT EXISTS "idx_category_tags_category" ON "category_tags" ("category_id");
      CREATE INDEX IF NOT EXISTS "idx_category_tags_tag" ON "category_tags" ("tag_id");
    `);
    tableEnsured = true;
  } catch {
    // Ignore if already created or permission
  }
}

export async function findTagIdsByCategoryIds(
  categoryIds: string[],
): Promise<Map<string, string[]>> {
  const result = new Map<string, string[]>();
  if (categoryIds.length === 0) return result;

  await ensureTable();

  try {
    const rows = await db
      .select({
        categoryId: categoryTagsTable.categoryId,
        tagId: categoryTagsTable.tagId,
      })
      .from(categoryTagsTable)
      .where(inArray(categoryTagsTable.categoryId, categoryIds));

    for (const row of rows) {
      const tagIds = result.get(row.categoryId) ?? [];
      tagIds.push(row.tagId);
      result.set(row.categoryId, tagIds);
    }
  } catch {
    // Return empty map on error
  }
  return result;
}

export type CategoryTagSummary = {
  id: string;
  name: string;
  slug: string;
  level?: string | null;
  description?: string | null;
};

export async function findTagsByCategoryIds(
  categoryIds: string[],
): Promise<Map<string, CategoryTagSummary[]>> {
  const result = new Map<string, CategoryTagSummary[]>();
  if (categoryIds.length === 0) return result;

  await ensureTable();

  try {
    const rows = await db
      .select({
        categoryId: categoryTagsTable.categoryId,
        tagId: tagsTable.id,
        tagName: tagsTable.name,
        tagSlug: tagsTable.slug,
        tagLevel: tagsTable.level,
        tagDescription: tagsTable.description,
      })
      .from(categoryTagsTable)
      .innerJoin(tagsTable, eq(categoryTagsTable.tagId, tagsTable.id))
      .where(
        and(
          inArray(categoryTagsTable.categoryId, categoryIds),
          eq(tagsTable.status, 'active'),
        ),
      )
      .orderBy(asc(tagsTable.sortOrder), asc(tagsTable.name));

    for (const row of rows) {
      const list = result.get(row.categoryId) ?? [];
      list.push({
        id: row.tagId,
        name: row.tagName,
        slug: row.tagSlug,
        level: row.tagLevel,
        description: row.tagDescription,
      });
      result.set(row.categoryId, list);
    }
  } catch {
    // Return empty map on error
  }
  return result;
}

type LevelCounts = Record<Level['code'], number>;
type CategoryCourseLevelStats = {
  levels: LevelCounts;
  tags: Map<string, LevelCounts>;
};

function emptyLevelCounts(): LevelCounts {
  return { beginner: 0, intermediate: 0, advanced: 0 };
}

export async function findCourseLevelCountsByCategoryIds(
  categoryIds: string[],
): Promise<Map<string, CategoryCourseLevelStats>> {
  const result = new Map<string, CategoryCourseLevelStats>();
  if (categoryIds.length === 0) return result;

  const [rows, categoryRows] = await Promise.all([
    db
      .select({
        categoryId: categoryTagsTable.categoryId,
        tagId: categoryTagsTable.tagId,
        level: coursesTable.level,
        courseCount: sql<number>`count(DISTINCT ${coursesTable.id})`,
      })
      .from(categoryTagsTable)
      .leftJoin(courseTagsTable, eq(courseTagsTable.tagId, categoryTagsTable.tagId))
      .leftJoin(
        coursesTable,
        and(
          eq(coursesTable.id, courseTagsTable.courseId),
          eq(coursesTable.categoryId, categoryTagsTable.categoryId),
          isNull(coursesTable.deletedAt),
        ),
      )
      .where(inArray(categoryTagsTable.categoryId, categoryIds))
      .groupBy(categoryTagsTable.categoryId, categoryTagsTable.tagId, coursesTable.level),
    db
      .select({
        categoryId: coursesTable.categoryId,
        level: coursesTable.level,
        courseCount: sql<number>`count(DISTINCT ${coursesTable.id})`,
      })
      .from(coursesTable)
      .where(
        and(
          inArray(coursesTable.categoryId, categoryIds),
          isNull(coursesTable.deletedAt),
        ),
      )
      .groupBy(coursesTable.categoryId, coursesTable.level),
  ]);

  for (const row of rows) {
    const stats = result.get(row.categoryId) ?? {
      levels: emptyLevelCounts(),
      tags: new Map<string, LevelCounts>(),
    };
    const tagCounts = stats.tags.get(row.tagId) ?? emptyLevelCounts();
    if (row.level) {
      const count = Number(row.courseCount);
      tagCounts[row.level] = count;
    }
    stats.tags.set(row.tagId, tagCounts);
    result.set(row.categoryId, stats);
  }
  for (const row of categoryRows) {
    if (!row.categoryId) continue;
    const stats = result.get(row.categoryId) ?? {
      levels: emptyLevelCounts(),
      tags: new Map<string, LevelCounts>(),
    };
    stats.levels[row.level] = Number(row.courseCount);
    result.set(row.categoryId, stats);
  }
  return result;
}

export async function syncForCategory(
  categoryId: string,
  tagIds: string[],
): Promise<void> {
  await ensureTable();

  await db
    .delete(categoryTagsTable)
    .where(eq(categoryTagsTable.categoryId, categoryId));

  if (tagIds.length === 0) return;

  await db
    .insert(categoryTagsTable)
    .values([...new Set(tagIds)].map((tagId) => ({ categoryId, tagId })));
}
