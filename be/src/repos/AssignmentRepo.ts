import { eq } from 'drizzle-orm';

import db from '@src/db';
import { type Assignment, assignmentsTable } from '@src/db/schema/assignment';

export async function findById(id: string): Promise<Assignment | undefined> {
  const rows = await db
    .select()
    .from(assignmentsTable)
    .where(eq(assignmentsTable.id, id))
    .limit(1);
  return rows[0];
}

export async function findByLessonId(
  lessonId: string,
): Promise<Assignment | undefined> {
  const rows = await db
    .select()
    .from(assignmentsTable)
    .where(eq(assignmentsTable.lessonId, lessonId))
    .limit(1);
  return rows[0];
}

export async function create(data: {
  lessonId: string;
  title?: string | null;
  dueAt?: Date | null;
  maxScore?: number;
  maxFileSizeMb?: number | null;
  allowedSubmissionTypes: string;
  lateSubmissionAllowed?: boolean;
  maxSubmissions?: number;
  passingScore?: number;
}): Promise<Assignment> {
  const rows = await db
    .insert(assignmentsTable)
    .values({
      lessonId: data.lessonId,
      title: data.title ?? null,
      dueAt: data.dueAt ?? null,
      maxScore: data.maxScore ?? 100,
      maxFileSizeMb: data.maxFileSizeMb ?? null,
      allowedSubmissionTypes: data.allowedSubmissionTypes,
      lateSubmissionAllowed: data.lateSubmissionAllowed ?? false,
      maxSubmissions: data.maxSubmissions ?? 1,
      passingScore: data.passingScore ?? 70,
    })
    .returning();
  return rows[0];
}

export async function update(
  id: string,
  data: Partial<{
    title: string | null;
    dueAt: Date | null;
    maxScore: number;
    maxFileSizeMb: number | null;
    allowedSubmissionTypes: string;
    lateSubmissionAllowed: boolean;
    maxSubmissions: number;
    passingScore: number;
  }>,
): Promise<Assignment | undefined> {
  const rows = await db
    .update(assignmentsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(assignmentsTable.id, id))
    .returning();
  return rows[0];
}

export async function remove(id: string): Promise<boolean> {
  const rows = await db
    .delete(assignmentsTable)
    .where(eq(assignmentsTable.id, id))
    .returning({ id: assignmentsTable.id });
  return rows.length > 0;
}
