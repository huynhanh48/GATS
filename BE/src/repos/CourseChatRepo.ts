import { and, desc, eq, sql } from 'drizzle-orm';

import db from '@src/db';
import {
  courseChatMessagesTable,
  type CourseChatMessage,
} from '@src/db/schema/course-chat-message';
import { coursesTable } from '@src/db/schema/course';
import { usersTable } from '@src/db/schema/user';

export type CourseChatMessageRow = CourseChatMessage & {
  senderName: string;
  isMentor: boolean;
};

export async function listByCourse(
  courseId: string,
  limit = 100,
): Promise<CourseChatMessageRow[]> {
  const latest = await db
    .select({
      message: courseChatMessagesTable,
      senderName: usersTable.userName,
      isMentor: sql<boolean>`${courseChatMessagesTable.senderId} = ${coursesTable.instructorId}`,
    })
    .from(courseChatMessagesTable)
    .innerJoin(usersTable, eq(courseChatMessagesTable.senderId, usersTable.id))
    .innerJoin(coursesTable, eq(courseChatMessagesTable.courseId, coursesTable.id))
    .where(eq(courseChatMessagesTable.courseId, courseId))
    .orderBy(desc(courseChatMessagesTable.createdAt))
    .limit(Math.min(Math.max(limit, 1), 100));

  return latest
    .reverse()
    .map((row) => ({
      ...row.message,
      senderName: row.senderName,
      isMentor: row.isMentor,
    }));
}

export async function findById(
  courseId: string,
  messageId: string,
): Promise<CourseChatMessage | undefined> {
  const rows = await db
    .select()
    .from(courseChatMessagesTable)
    .where(
      and(
        eq(courseChatMessagesTable.id, messageId),
        eq(courseChatMessagesTable.courseId, courseId),
      ),
    )
    .limit(1);
  return rows[0];
}

export async function create(data: {
  courseId: string;
  senderId: number;
  content: string;
}): Promise<CourseChatMessage> {
  const rows = await db
    .insert(courseChatMessagesTable)
    .values(data)
    .returning();
  return rows[0];
}

export async function setPinned(
  courseId: string,
  messageId: string,
  pinnedById: number,
  isPinned: boolean,
): Promise<CourseChatMessage | undefined> {
  const rows = await db
    .update(courseChatMessagesTable)
    .set({
      pinnedAt: isPinned ? new Date() : null,
      pinnedById: isPinned ? pinnedById : null,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(courseChatMessagesTable.id, messageId),
        eq(courseChatMessagesTable.courseId, courseId),
      ),
    )
    .returning();
  return rows[0];
}

export async function remove(
  courseId: string,
  messageId: string,
): Promise<boolean> {
  const rows = await db
    .delete(courseChatMessagesTable)
    .where(
      and(
        eq(courseChatMessagesTable.id, messageId),
        eq(courseChatMessagesTable.courseId, courseId),
      ),
    )
    .returning({ id: courseChatMessagesTable.id });
  return rows.length > 0;
}
