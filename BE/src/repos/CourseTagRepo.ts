import { eq, inArray } from 'drizzle-orm';

import db from '@src/db';
import { courseTagsTable } from '@src/db/schema/course-tag';
import { tagsTable } from '@src/db/schema/tag';
import { type TagPublic, parseTagPublic } from '@src/models/Tag.model';

export async function findByCourseIds(
  courseIds: string[],
): Promise<Map<string, TagPublic[]>> {
  const result = new Map<string, TagPublic[]>();
  if (courseIds.length === 0) {
    return result;
  }

  const rows = await db
    .select({
      courseId: courseTagsTable.courseId,
      id: tagsTable.id,
      name: tagsTable.name,
      slug: tagsTable.slug,
      type: tagsTable.type,
    })
    .from(courseTagsTable)
    .innerJoin(tagsTable, eq(courseTagsTable.tagId, tagsTable.id))
    .where(inArray(courseTagsTable.courseId, courseIds))
    .orderBy(tagsTable.name);

  for (const row of rows) {
    const tags = result.get(row.courseId) ?? [];
    tags.push(
      parseTagPublic({
        id: row.id,
        name: row.name,
        slug: row.slug,
        type: row.type,
      }),
    );
    result.set(row.courseId, tags);
  }

  return result;
}

export async function syncForCourse(
  courseId: string,
  tagIds: string[],
): Promise<void> {
  await db.delete(courseTagsTable).where(eq(courseTagsTable.courseId, courseId));

  if (tagIds.length === 0) {
    return;
  }

  await db.insert(courseTagsTable).values(
    tagIds.map((tagId) => ({
      courseId,
      tagId,
    })),
  );
}

export async function findCourseIdsByTagSlug(
  tagSlug: string,
): Promise<string[]> {
  const tagRows = await db
    .select({ id: tagsTable.id })
    .from(tagsTable)
    .where(eq(tagsTable.slug, tagSlug))
    .limit(1);

  const tag = tagRows[0];
  if (!tag) {
    return [];
  }

  const rows = await db
    .select({ courseId: courseTagsTable.courseId })
    .from(courseTagsTable)
    .where(eq(courseTagsTable.tagId, tag.id));

  return rows.map((row) => row.courseId);
}
