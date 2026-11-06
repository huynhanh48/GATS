import { and, asc, count, eq, inArray, max } from 'drizzle-orm';

import db from '@src/db';
import { courseSectionsTable } from '@src/db/schema/course-section';
import {
  type CourseSectionRecord,
  courseSectionRecordSchema,
} from '@src/models/CourseSection.model';

function parseRow(row: unknown): CourseSectionRecord {
  return courseSectionRecordSchema.parse(row);
}

export async function countByCourses(
  courseIds: string[],
): Promise<Map<string, number>> {
  if (courseIds.length === 0) return new Map();
  const rows = await db
    .select({
      courseId: courseSectionsTable.courseId,
      total: count(),
    })
    .from(courseSectionsTable)
    .where(inArray(courseSectionsTable.courseId, courseIds))
    .groupBy(courseSectionsTable.courseId);
  return new Map(
    rows.map((row) => [row.courseId, Number(row.total ?? 0)]),
  );
}

export async function findById(
  id: string,
): Promise<CourseSectionRecord | undefined> {
  const rows = await db
    .select()
    .from(courseSectionsTable)
    .where(eq(courseSectionsTable.id, id))
    .limit(1);
  return rows[0] ? parseRow(rows[0]) : undefined;
}

export async function findByIdAndCourseId(
  sectionId: string,
  courseId: string,
): Promise<CourseSectionRecord | undefined> {
  const rows = await db
    .select()
    .from(courseSectionsTable)
    .where(
      and(
        eq(courseSectionsTable.id, sectionId),
        eq(courseSectionsTable.courseId, courseId),
      ),
    )
    .limit(1);
  return rows[0] ? parseRow(rows[0]) : undefined;
}

export async function listByCourse(
  courseId: string,
): Promise<CourseSectionRecord[]> {
  const rows = await db
    .select()
    .from(courseSectionsTable)
    .where(eq(courseSectionsTable.courseId, courseId))
    .orderBy(asc(courseSectionsTable.order));
  return rows.map(parseRow);
}

export async function findByCourseAndOrder(
  courseId: string,
  order: number,
): Promise<CourseSectionRecord | undefined> {
  const rows = await db
    .select()
    .from(courseSectionsTable)
    .where(
      and(
        eq(courseSectionsTable.courseId, courseId),
        eq(courseSectionsTable.order, order),
      ),
    )
    .limit(1);
  return rows[0] ? parseRow(rows[0]) : undefined;
}

export async function getNextOrder(courseId: string): Promise<number> {
  const [result] = await db
    .select({ maxOrder: max(courseSectionsTable.order) })
    .from(courseSectionsTable)
    .where(eq(courseSectionsTable.courseId, courseId));
  return (result?.maxOrder ?? -1) + 1;
}

export async function create(data: {
  courseId: string;
  title: string;
  order: number;
}): Promise<CourseSectionRecord> {
  const rows = await db
    .insert(courseSectionsTable)
    .values({
      courseId: data.courseId,
      title: data.title,
      order: data.order,
    })
    .returning();
  return parseRow(rows[0]);
}

export async function update(
  id: string,
  data: { title?: string; order?: number },
): Promise<CourseSectionRecord | undefined> {
  const rows = await db
    .update(courseSectionsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(courseSectionsTable.id, id))
    .returning();
  return rows[0] ? parseRow(rows[0]) : undefined;
}

export async function remove(id: string): Promise<boolean> {
  const rows = await db
    .delete(courseSectionsTable)
    .where(eq(courseSectionsTable.id, id))
    .returning({ id: courseSectionsTable.id });
  return rows.length > 0;
}
