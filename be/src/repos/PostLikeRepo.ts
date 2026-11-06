import { and, eq, inArray } from 'drizzle-orm';

import db from '@src/db';
import { postLikesTable } from '@src/db/schema/post-like';

export async function exists(postId: string, userId: number): Promise<boolean> {
  const rows = await db
    .select({ id: postLikesTable.id })
    .from(postLikesTable)
    .where(
      and(eq(postLikesTable.postId, postId), eq(postLikesTable.userId, userId)),
    )
    .limit(1);
  return rows.length > 0;
}

export async function like(postId: string, userId: number): Promise<boolean> {
  const rows = await db
    .insert(postLikesTable)
    .values({ postId, userId })
    .onConflictDoNothing()
    .returning({ id: postLikesTable.id });
  return rows.length > 0;
}

export async function unlike(postId: string, userId: number): Promise<boolean> {
  const rows = await db
    .delete(postLikesTable)
    .where(
      and(eq(postLikesTable.postId, postId), eq(postLikesTable.userId, userId)),
    )
    .returning({ id: postLikesTable.id });
  return rows.length > 0;
}

export async function toggleLike(
  postId: string,
  userId: number,
): Promise<{ liked: boolean }> {
  const alreadyLiked = await exists(postId, userId);
  if (alreadyLiked) {
    await unlike(postId, userId);
    return { liked: false };
  }

  await like(postId, userId);
  return { liked: true };
}

export async function findLikedPostIds(
  postIds: string[],
  userId: number,
): Promise<Set<string>> {
  if (postIds.length === 0) {
    return new Set();
  }

  const rows = await db
    .select({ postId: postLikesTable.postId })
    .from(postLikesTable)
    .where(
      and(
        eq(postLikesTable.userId, userId),
        inArray(postLikesTable.postId, postIds),
      ),
    );

  return new Set(rows.map((row) => row.postId));
}
