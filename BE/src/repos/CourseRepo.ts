import { and, count, desc, eq, inArray, ne, type SQL } from 'drizzle-orm';

import db from '@src/db';
import {
  coursesTable,
  type CourseStatus,
  type NewCourse,
} from '@src/db/schema/course';
import {
  softDeleteVisibilityCondition,
  type SoftDeleteVisibility,
} from '@src/db/soft-delete';
import {
  type CourseRecord,
  parseCourseRecord,
} from '@src/models/Course.model';

function parseRow(row: unknown): CourseRecord {
  return parseCourseRecord(row);
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

export async function findMany(options: {
  status?: CourseStatus;
  level?: string;
  categoryId?: string;
  courseIds?: string[];
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
  if (options.courseIds) {
    conditions.push(inArray(coursesTable.id, options.courseIds));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, totalRows] = await Promise.all([
    db
      .select()
      .from(coursesTable)
      .where(whereClause)
      .orderBy(desc(coursesTable.createdAt))
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
    .where(and(eq(coursesTable.id, id), softDeleteVisibilityCondition(coursesTable.deletedAt)!))
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
