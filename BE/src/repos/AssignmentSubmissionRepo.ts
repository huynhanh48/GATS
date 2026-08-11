import { and, count, desc, eq } from 'drizzle-orm';

import db from '@src/db';
import { assignmentAttachmentsTable } from '@src/db/schema/assignment-attachment';
import {
  assignmentSubmissionsTable,
  type AssignmentSubmission,
} from '@src/db/schema/assignment-submission';

export async function findById(
  id: string,
): Promise<AssignmentSubmission | undefined> {
  const rows = await db
    .select()
    .from(assignmentSubmissionsTable)
    .where(eq(assignmentSubmissionsTable.id, id))
    .limit(1);
  return rows[0];
}

export async function listByAssignment(
  assignmentId: string,
): Promise<AssignmentSubmission[]> {
  return db
    .select()
    .from(assignmentSubmissionsTable)
    .where(eq(assignmentSubmissionsTable.assignmentId, assignmentId))
    .orderBy(desc(assignmentSubmissionsTable.submittedAt));
}

export async function listByAssignmentAndUser(
  assignmentId: string,
  userId: number,
): Promise<AssignmentSubmission[]> {
  return db
    .select()
    .from(assignmentSubmissionsTable)
    .where(
      and(
        eq(assignmentSubmissionsTable.assignmentId, assignmentId),
        eq(assignmentSubmissionsTable.userId, userId),
      ),
    )
    .orderBy(desc(assignmentSubmissionsTable.submissionNumber));
}

export async function findLatestByUser(
  assignmentId: string,
  userId: number,
): Promise<AssignmentSubmission | undefined> {
  const rows = await db
    .select()
    .from(assignmentSubmissionsTable)
    .where(
      and(
        eq(assignmentSubmissionsTable.assignmentId, assignmentId),
        eq(assignmentSubmissionsTable.userId, userId),
      ),
    )
    .orderBy(desc(assignmentSubmissionsTable.submissionNumber))
    .limit(1);
  return rows[0];
}

export async function countByStatus(
  status: AssignmentSubmission['status'],
): Promise<number> {
  const [result] = await db
    .select({ total: count() })
    .from(assignmentSubmissionsTable)
    .where(eq(assignmentSubmissionsTable.status, status));
  return Number(result?.total ?? 0);
}

export async function countByUser(
  assignmentId: string,
  userId: number,
): Promise<number> {
  const [result] = await db
    .select({ total: count() })
    .from(assignmentSubmissionsTable)
    .where(
      and(
        eq(assignmentSubmissionsTable.assignmentId, assignmentId),
        eq(assignmentSubmissionsTable.userId, userId),
      ),
    );
  return Number(result?.total ?? 0);
}

export async function createSubmission(data: {
  assignmentId: string;
  userId: number;
  submissionNumber: number;
  status: AssignmentSubmission['status'];
  textContent?: string | null;
  url?: string | null;
  submittedAt?: Date | null;
}): Promise<AssignmentSubmission> {
  const rows = await db
    .insert(assignmentSubmissionsTable)
    .values({
      assignmentId: data.assignmentId,
      userId: data.userId,
      submissionNumber: data.submissionNumber,
      status: data.status,
      textContent: data.textContent ?? null,
      url: data.url ?? null,
      submittedAt: data.submittedAt ?? null,
    })
    .returning();
  return rows[0];
}

export async function updateSubmission(
  id: string,
  data: Partial<{
    status: AssignmentSubmission['status'];
    textContent: string | null;
    url: string | null;
    score: number | null;
    feedback: string | null;
    gradedById: number | null;
    gradedAt: Date | null;
    submittedAt: Date | null;
  }>,
): Promise<AssignmentSubmission | undefined> {
  const rows = await db
    .update(assignmentSubmissionsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(assignmentSubmissionsTable.id, id))
    .returning();
  return rows[0];
}

export async function createAttachment(data: {
  submissionId: string;
  fileName: string;
  storageKey: string;
  mimeType?: string | null;
  size?: number | null;
}) {
  const rows = await db
    .insert(assignmentAttachmentsTable)
    .values({
      submissionId: data.submissionId,
      fileName: data.fileName,
      storageKey: data.storageKey,
      mimeType: data.mimeType ?? null,
      size: data.size ?? null,
    })
    .returning();
  return rows[0];
}

export async function listAttachmentsBySubmission(submissionId: string) {
  return db
    .select()
    .from(assignmentAttachmentsTable)
    .where(eq(assignmentAttachmentsTable.submissionId, submissionId));
}
