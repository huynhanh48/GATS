import { and, desc, eq, sql } from 'drizzle-orm';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
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

const Errors = {
  STORAGE_UNAVAILABLE:
    'Nhóm chat chưa sẵn sàng trên máy chủ (thiếu bảng dữ liệu). Vui lòng liên hệ quản trị.',
} as const;

function isMissingRelationError(error: unknown): boolean {
  const err = error as { code?: string; message?: string };
  if (err?.code === '42P01') return true;
  const message = String(err?.message ?? '');
  return (
    /course_chat_messages/i.test(message) && /does not exist/i.test(message)
  );
}

function rethrowChatStorageError(error: unknown): never {
  if (isMissingRelationError(error)) {
    throw new RouteError(
      HttpStatusCodes.SERVICE_UNAVAILABLE,
      Errors.STORAGE_UNAVAILABLE,
    );
  }
  throw error;
}

export async function listByCourse(
  courseId: string,
  limit = 100,
): Promise<CourseChatMessageRow[]> {
  try {
    const latest = await db
      .select({
        message: courseChatMessagesTable,
        senderName: usersTable.userName,
        isMentor: sql<boolean>`${courseChatMessagesTable.senderId} = ${coursesTable.instructorId}`,
      })
      .from(courseChatMessagesTable)
      .innerJoin(usersTable, eq(courseChatMessagesTable.senderId, usersTable.id))
      .innerJoin(
        coursesTable,
        eq(courseChatMessagesTable.courseId, coursesTable.id),
      )
      .where(eq(courseChatMessagesTable.courseId, courseId))
      .orderBy(desc(courseChatMessagesTable.createdAt))
      .limit(Math.min(Math.max(limit, 1), 100));

    return latest.reverse().map((row) => ({
      ...row.message,
      senderName: row.senderName,
      isMentor: Boolean(row.isMentor),
    }));
  } catch (error) {
    rethrowChatStorageError(error);
  }
}

export async function findById(
  courseId: string,
  messageId: string,
): Promise<CourseChatMessage | undefined> {
  try {
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
  } catch (error) {
    rethrowChatStorageError(error);
  }
}

export async function create(data: {
  courseId: string;
  senderId: number;
  content: string;
}): Promise<CourseChatMessage> {
  try {
    const rows = await db
      .insert(courseChatMessagesTable)
      .values(data)
      .returning();
    return rows[0];
  } catch (error) {
    rethrowChatStorageError(error);
  }
}

export async function setPinned(
  courseId: string,
  messageId: string,
  pinnedById: number,
  isPinned: boolean,
): Promise<CourseChatMessage | undefined> {
  try {
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
  } catch (error) {
    rethrowChatStorageError(error);
  }
}

export async function remove(
  courseId: string,
  messageId: string,
): Promise<boolean> {
  try {
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
  } catch (error) {
    rethrowChatStorageError(error);
  }
}
