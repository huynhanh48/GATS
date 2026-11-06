import {
  and,
  count,
  desc,
  eq,
  isNull,
  sql,
  type SQL,
} from 'drizzle-orm';

import db from '@src/db';
import { commentLikesTable } from '@src/db/schema/comment-like';
import {
  commentsTable,
  type CommentStatus,
  type NewComment,
} from '@src/db/schema/comment';
import { postsTable } from '@src/db/schema/post';
import { usersTable } from '@src/db/schema/user';
import {
  type CommentListItem,
  type CommentRecord,
  parseCommentListItem,
  parseCommentRecord,
} from '@src/models/Comment.model';
import * as CommentLikeRepo from '@src/repos/CommentLikeRepo';

function parseRow(row: unknown): CommentRecord {
  return parseCommentRecord(row);
}

const likeCountSubquery = sql<number>`(
  SELECT COUNT(*)::int FROM ${commentLikesTable}
  WHERE ${commentLikesTable.commentId} = ${commentsTable.id}
)`.mapWith(Number);

function mapListItem(
  row: {
    id: string;
    postId: string;
    parentId: string | null;
    content: string;
    status: CommentStatus;
    createdAt: Date;
    updatedAt: Date;
    likeCount: number;
    userId: number | null;
    authorUserName: string | null;
    guestName: string | null;
  },
  isLiked: boolean,
): CommentListItem {
  return parseCommentListItem({
    id: row.id,
    postId: row.postId,
    parentId: row.parentId,
    content: row.content,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    likeCount: Number(row.likeCount),
    isLiked,
    author: {
      id: row.userId ?? undefined,
      userName: row.authorUserName || row.guestName || 'Khách',
    },
  });
}

async function mapRowsWithLikes(
  rows: Parameters<typeof mapListItem>[0][],
  userId?: number,
): Promise<CommentListItem[]> {
  const likedIds = userId
    ? await CommentLikeRepo.findLikedCommentIds(
        rows.map((row) => row.id),
        userId,
      )
    : new Set<string>();

  return rows.map((row) => mapListItem(row, likedIds.has(row.id)));
}

export async function findById(id: string): Promise<CommentRecord | undefined> {
  const rows = await db
    .select()
    .from(commentsTable)
    .where(eq(commentsTable.id, id))
    .limit(1);
  return rows[0] ? parseRow(rows[0]) : undefined;
}

export async function findRootsByPostId(
  postId: string,
  page: number,
  limit: number,
  userId?: number,
  includeHidden = false,
): Promise<{ data: CommentListItem[]; total: number }> {
  const conditions: SQL[] = [
    eq(commentsTable.postId, postId),
    isNull(commentsTable.parentId),
  ];

  if (!includeHidden) {
    conditions.push(eq(commentsTable.status, 'visible'));
  }

  const whereClause = and(...conditions);
  const offset = (page - 1) * limit;

  const [rows, totalRows] = await Promise.all([
    db
      .select({
        id: commentsTable.id,
        postId: commentsTable.postId,
        parentId: commentsTable.parentId,
        content: commentsTable.content,
        status: commentsTable.status,
        createdAt: commentsTable.createdAt,
        updatedAt: commentsTable.updatedAt,
        likeCount: likeCountSubquery,
        userId: commentsTable.userId,
        authorUserName: usersTable.userName,
        guestName: commentsTable.guestName,
      })
      .from(commentsTable)
      .leftJoin(usersTable, eq(commentsTable.userId, usersTable.id))
      .where(whereClause)
      .orderBy(desc(commentsTable.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ total: count() }).from(commentsTable).where(whereClause),
  ]);

  return {
    data: await mapRowsWithLikes(rows, userId),
    total: Number(totalRows[0]?.total ?? 0),
  };
}

export async function findReplies(
  parentId: string,
  page: number,
  limit: number,
  userId?: number,
  includeHidden = false,
): Promise<{ data: CommentListItem[]; total: number }> {
  const conditions: SQL[] = [eq(commentsTable.parentId, parentId)];

  if (!includeHidden) {
    conditions.push(eq(commentsTable.status, 'visible'));
  }

  const whereClause = and(...conditions);
  const offset = (page - 1) * limit;

  const [rows, totalRows] = await Promise.all([
    db
      .select({
        id: commentsTable.id,
        postId: commentsTable.postId,
        parentId: commentsTable.parentId,
        content: commentsTable.content,
        status: commentsTable.status,
        createdAt: commentsTable.createdAt,
        updatedAt: commentsTable.updatedAt,
        likeCount: likeCountSubquery,
        userId: commentsTable.userId,
        authorUserName: usersTable.userName,
        guestName: commentsTable.guestName,
      })
      .from(commentsTable)
      .leftJoin(usersTable, eq(commentsTable.userId, usersTable.id))
      .where(whereClause)
      .orderBy(commentsTable.createdAt)
      .limit(limit)
      .offset(offset),
    db.select({ total: count() }).from(commentsTable).where(whereClause),
  ]);

  return {
    data: await mapRowsWithLikes(rows, userId),
    total: Number(totalRows[0]?.total ?? 0),
  };
}

export async function create(data: NewComment): Promise<CommentRecord> {
  const rows = await db.insert(commentsTable).values(data).returning();
  return parseRow(rows[0]);
}

export async function update(
  id: string,
  data: Partial<NewComment>,
): Promise<CommentRecord | undefined> {
  const rows = await db
    .update(commentsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(commentsTable.id, id))
    .returning();
  return rows[0] ? parseRow(rows[0]) : undefined;
}

export async function softDelete(id: string): Promise<CommentRecord | undefined> {
  return update(id, { status: 'deleted' });
}

export type ModerationQueueRow = {
  id: string;
  postId: string;
  postTitle: string | null;
  parentId: string | null;
  content: string;
  status: CommentStatus;
  createdAt: Date;
  updatedAt: Date;
  authorId: number | null;
  authorUserName: string | null;
  guestName: string | null;
  likeCount: number;
};

export async function listForModeration(options: {
  skip?: number;
  take?: number;
  status?: CommentStatus;
}): Promise<{ data: ModerationQueueRow[]; total: number }> {
  const skip = Math.max(0, options.skip ?? 0);
  const take = Math.min(100, Math.max(1, options.take ?? 20));

  const where = options.status
    ? eq(commentsTable.status, options.status)
    : sql`${commentsTable.status} in ('hidden', 'deleted')`;

  const [rows, totalRows] = await Promise.all([
    db
      .select({
        id: commentsTable.id,
        postId: commentsTable.postId,
        postTitle: postsTable.title,
        parentId: commentsTable.parentId,
        content: commentsTable.content,
        status: commentsTable.status,
        createdAt: commentsTable.createdAt,
        updatedAt: commentsTable.updatedAt,
        authorId: commentsTable.userId,
        authorUserName: usersTable.userName,
        guestName: commentsTable.guestName,
        likeCount: likeCountSubquery,
      })
      .from(commentsTable)
      .leftJoin(postsTable, eq(commentsTable.postId, postsTable.id))
      .leftJoin(usersTable, eq(commentsTable.userId, usersTable.id))
      .where(where)
      .orderBy(desc(commentsTable.updatedAt))
      .limit(take)
      .offset(skip),
    db.select({ total: count() }).from(commentsTable).where(where),
  ]);

  return {
    data: rows,
    total: Number(totalRows[0]?.total ?? 0),
  };
}

export async function countByStatus(): Promise<
  Record<CommentStatus, number> & { all: number }
> {
  const rows = await db
    .select({ status: commentsTable.status, value: count() })
    .from(commentsTable)
    .groupBy(commentsTable.status);

  const result: Record<CommentStatus, number> & { all: number } = {
    visible: 0,
    hidden: 0,
    deleted: 0,
    all: 0,
  };

  for (const row of rows) {
    const n = Number(row.value ?? 0);
    result[row.status] = n;
    result.all += n;
  }

  return result;
}

export async function belongsToPost(
  commentId: string,
  postId: string,
): Promise<boolean> {
  const rows = await db
    .select({ id: commentsTable.id })
    .from(commentsTable)
    .where(
      and(eq(commentsTable.id, commentId), eq(commentsTable.postId, postId)),
    )
    .limit(1);
  return rows.length > 0;
}
