import {
  and,
  count,
  desc,
  eq,
  ilike,
  inArray,
  ne,
  or,
  sql,
  type SQL,
} from 'drizzle-orm';

import db from '@src/db';
import { commentsTable } from '@src/db/schema/comment';
import { postLikesTable } from '@src/db/schema/post-like';
import {
  postsTable,
  type NewPost,
  type PostStatus,
  type PostVisibility,
} from '@src/db/schema/post';
import { usersTable } from '@src/db/schema/user';
import {
  softDeleteVisibilityCondition,
  type SoftDeleteVisibility,
} from '@src/db/soft-delete';
import {
  type PostListItem,
  type PostRecord,
  parsePostListItem,
  parsePostRecord,
} from '@src/models/Post.model';
import type { CategoryPublic } from '@src/models/Category.model';
import type { TagPublic } from '@src/models/Tag.model';
import * as CategoryRepo from '@src/repos/CategoryRepo';
import * as PostTagRepo from '@src/repos/PostTagRepo';

function parseRow(row: unknown): PostRecord {
  return parsePostRecord(row);
}

function withSoftDelete(
  conditions: SQL[],
  deleted: SoftDeleteVisibility = 'without',
): void {
  const condition = softDeleteVisibilityCondition(
    postsTable.deletedAt,
    deleted,
  );
  if (condition) {
    conditions.push(condition);
  }
}

function mapListItem(
  row: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    thumbnail: string | null;
    status: PostRecord['status'];
    visibility: PostRecord['visibility'];
    viewCount: number;
    publishedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    likeCount: number;
    commentCount: number;
    authorId: number;
    authorUserName: string;
  },
  isLiked: boolean,
  tags: TagPublic[] = [],
  category: CategoryPublic | null = null,
): PostListItem {
  return parsePostListItem({
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    thumbnail: row.thumbnail,
    status: row.status,
    visibility: row.visibility,
    viewCount: row.viewCount,
    publishedAt: row.publishedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
    likeCount: Number(row.likeCount),
    commentCount: Number(row.commentCount),
    isLiked,
    author: {
      id: row.authorId,
      userName: row.authorUserName,
    },
    category,
    tags,
  });
}

const likeCountSubquery = sql<number>`(
  SELECT COUNT(*)::int FROM ${postLikesTable}
  WHERE ${postLikesTable.postId} = ${postsTable.id}
)`.mapWith(Number);

const commentCountSubquery = sql<number>`(
  SELECT COUNT(*)::int FROM ${commentsTable}
  WHERE ${commentsTable.postId} = ${postsTable.id}
  AND ${commentsTable.status} = 'visible'
)`.mapWith(Number);

async function getLikedPostIds(
  postIds: string[],
  userId?: number,
): Promise<Set<string>> {
  if (!userId || postIds.length === 0) {
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

function buildVisibilityConditions(
  hasAdminRead: boolean,
  isAuthenticated: boolean,
): SQL[] {
  if (hasAdminRead) {
    return [];
  }

  const conditions: SQL[] = [eq(postsTable.status, 'published')];

  if (isAuthenticated) {
    conditions.push(
      or(
        eq(postsTable.visibility, 'public'),
        eq(postsTable.visibility, 'members_only'),
      )!,
    );
  } else {
    conditions.push(eq(postsTable.visibility, 'public'));
  }

  return conditions;
}

export async function findById(
  id: string,
  options: { deleted?: SoftDeleteVisibility } = {},
): Promise<PostRecord | undefined> {
  const conditions: SQL[] = [eq(postsTable.id, id)];
  withSoftDelete(conditions, options.deleted);

  const rows = await db
    .select()
    .from(postsTable)
    .where(and(...conditions))
    .limit(1);
  return rows[0] ? parseRow(rows[0]) : undefined;
}

export async function findPublishedSummariesByIds(
  ids: string[],
): Promise<
  Map<
    string,
    {
      id: string;
      title: string;
      slug: string;
      excerpt: string | null;
      thumbnail: string | null;
    }
  >
> {
  const map = new Map<
    string,
    {
      id: string;
      title: string;
      slug: string;
      excerpt: string | null;
      thumbnail: string | null;
    }
  >();
  if (ids.length === 0) return map;

  const unique = [...new Set(ids.filter(Boolean))];
  if (unique.length === 0) return map;

  const rows = await db
    .select({
      id: postsTable.id,
      title: postsTable.title,
      slug: postsTable.slug,
      excerpt: postsTable.excerpt,
      thumbnail: postsTable.thumbnail,
    })
    .from(postsTable)
    .where(
      and(
        inArray(postsTable.id, unique),
        eq(postsTable.status, 'published'),
        sql`${postsTable.deletedAt} is null`,
      ),
    );

  for (const row of rows) {
    map.set(row.id, {
      id: row.id,
      title: row.title,
      slug: row.slug,
      excerpt: row.excerpt,
      thumbnail: row.thumbnail,
    });
  }
  return map;
}

export async function findBySlug(
  slug: string,
  options: { deleted?: SoftDeleteVisibility } = {},
): Promise<PostRecord | undefined> {
  const conditions: SQL[] = [eq(postsTable.slug, slug)];
  withSoftDelete(conditions, options.deleted);

  const rows = await db
    .select()
    .from(postsTable)
    .where(and(...conditions))
    .limit(1);
  return rows[0] ? parseRow(rows[0]) : undefined;
}

export async function slugExists(
  slug: string,
  excludeId?: string,
): Promise<boolean> {
  const conditions: SQL[] = [eq(postsTable.slug, slug)];
  withSoftDelete(conditions);
  if (excludeId) {
    conditions.push(ne(postsTable.id, excludeId));
  }

  const rows = await db
    .select({ id: postsTable.id })
    .from(postsTable)
    .where(and(...conditions))
    .limit(1);
  return rows.length > 0;
}

export async function findManyWithStats(options: {
  status?: PostStatus;
  search?: string;
  categoryId?: string;
  postIds?: string[];
  skip: number;
  take: number;
  userId?: number;
  hasAdminRead: boolean;
  isAuthenticated: boolean;
  deleted?: SoftDeleteVisibility;
}): Promise<{ data: PostListItem[]; total: number }> {
  const conditions: SQL[] = buildVisibilityConditions(
    options.hasAdminRead,
    options.isAuthenticated,
  );
  withSoftDelete(conditions, options.deleted);

  if (options.status) {
    conditions.push(eq(postsTable.status, options.status));
  }

  if (options.search) {
    const pattern = `%${options.search}%`;
    conditions.push(
      or(
        ilike(postsTable.title, pattern),
        ilike(postsTable.excerpt, pattern),
      )!,
    );
  }

  const query = db
    .select({
      id: postsTable.id,
      title: postsTable.title,
      slug: postsTable.slug,
      excerpt: postsTable.excerpt,
      thumbnail: postsTable.thumbnail,
      status: postsTable.status,
      visibility: postsTable.visibility,
      viewCount: postsTable.viewCount,
      publishedAt: postsTable.publishedAt,
      createdAt: postsTable.createdAt,
      updatedAt: postsTable.updatedAt,
      deletedAt: postsTable.deletedAt,
      likeCount: likeCountSubquery,
      commentCount: commentCountSubquery,
      authorId: postsTable.authorId,
      authorUserName: usersTable.userName,
    })
    .from(postsTable)
    .innerJoin(usersTable, eq(postsTable.authorId, usersTable.id));

  if (options.categoryId) {
    conditions.push(eq(postsTable.categoryId, options.categoryId));
  }

  if (options.postIds) {
    conditions.push(inArray(postsTable.id, options.postIds));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, totalRows] = await Promise.all([
    query
      .where(whereClause)
      .orderBy(desc(postsTable.publishedAt), desc(postsTable.createdAt))
      .limit(options.take)
      .offset(options.skip),
    db.select({ total: count() }).from(postsTable).where(whereClause),
  ]);

  const likedIds = await getLikedPostIds(
    rows.map((row) => row.id),
    options.userId,
  );

  const tagMap = await PostTagRepo.findByPostIds(rows.map((row) => row.id));
  const categoryMap = await CategoryRepo.findByPostIds(rows.map((row) => row.id));

  return {
    data: rows.map((row) =>
      mapListItem(
        row,
        likedIds.has(row.id),
        tagMap.get(row.id) ?? [],
        categoryMap.get(row.id) ?? null,
      ),
    ),
    total: Number(totalRows[0]?.total ?? 0),
  };
}

type PostWithStats = PostRecord & {
  likeCount: number;
  commentCount: number;
  authorUserName: string;
};

async function findOneWithStats(
  conditions: SQL[],
): Promise<PostWithStats | undefined> {
  const rows = await db
    .select({
      id: postsTable.id,
      authorId: postsTable.authorId,
      categoryId: postsTable.categoryId,
      title: postsTable.title,
      slug: postsTable.slug,
      excerpt: postsTable.excerpt,
      content: postsTable.content,
      thumbnail: postsTable.thumbnail,
      status: postsTable.status,
      visibility: postsTable.visibility,
      viewCount: postsTable.viewCount,
      publishedAt: postsTable.publishedAt,
      createdAt: postsTable.createdAt,
      updatedAt: postsTable.updatedAt,
      deletedAt: postsTable.deletedAt,
      deletedById: postsTable.deletedById,
      likeCount: likeCountSubquery,
      commentCount: commentCountSubquery,
      authorUserName: usersTable.userName,
    })
    .from(postsTable)
    .innerJoin(usersTable, eq(postsTable.authorId, usersTable.id))
    .where(and(...conditions))
    .limit(1);

  const row = rows[0];
  if (!row) {
    return undefined;
  }

  return {
    ...parseRow(row),
    likeCount: Number(row.likeCount),
    commentCount: Number(row.commentCount),
    authorUserName: row.authorUserName,
  };
}

export async function findByIdWithStats(
  id: string,
  options: { deleted?: SoftDeleteVisibility } = {},
): Promise<PostWithStats | undefined> {
  const conditions: SQL[] = [eq(postsTable.id, id)];
  withSoftDelete(conditions, options.deleted);
  return findOneWithStats(conditions);
}

export async function findBySlugWithStats(
  slug: string,
  options: { deleted?: SoftDeleteVisibility } = {},
): Promise<PostWithStats | undefined> {
  const conditions: SQL[] = [eq(postsTable.slug, slug)];
  withSoftDelete(conditions, options.deleted);
  return findOneWithStats(conditions);
}

export async function incrementViewCount(id: string): Promise<void> {
  await db
    .update(postsTable)
    .set({ viewCount: sql`${postsTable.viewCount} + 1` })
    .where(
      and(
        eq(postsTable.id, id),
        softDeleteVisibilityCondition(postsTable.deletedAt)!,
      ),
    );
}

export async function create(data: NewPost): Promise<PostRecord> {
  const rows = await db.insert(postsTable).values(data).returning();
  return parseRow(rows[0]);
}

export async function update(
  id: string,
  data: Partial<NewPost>,
): Promise<PostRecord | undefined> {
  const rows = await db
    .update(postsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(
      and(
        eq(postsTable.id, id),
        softDeleteVisibilityCondition(postsTable.deletedAt)!,
      ),
    )
    .returning();
  return rows[0] ? parseRow(rows[0]) : undefined;
}

/** Soft-delete by default (sets deletedAt). Pass mode: 'hard' for physical delete. */
export async function remove(
  id: string,
  options: { deletedById?: number; mode?: 'soft' | 'hard' } = {},
): Promise<boolean> {
  if (options.mode === 'hard') {
    const rows = await db
      .delete(postsTable)
      .where(eq(postsTable.id, id))
      .returning({ id: postsTable.id });
    return rows.length > 0;
  }

  const rows = await db
    .update(postsTable)
    .set({
      deletedAt: new Date(),
      deletedById: options.deletedById ?? null,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(postsTable.id, id),
        softDeleteVisibilityCondition(postsTable.deletedAt)!,
      ),
    )
    .returning({ id: postsTable.id });
  return rows.length > 0;
}

export async function restore(id: string): Promise<PostRecord | undefined> {
  const rows = await db
    .update(postsTable)
    .set({
      deletedAt: null,
      deletedById: null,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(postsTable.id, id),
        softDeleteVisibilityCondition(postsTable.deletedAt, 'only')!,
      ),
    )
    .returning();
  return rows[0] ? parseRow(rows[0]) : undefined;
}

export type { PostVisibility };
