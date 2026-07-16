import { and, asc, eq } from 'drizzle-orm';

import db from '@src/db';
import { courseIncludesTable } from '@src/db/schema/course-include';
import {
  type CourseIncludeRecord,
  parseCourseIncludeRecord,
} from '@src/models/CourseInclude.model';

function parseRow(row: unknown): CourseIncludeRecord {
  return parseCourseIncludeRecord(row);
}

export async function listByCourse(
  courseId: string,
): Promise<CourseIncludeRecord[]> {
  const rows = await db
    .select()
    .from(courseIncludesTable)
    .where(eq(courseIncludesTable.courseId, courseId))
    .orderBy(asc(courseIncludesTable.order));
  return rows.map(parseRow);
}

export async function findByCourseAndOrder(
  courseId: string,
  order: number,
): Promise<CourseIncludeRecord | undefined> {
  const rows = await db
    .select()
    .from(courseIncludesTable)
    .where(
      and(
        eq(courseIncludesTable.courseId, courseId),
        eq(courseIncludesTable.order, order),
      ),
    )
    .limit(1);
  return rows[0] ? parseRow(rows[0]) : undefined;
}

export async function create(data: {
  courseId: string;
  key: string;
  label: string;
  value?: number | null;
  unit?: string | null;
  order: number;
}): Promise<CourseIncludeRecord> {
  const rows = await db
    .insert(courseIncludesTable)
    .values({
      courseId: data.courseId,
      key: data.key,
      label: data.label,
      value: data.value ?? null,
      unit: data.unit ?? null,
      order: data.order,
    })
    .returning();
  return parseRow(rows[0]);
}

export async function update(
  id: string,
  data: {
    key?: string;
    label?: string;
    value?: number | null;
    unit?: string | null;
    order?: number;
  },
): Promise<CourseIncludeRecord | undefined> {
  const rows = await db
    .update(courseIncludesTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(courseIncludesTable.id, id))
    .returning();
  return rows[0] ? parseRow(rows[0]) : undefined;
}

export async function removeByCourse(courseId: string): Promise<void> {
  await db
    .delete(courseIncludesTable)
    .where(eq(courseIncludesTable.courseId, courseId));
}
