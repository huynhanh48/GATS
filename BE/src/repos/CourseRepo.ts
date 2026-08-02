import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  ne,
  or,
  sql,
  type SQL,
} from 'drizzle-orm';

import db from '@src/db';
import {
  coursesTable,
  type CourseStatus,
  type NewCourse,
} from '@src/db/schema/course';
import {
  type SoftDeleteVisibility,
  softDeleteVisibilityCondition,
} from '@src/db/soft-delete';
import { type CourseRecord, parseCourseRecord } from '@src/models/Course.model';

function parseRow(row: unknown): CourseRecord {
  return parseCourseRecord(row);
}

/** Escape `%` / `_` so user input is treated as literal text in ILIKE. */
function escapeLikePattern(raw: string): string {
  return raw.replace(/[\\%_]/g, '\\$&');
}

function withSoftDelete(
  conditions: SQL[],
  deleted: SoftDeleteVisibility = 'without',
): void {
  const condition = softDeleteVisibilityCondition(
    coursesTable.deletedAt,
    deleted,
  );
  if (condition) {
    conditions.push(condition);
  }
}

export async function findById(
  id: string,
  options: { deleted?: SoftDeleteVisibility } = {},
): Promise<CourseRecord | undefined> {
  const conditions: SQL[] = [eq(coursesTable.id, id)];
  withSoftDelete(conditions, options.deleted);

  const rows = await db
    .select()
    .from(coursesTable)
    .where(and(...conditions))
    .limit(1);
  return rows[0] ? parseRow(rows[0]) : undefined;
}

/** Batch lookup — avoids N+1 in enrollment listMine. */
export async function findByIds(
  ids: string[],
  options: { deleted?: SoftDeleteVisibility } = {},
): Promise<CourseRecord[]> {
  if (ids.length === 0) return [];
  const unique = [...new Set(ids)];
  const conditions: SQL[] = [inArray(coursesTable.id, unique)];
  withSoftDelete(conditions, options.deleted);

  const rows = await db
    .select()
    .from(coursesTable)
    .where(and(...conditions));
  return rows.map(parseRow);
}

export async function findBySlug(
  slug: string,
  options: { deleted?: SoftDeleteVisibility } = {},
): Promise<CourseRecord | undefined> {
  const conditions: SQL[] = [eq(coursesTable.slug, slug)];
  withSoftDelete(conditions, options.deleted);

  const rows = await db
    .select()
    .from(coursesTable)
    .where(and(...conditions))
    .limit(1);
  return rows[0] ? parseRow(rows[0]) : undefined;
}

export async function listByInstructorId(
  instructorId: number,
): Promise<CourseRecord[]> {
  const rows = await db
    .select()
    .from(coursesTable)
    .where(
      and(
        eq(coursesTable.instructorId, instructorId),
        softDeleteVisibilityCondition(coursesTable.deletedAt)!,
      ),
    )
    .orderBy(desc(coursesTable.updatedAt));
  return rows.map(parseRow);
}

export async function slugExists(
  slug: string,
  excludeId?: string,
): Promise<boolean> {
  const conditions: SQL[] = [eq(coursesTable.slug, slug)];
  withSoftDelete(conditions);
  if (excludeId) {
    conditions.push(ne(coursesTable.id, excludeId));
  }

  const rows = await db
    .select({ id: coursesTable.id })
    .from(coursesTable)
    .where(and(...conditions))
    .limit(1);
  return rows.length > 0;
}

export type CourseListSort = 'newest' | 'price_asc' | 'price_desc';

export async function findMany(options: {
  status?: CourseStatus;
  level?: string;
  categoryId?: string;
  instructorId?: number;
  courseIds?: string[];
  keyword?: string;
  sort?: CourseListSort;
  skip: number;
  take: number;
  deleted?: SoftDeleteVisibility;
}): Promise<{ data: CourseRecord[]; total: number }> {
  const conditions: SQL[] = [];
  withSoftDelete(conditions, options.deleted);

  if (options.status) {
    conditions.push(eq(coursesTable.status, options.status));
  }
  if (options.level) {
    conditions.push(
      eq(coursesTable.level, options.level as CourseRecord['level']),
    );
  }
  if (options.categoryId) {
    conditions.push(eq(coursesTable.categoryId, options.categoryId));
  }
  if (options.instructorId !== undefined) {
    conditions.push(eq(coursesTable.instructorId, options.instructorId));
  }
  if (options.courseIds) {
    conditions.push(inArray(coursesTable.id, options.courseIds));
  }
  if (options.keyword) {
    const pattern = `%${escapeLikePattern(options.keyword.trim())}%`;
    conditions.push(
      or(
        ilike(coursesTable.title, pattern),
        ilike(coursesTable.slug, pattern),
        ilike(coursesTable.description, pattern),
      )!,
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Effective storefront price: sale when set, else list price.
  const effectivePrice = sql`COALESCE(${coursesTable.salePrice}, ${coursesTable.price})`;
  const orderByClause =
    options.sort === 'price_asc'
      ? [asc(effectivePrice), desc(coursesTable.createdAt)]
      : options.sort === 'price_desc'
        ? [desc(effectivePrice), desc(coursesTable.createdAt)]
        : [desc(coursesTable.createdAt)];

  const [rows, totalRows] = await Promise.all([
    db
      .select()
      .from(coursesTable)
      .where(whereClause)
      .orderBy(...orderByClause)
      .limit(options.take)
      .offset(options.skip),
    db.select({ total: count() }).from(coursesTable).where(whereClause),
  ]);

  return {
    data: rows.map(parseRow),
    total: Number(totalRows[0]?.total ?? 0),
  };
}

export async function create(data: NewCourse): Promise<CourseRecord> {
  const rows = await db.insert(coursesTable).values(data).returning();
  return parseRow(rows[0]);
}

export async function update(
  id: string,
  data: Partial<NewCourse>,
): Promise<CourseRecord | undefined> {
  const rows = await db
    .update(coursesTable)
    .set({ ...data, updatedAt: new Date() })
    .where(
      and(
        eq(coursesTable.id, id),
        softDeleteVisibilityCondition(coursesTable.deletedAt)!,
      ),
    )
    .returning();
  return rows[0] ? parseRow(rows[0]) : undefined;
}

/** Soft-delete by default (sets deletedAt). Pass mode: 'hard' for physical delete. */
export async function remove(
  id: string,
  options: { deletedById?: number; mode?: 'soft' | 'hard' } = {},
): Promise<boolean> {
  if (options.mode === 'hard') {
    const rows = await db
      .delete(coursesTable)
      .where(eq(coursesTable.id, id))
      .returning({ id: coursesTable.id });
    return rows.length > 0;
  }

  const rows = await db
    .update(coursesTable)
    .set({
      deletedAt: new Date(),
      deletedById: options.deletedById ?? null,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(coursesTable.id, id),
        softDeleteVisibilityCondition(coursesTable.deletedAt)!,
      ),
    )
    .returning({ id: coursesTable.id });
  return rows.length > 0;
}

export async function restore(id: string): Promise<CourseRecord | undefined> {
  const rows = await db
    .update(coursesTable)
    .set({
      deletedAt: null,
      deletedById: null,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(coursesTable.id, id),
        softDeleteVisibilityCondition(coursesTable.deletedAt, 'only')!,
      ),
    )
    .returning();
  return rows[0] ? parseRow(rows[0]) : undefined;
}

export async function countAll(
  options: { deleted?: SoftDeleteVisibility } = {},
): Promise<number> {
  const conditions: SQL[] = [];
  withSoftDelete(conditions, options.deleted);
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const rows = await db
    .select({ total: count() })
    .from(coursesTable)
    .where(whereClause);
  return Number(rows[0]?.total ?? 0);
}
