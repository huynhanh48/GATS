import { and, asc, eq, inArray, max } from 'drizzle-orm';

import db from '@src/db';
import { lessonAttachmentsTable } from '@src/db/schema/lesson-attachment';
import { mediaTable } from '@src/db/schema/media';
import {
  parseLessonAttachment,
  type LessonAttachmentPublic,
} from '@src/models/LessonAttachment.model';

type JoinedRow = {
  id: string;
  lessonId: string;
  mediaId: string;
  title: string | null;
  order: number;
  createdAt: Date;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
};

const selection = {
  id: lessonAttachmentsTable.id,
  lessonId: lessonAttachmentsTable.lessonId,
  mediaId: lessonAttachmentsTable.mediaId,
  title: lessonAttachmentsTable.title,
  order: lessonAttachmentsTable.order,
  createdAt: lessonAttachmentsTable.createdAt,
  originalName: mediaTable.originalName,
  url: mediaTable.url,
  mimeType: mediaTable.mimeType,
  size: mediaTable.size,
};

function toPublic(row: JoinedRow): LessonAttachmentPublic {
  return parseLessonAttachment({
    id: row.id,
    lessonId: row.lessonId,
    mediaId: row.mediaId,
    name: row.title ?? row.originalName,
    url: row.url,
    mimeType: row.mimeType,
    size: row.size,
    order: row.order,
    createdAt: row.createdAt,
  });
}

export async function create(data: {
  lessonId: string;
  mediaId: string;
  title?: string | null;
  order: number;
}): Promise<LessonAttachmentPublic> {
  await db.insert(lessonAttachmentsTable).values({
    lessonId: data.lessonId,
    mediaId: data.mediaId,
    title: data.title ?? null,
    order: data.order,
  });

  const attachment = await findByLessonAndMedia(data.lessonId, data.mediaId);
  if (!attachment) {
    throw new Error('Failed to create lesson attachment');
  }
  return attachment;
}

export async function findById(
  id: string,
): Promise<LessonAttachmentPublic | undefined> {
  const rows = await db
    .select(selection)
    .from(lessonAttachmentsTable)
    .innerJoin(mediaTable, eq(lessonAttachmentsTable.mediaId, mediaTable.id))
    .where(eq(lessonAttachmentsTable.id, id))
    .limit(1);
  return rows[0] ? toPublic(rows[0]) : undefined;
}

export async function findByLessonAndMedia(
  lessonId: string,
  mediaId: string,
): Promise<LessonAttachmentPublic | undefined> {
  const rows = await db
    .select(selection)
    .from(lessonAttachmentsTable)
    .innerJoin(mediaTable, eq(lessonAttachmentsTable.mediaId, mediaTable.id))
    .where(
      and(
        eq(lessonAttachmentsTable.lessonId, lessonId),
        eq(lessonAttachmentsTable.mediaId, mediaId),
      ),
    )
    .limit(1);
  return rows[0] ? toPublic(rows[0]) : undefined;
}

export async function listByLesson(
  lessonId: string,
): Promise<LessonAttachmentPublic[]> {
  const rows = await db
    .select(selection)
    .from(lessonAttachmentsTable)
    .innerJoin(mediaTable, eq(lessonAttachmentsTable.mediaId, mediaTable.id))
    .where(eq(lessonAttachmentsTable.lessonId, lessonId))
    .orderBy(asc(lessonAttachmentsTable.order), asc(lessonAttachmentsTable.createdAt));
  return rows.map(toPublic);
}

export async function listByLessonIds(
  lessonIds: string[],
): Promise<Map<string, LessonAttachmentPublic[]>> {
  const grouped = new Map<string, LessonAttachmentPublic[]>();
  if (lessonIds.length === 0) {
    return grouped;
  }

  const rows = await db
    .select(selection)
    .from(lessonAttachmentsTable)
    .innerJoin(mediaTable, eq(lessonAttachmentsTable.mediaId, mediaTable.id))
    .where(inArray(lessonAttachmentsTable.lessonId, lessonIds))
    .orderBy(asc(lessonAttachmentsTable.order), asc(lessonAttachmentsTable.createdAt));

  for (const row of rows) {
    const attachment = toPublic(row);
    const existing = grouped.get(attachment.lessonId) ?? [];
    existing.push(attachment);
    grouped.set(attachment.lessonId, existing);
  }
  return grouped;
}

export async function getNextOrder(lessonId: string): Promise<number> {
  const [result] = await db
    .select({ maxOrder: max(lessonAttachmentsTable.order) })
    .from(lessonAttachmentsTable)
    .where(eq(lessonAttachmentsTable.lessonId, lessonId));
  return (result?.maxOrder ?? -1) + 1;
}

export async function remove(id: string): Promise<boolean> {
  const rows = await db
    .delete(lessonAttachmentsTable)
    .where(eq(lessonAttachmentsTable.id, id))
    .returning({ id: lessonAttachmentsTable.id });
  return rows.length > 0;
}
