import {
  and,
  asc,
  count,
  countDistinct,
  desc,
  eq,
  inArray,
  ne,
  or,
  sql,
  type SQL,
} from 'drizzle-orm';

import db from '@src/db';
import { coursesTable } from '@src/db/schema/course';
import { courseTagsTable } from '@src/db/schema/course-tag';
import { postTagsTable } from '@src/db/schema/post-tag';
import {
  type NewTag,
  tagsTable,
  type TagStatus,
  type TagType,
} from '@src/db/schema/tag';
import {
  parseTag,
  parseTagPublic,
  parseTagWithCounts,
  type Tag,
  type TagPublic,
  type TagWithCounts,
} from '@src/models/Tag.model';

function parseRow(row: unknown): Tag {
  return parseTag(row);
}

function tagTypesForList(type?: TagType): TagType[] {
  if (!type) {
    return ['course', 'post', 'global'];
  }
  if (type === 'course' || type === 'post') {
    return [type, 'global'];
  }
  return [type];
}

export async function findAllWithCounts(options: {
  type?: TagType;
  status?: TagStatus;
  includeGlobalFor?: 'course' | 'post';
}): Promise<TagWithCounts[]> {
  const types = tagTypesForList(
    options.includeGlobalFor
      ? (options.type ?? options.includeGlobalFor)
      : options.type,
  );

  const conditions: SQL[] = [inArray(tagsTable.type, types)];
  if (options.status) {
    conditions.push(eq(tagsTable.status, options.status));
  }
  const rows = await db
    .select({
      id: tagsTable.id,
      name: tagsTable.name,
      slug: tagsTable.slug,
      description: tagsTable.description,
      type: tagsTable.type,
      status: tagsTable.status,
      level: tagsTable.level,
      sortOrder: tagsTable.sortOrder,
      courseCount: countDistinct(courseTagsTable.courseId),
      postCount: countDistinct(postTagsTable.postId),
      beginnerCount: sql<number>`count(DISTINCT ${coursesTable.id}) FILTER (WHERE ${coursesTable.level} = 'beginner')`,
      intermediateCount: sql<number>`count(DISTINCT ${coursesTable.id}) FILTER (WHERE ${coursesTable.level} = 'intermediate')`,
      advancedCount: sql<number>`count(DISTINCT ${coursesTable.id}) FILTER (WHERE ${coursesTable.level} = 'advanced')`,
    })
    .from(tagsTable)
    .leftJoin(courseTagsTable, eq(courseTagsTable.tagId, tagsTable.id))
    .leftJoin(coursesTable, eq(coursesTable.id, courseTagsTable.courseId))
    .leftJoin(postTagsTable, eq(postTagsTable.tagId, tagsTable.id))
    .where(and(...conditions))
    .groupBy(
      tagsTable.id,
      tagsTable.name,
      tagsTable.slug,
      tagsTable.description,
      tagsTable.type,
      tagsTable.status,
      tagsTable.level,
      tagsTable.sortOrder,
    )
    .orderBy(asc(tagsTable.sortOrder), asc(tagsTable.name));

  return rows.map((row) =>
    parseTagWithCounts({
      ...row,
      courseCount: Number(row.courseCount),
      postCount: Number(row.postCount),
      levelCounts: {
        beginner: Number(row.beginnerCount),
        intermediate: Number(row.intermediateCount),
        advanced: Number(row.advancedCount),
        total: Number(row.courseCount),
      },
    }),
  );
}

export async function findById(id: string): Promise<Tag | undefined> {
  const rows = await db
    .select()
    .from(tagsTable)
    .where(eq(tagsTable.id, id))
    .limit(1);
  return rows[0] ? parseRow(rows[0]) : undefined;
}

export async function findByIds(ids: string[]): Promise<Tag[]> {
  if (ids.length === 0) {
    return [];
  }
  const rows = await db
    .select()
    .from(tagsTable)
    .where(inArray(tagsTable.id, ids));
  return rows.map(parseRow);
}

export async function findByTypeAndSlug(
  type: TagType,
  slug: string,
): Promise<Tag | undefined> {
  const rows = await db
    .select()
    .from(tagsTable)
    .where(and(eq(tagsTable.type, type), eq(tagsTable.slug, slug)))
    .limit(1);
  return rows[0] ? parseRow(rows[0]) : undefined;
}

export async function findBySlugsForEntity(
  slugs: string[],
  entity: 'course' | 'post',
): Promise<Tag[]> {
  if (slugs.length === 0) {
    return [];
  }

  const allowedTypes =
    entity === 'course'
      ? (['course', 'global'] as const)
      : (['post', 'global'] as const);

  const rows = await db
    .select()
    .from(tagsTable)
    .where(
      and(
        inArray(tagsTable.slug, slugs),
        or(
          eq(tagsTable.type, allowedTypes[0]),
          eq(tagsTable.type, allowedTypes[1]),
        ),
      ),
    );

  return rows.map(parseRow);
}

export async function slugExists(
  type: TagType,
  slug: string,
  excludeId?: string,
): Promise<boolean> {
  const rows = await db
    .select({ id: tagsTable.id })
    .from(tagsTable)
    .where(
      excludeId
        ? and(
            eq(tagsTable.type, type),
            eq(tagsTable.slug, slug),
            ne(tagsTable.id, excludeId),
          )
        : and(eq(tagsTable.type, type), eq(tagsTable.slug, slug)),
    )
    .limit(1);
  return rows.length > 0;
}

export async function create(data: NewTag): Promise<Tag> {
  const rows = await db.insert(tagsTable).values(data).returning();
  return parseRow(rows[0]);
}

export async function update(
  id: string,
  data: Partial<NewTag>,
): Promise<Tag | undefined> {
  const rows = await db
    .update(tagsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(tagsTable.id, id))
    .returning();
  return rows[0] ? parseRow(rows[0]) : undefined;
}

export async function remove(id: string): Promise<boolean> {
  const rows = await db
    .delete(tagsTable)
    .where(eq(tagsTable.id, id))
    .returning({ id: tagsTable.id });
  return rows.length > 0;
}

export async function countByType(type: TagType): Promise<number> {
  const rows = await db
    .select({ total: count() })
    .from(tagsTable)
    .where(eq(tagsTable.type, type));
  return Number(rows[0]?.total ?? 0);
}

export async function getNextSortOrder(): Promise<number> {
  const rows = await db
    .select({ sortOrder: tagsTable.sortOrder })
    .from(tagsTable)
    .orderBy(desc(tagsTable.sortOrder))
    .limit(1);
  return (rows[0]?.sortOrder ?? -1) + 1;
}

export async function reorder(
  items: { id: string; sortOrder: number }[],
): Promise<void> {
  await db.transaction(async (tx) => {
    for (const item of items) {
      await tx
        .update(tagsTable)
        .set({ sortOrder: item.sortOrder, updatedAt: new Date() })
        .where(eq(tagsTable.id, item.id));
    }
  });
}

export function toTagPublic(tag: Tag): TagPublic {
  return parseTagPublic({
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
    type: tag.type,
    description: tag.description,
  });
}
