import { and, asc, eq } from 'drizzle-orm';

import db from '@src/db';
import { courseLearningOutcomesTable } from '@src/db/schema/course-learning-outcome';
import {
  type CourseLearningOutcomeRecord,
  parseCourseLearningOutcomeRecord,
} from '@src/models/CourseLearningOutcome.model';

function parseRow(row: unknown): CourseLearningOutcomeRecord {
  return parseCourseLearningOutcomeRecord(row);
}

export async function listByCourse(
  courseId: string,
): Promise<CourseLearningOutcomeRecord[]> {
  const rows = await db
    .select()
    .from(courseLearningOutcomesTable)
    .where(eq(courseLearningOutcomesTable.courseId, courseId))
    .orderBy(asc(courseLearningOutcomesTable.order));
  return rows.map(parseRow);
}

export async function findByCourseAndOrder(
  courseId: string,
  order: number,
): Promise<CourseLearningOutcomeRecord | undefined> {
  const rows = await db
    .select()
    .from(courseLearningOutcomesTable)
    .where(
      and(
        eq(courseLearningOutcomesTable.courseId, courseId),
        eq(courseLearningOutcomesTable.order, order),
      ),
    )
    .limit(1);
  return rows[0] ? parseRow(rows[0]) : undefined;
}

export async function create(data: {
  courseId: string;
  content: string;
  order: number;
}): Promise<CourseLearningOutcomeRecord> {
  const rows = await db
    .insert(courseLearningOutcomesTable)
    .values({
      courseId: data.courseId,
      content: data.content,
      order: data.order,
    })
    .returning();
  return parseRow(rows[0]);
}

export async function removeByCourse(courseId: string): Promise<void> {
  await db
    .delete(courseLearningOutcomesTable)
    .where(eq(courseLearningOutcomesTable.courseId, courseId));
}
