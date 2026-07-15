import { and, asc, count, eq, max } from 'drizzle-orm';

import db from '@src/db';
import { lessonsTable } from '@src/db/schema/lesson';
import {
  type LessonRecord,
  lessonRecordSchema,
} from '@src/models/Lesson.model';

function parseRow(row: unknown): LessonRecord {
  return lessonRecordSchema.parse(row);
}

export async function findById(id: string): Promise<LessonRecord | undefined> {
  const rows = await db
    .select()
    .from(lessonsTable)
    .where(eq(lessonsTable.id, id))
    .limit(1);
  return rows[0] ? parseRow(rows[0]) : undefined;
}

export async function findByIdAndCourseId(
  lessonId: string,
  courseId: string,
): Promise<LessonRecord | undefined> {
  const rows = await db
    .select()
    .from(lessonsTable)
    .where(
      and(eq(lessonsTable.id, lessonId), eq(lessonsTable.courseId, courseId)),
    )
    .limit(1);
  return rows[0] ? parseRow(rows[0]) : undefined;
}

export async function listByCourse(courseId: string): Promise<LessonRecord[]> {
  const rows = await db
    .select()
    .from(lessonsTable)
    .where(eq(lessonsTable.courseId, courseId))
    .orderBy(asc(lessonsTable.order));
  return rows.map(parseRow);
}

export async function listBySection(
  sectionId: string,
): Promise<LessonRecord[]> {
  const rows = await db
    .select()
    .from(lessonsTable)
    .where(eq(lessonsTable.sectionId, sectionId))
    .orderBy(asc(lessonsTable.order));
  return rows.map(parseRow);
}

export async function findBySectionAndOrder(
  sectionId: string,
  order: number,
): Promise<LessonRecord | undefined> {
  const rows = await db
    .select()
    .from(lessonsTable)
    .where(
      and(eq(lessonsTable.sectionId, sectionId), eq(lessonsTable.order, order)),
    )
    .limit(1);
  return rows[0] ? parseRow(rows[0]) : undefined;
}

export async function countByCourse(courseId: string): Promise<number> {
  const [result] = await db
    .select({ total: count() })
    .from(lessonsTable)
    .where(eq(lessonsTable.courseId, courseId));
  return Number(result?.total ?? 0);
}

export async function getNextOrderInSection(
  sectionId: string,
): Promise<number> {
  const [result] = await db
    .select({ maxOrder: max(lessonsTable.order) })
    .from(lessonsTable)
    .where(eq(lessonsTable.sectionId, sectionId));
  return (result?.maxOrder ?? -1) + 1;
}

export async function create(data: {
  courseId: string;
  sectionId: string;
  title: string;
  description?: string | null;
  type: LessonRecord['type'];
  order: number;
  content?: string | null;
  isPreview?: boolean;
  duration?: number | null;
}): Promise<LessonRecord> {
  const rows = await db
    .insert(lessonsTable)
    .values({
      courseId: data.courseId,
      sectionId: data.sectionId,
      title: data.title,
      description: data.description ?? null,
      type: data.type,
      order: data.order,
      content: data.content ?? null,
      isPreview: data.isPreview ?? false,
      duration: data.duration ?? null,
    })
    .returning();
  return parseRow(rows[0]);
}

export async function update(
  id: string,
  data: {
    title?: string;
    description?: string | null;
    type?: LessonRecord['type'];
    order?: number;
    content?: string | null;
    isPreview?: boolean;
    duration?: number | null;
  },
): Promise<LessonRecord | undefined> {
  const rows = await db
    .update(lessonsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(lessonsTable.id, id))
    .returning();
  return rows[0] ? parseRow(rows[0]) : undefined;
}

export async function remove(id: string): Promise<boolean> {
  const rows = await db
    .delete(lessonsTable)
    .where(eq(lessonsTable.id, id))
    .returning({ id: lessonsTable.id });
  return rows.length > 0;
}
