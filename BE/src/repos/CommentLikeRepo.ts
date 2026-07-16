import { and, eq, inArray } from 'drizzle-orm';

import db from '@src/db';
import { commentLikesTable } from '@src/db/schema/comment-like';

export async function exists(
  commentId: string,
  userId: number,
): Promise<boolean> {
  const rows = await db
    .select({ id: commentLikesTable.id })
    .from(commentLikesTable)
    .where(
      and(
        eq(commentLikesTable.commentId, commentId),
        eq(commentLikesTable.userId, userId),
      ),
    )
    .limit(1);
  return rows.length > 0;
}

export async function like(commentId: string, userId: number): Promise<boolean> {
  const rows = await db
    .insert(commentLikesTable)
    .values({ commentId, userId })
    .onConflictDoNothing()
    .returning({ id: commentLikesTable.id });
  return rows.length > 0;
}

export async function unlike(
  commentId: string,
  userId: number,
): Promise<boolean> {
  const rows = await db
    .delete(commentLikesTable)
    .where(
      and(
        eq(commentLikesTable.commentId, commentId),
        eq(commentLikesTable.userId, userId),
      ),
    )
    .returning({ id: commentLikesTable.id });
  return rows.length > 0;
}

export async function findLikedCommentIds(
  commentIds: string[],
  userId: number,
): Promise<Set<string>> {
  if (commentIds.length === 0) {
    return new Set();
  }

  const rows = await db
    .select({ commentId: commentLikesTable.commentId })
    .from(commentLikesTable)
    .where(
      and(
        eq(commentLikesTable.userId, userId),
        inArray(commentLikesTable.commentId, commentIds),
      ),
    );

  return new Set(rows.map((row) => row.commentId));
}
