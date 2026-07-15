import { eq, inArray } from 'drizzle-orm';

import db from '@src/db';
import { postTagsTable } from '@src/db/schema/post-tag';
import { tagsTable } from '@src/db/schema/tag';
import { type TagPublic, parseTagPublic } from '@src/models/Tag.model';

export async function findByPostIds(
  postIds: string[],
): Promise<Map<string, TagPublic[]>> {
  const result = new Map<string, TagPublic[]>();
  if (postIds.length === 0) {
    return result;
  }

  const rows = await db
    .select({
      postId: postTagsTable.postId,
      id: tagsTable.id,
      name: tagsTable.name,
      slug: tagsTable.slug,
      type: tagsTable.type,
    })
    .from(postTagsTable)
    .innerJoin(tagsTable, eq(postTagsTable.tagId, tagsTable.id))
    .where(inArray(postTagsTable.postId, postIds))
    .orderBy(tagsTable.name);

  for (const row of rows) {
    const tags = result.get(row.postId) ?? [];
    tags.push(
      parseTagPublic({
        id: row.id,
        name: row.name,
        slug: row.slug,
        type: row.type,
      }),
    );
    result.set(row.postId, tags);
  }

  return result;
}

export async function syncForPost(postId: string, tagIds: string[]): Promise<void> {
  await db.delete(postTagsTable).where(eq(postTagsTable.postId, postId));

  if (tagIds.length === 0) {
    return;
  }

  await db.insert(postTagsTable).values(
    tagIds.map((tagId) => ({
      postId,
      tagId,
    })),
  );
}

export async function findPostIdsByTagSlug(tagSlug: string): Promise<string[]> {
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
    .select({ postId: postTagsTable.postId })
    .from(postTagsTable)
    .where(eq(postTagsTable.tagId, tag.id));

  return rows.map((row) => row.postId);
}

export async function findTagIdBySlug(tagSlug: string): Promise<string | undefined> {
  const rows = await db
    .select({ id: tagsTable.id })
    .from(tagsTable)
    .where(eq(tagsTable.slug, tagSlug))
    .limit(1);
  return rows[0]?.id;
}
