import { and, count, eq, inArray, isNull, ne, type SQL } from 'drizzle-orm';

import db from '@src/db';
import {
  categoriesTable,
  type CategoryStatus,
  type CategoryType,
  type NewCategory,
} from '@src/db/schema/category';
import { coursesTable } from '@src/db/schema/course';
import { postsTable } from '@src/db/schema/post';
import {
  type Category,
  type CategoryPublic,
  type CategoryWithCounts,
  parseCategory,
  parseCategoryPublic,
  parseCategoryWithCounts,
} from '@src/models/Category.model';

function parseRow(row: unknown): Category {
  return parseCategory(row);
}

export async function findAllWithCounts(options: {
  type: CategoryType;
  status?: CategoryStatus;
}): Promise<CategoryWithCounts[]> {
  const conditions: SQL[] = [eq(categoriesTable.type, options.type)];
  if (options.status) {
    conditions.push(eq(categoriesTable.status, options.status));
  }

  const rows = await db
    .select({
      id: categoriesTable.id,
      name: categoriesTable.name,
      slug: categoriesTable.slug,
      type: categoriesTable.type,
      status: categoriesTable.status,
      description: categoriesTable.description,
      thumbnail: categoriesTable.thumbnail,
      icon: categoriesTable.icon,
      parentId: categoriesTable.parentId,
      sortOrder: categoriesTable.sortOrder,
      seoTitle: categoriesTable.seoTitle,
      seoDescription: categoriesTable.seoDescription,
      courseCount: count(coursesTable.id),
      postCount: count(postsTable.id),
    })
    .from(categoriesTable)
    .leftJoin(
      coursesTable,
      and(
        eq(coursesTable.categoryId, categoriesTable.id),
        isNull(coursesTable.deletedAt),
      ),
    )
    .leftJoin(
      postsTable,
      and(
        eq(postsTable.categoryId, categoriesTable.id),
        isNull(postsTable.deletedAt),
      ),
    )
    .where(and(...conditions))
    .groupBy(
      categoriesTable.id,
      categoriesTable.name,
      categoriesTable.slug,
      categoriesTable.type,
      categoriesTable.status,
      categoriesTable.description,
      categoriesTable.thumbnail,
      categoriesTable.icon,
      categoriesTable.parentId,
      categoriesTable.sortOrder,
      categoriesTable.seoTitle,
      categoriesTable.seoDescription,
    )
    .orderBy(categoriesTable.sortOrder, categoriesTable.name);

  return rows.map((row) =>
    parseCategoryWithCounts({
      ...row,
      courseCount: Number(row.courseCount),
      postCount: Number(row.postCount),
    }),
  );
}

export async function findById(id: string): Promise<Category | undefined> {
  const rows = await db
    .select()
    .from(categoriesTable)
    .where(eq(categoriesTable.id, id))
    .limit(1);
  return rows[0] ? parseRow(rows[0]) : undefined;
}

export async function findByTypeAndSlug(
  type: CategoryType,
  slug: string,
): Promise<Category | undefined> {
  const rows = await db
    .select()
    .from(categoriesTable)
    .where(and(eq(categoriesTable.type, type), eq(categoriesTable.slug, slug)))
    .limit(1);
  return rows[0] ? parseRow(rows[0]) : undefined;
}

export async function slugExists(
  type: CategoryType,
  slug: string,
  excludeId?: string,
): Promise<boolean> {
  const rows = await db
    .select({ id: categoriesTable.id })
    .from(categoriesTable)
    .where(
      excludeId
        ? and(
            eq(categoriesTable.type, type),
            eq(categoriesTable.slug, slug),
            ne(categoriesTable.id, excludeId),
          )
        : and(eq(categoriesTable.type, type), eq(categoriesTable.slug, slug)),
    )
    .limit(1);
  return rows.length > 0;
}

export async function findByCourseIds(
  courseIds: string[],
): Promise<Map<string, CategoryPublic | null>> {
  const result = new Map<string, CategoryPublic | null>();
  if (courseIds.length === 0) {
    return result;
  }

  const rows = await db
    .select({
      courseId: coursesTable.id,
      id: categoriesTable.id,
      name: categoriesTable.name,
      slug: categoriesTable.slug,
      type: categoriesTable.type,
    })
    .from(coursesTable)
    .leftJoin(categoriesTable, eq(coursesTable.categoryId, categoriesTable.id))
    .where(inArray(coursesTable.id, courseIds));

  for (const row of rows) {
    result.set(
      row.courseId,
      row.id
        ? parseCategoryPublic({
            id: row.id,
            name: row.name!,
            slug: row.slug!,
            type: row.type!,
          })
        : null,
    );
  }

  return result;
}

export async function findByPostIds(
  postIds: string[],
): Promise<Map<string, CategoryPublic | null>> {
  const result = new Map<string, CategoryPublic | null>();
  if (postIds.length === 0) {
    return result;
  }

  const rows = await db
    .select({
      postId: postsTable.id,
      id: categoriesTable.id,
      name: categoriesTable.name,
      slug: categoriesTable.slug,
      type: categoriesTable.type,
    })
    .from(postsTable)
    .leftJoin(categoriesTable, eq(postsTable.categoryId, categoriesTable.id))
    .where(inArray(postsTable.id, postIds));

  for (const row of rows) {
    result.set(
      row.postId,
      row.id
        ? parseCategoryPublic({
            id: row.id,
            name: row.name!,
            slug: row.slug!,
            type: row.type!,
          })
        : null,
    );
  }

  return result;
}

export async function create(data: NewCategory): Promise<Category> {
  const rows = await db.insert(categoriesTable).values(data).returning();
  return parseRow(rows[0]);
}

export async function update(
  id: string,
  data: Partial<NewCategory>,
): Promise<Category | undefined> {
  const rows = await db
    .update(categoriesTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(categoriesTable.id, id))
    .returning();
  return rows[0] ? parseRow(rows[0]) : undefined;
}

export async function remove(id: string): Promise<boolean> {
  const rows = await db
    .delete(categoriesTable)
    .where(eq(categoriesTable.id, id))
    .returning({ id: categoriesTable.id });
  return rows.length > 0;
}

export async function countByType(type: CategoryType): Promise<number> {
  const rows = await db
    .select({ total: count() })
    .from(categoriesTable)
    .where(eq(categoriesTable.type, type));
  return Number(rows[0]?.total ?? 0);
}
