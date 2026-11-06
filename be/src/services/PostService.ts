import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { appendSlugSuffix, slugify } from '@src/common/utils/slug';
import { RouteError } from '@src/common/utils/route-errors';
import { RESOURCE_TYPES } from '@src/db/schema/constants';
import type { PostStatus, PostVisibility } from '@src/db/schema/post';
import type {
  CreatePostInput,
  ListPostsQuery,
  PostDetail,
  PostRecord,
  UpdatePostInput,
} from '@src/models/Post.model';
import * as CategoryRepo from '@src/repos/CategoryRepo';
import * as PostLikeRepo from '@src/repos/PostLikeRepo';
import * as PostRepo from '@src/repos/PostRepo';
import * as PostTagRepo from '@src/repos/PostTagRepo';
import authorizationService from '@src/services/AuthorizationService';
import CategoryService from '@src/services/CategoryService';
import NotificationService from '@src/services/NotificationService';
import TagService from '@src/services/TagService';

const Errors = {
  NOT_FOUND: 'Post not found',
  SLUG_EXISTS: 'Slug already exists',
  FORBIDDEN: 'You do not have access to this post',
  TAG_NOT_FOUND: 'Tag not found',
} as const;

async function hasAdminRead(userId?: number): Promise<boolean> {
  if (!userId) {
    return false;
  }

  return authorizationService.canPerform({
    userId,
    action: 'read',
    resourceType: RESOURCE_TYPES.POST,
  });
}

async function hasAdminUpdate(userId?: number): Promise<boolean> {
  if (!userId) {
    return false;
  }

  return authorizationService.canPerform({
    userId,
    action: 'update',
    resourceType: RESOURCE_TYPES.POST,
  });
}

function assertReadable(
  post: Pick<PostRecord, 'status' | 'visibility'>,
  isAuthenticated: boolean,
  adminRead: boolean,
): void {
  if (adminRead) {
    return;
  }

  if (post.status !== 'published') {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }

  if (post.visibility === 'private') {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }

  if (post.visibility === 'members_only' && !isAuthenticated) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }
}

async function resolveUniqueSlug(
  title: string,
  preferredSlug?: string,
  excludeId?: string,
): Promise<string> {
  const base = slugify(preferredSlug ?? title);
  if (!base) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, 'Invalid slug');
  }

  let candidate = base;
  let suffix = 1;
  while (await PostRepo.slugExists(candidate, excludeId)) {
    candidate = appendSlugSuffix(base, suffix);
    suffix += 1;
  }
  return candidate;
}

function mapCreateInput(
  input: CreatePostInput,
  slug: string,
  authorId: number,
  categoryId: string | null,
) {
  return {
    title: input.title,
    slug,
    excerpt: input.excerpt ?? null,
    content: input.content,
    thumbnail: input.thumbnail ?? null,
    visibility: input.visibility as PostVisibility,
    authorId,
    categoryId,
  };
}

function mapUpdateInput(input: UpdatePostInput, categoryId?: string | null) {
  return {
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.slug !== undefined ? { slug: input.slug } : {}),
    ...(input.excerpt !== undefined ? { excerpt: input.excerpt } : {}),
    ...(input.content !== undefined ? { content: input.content } : {}),
    ...(input.thumbnail !== undefined ? { thumbnail: input.thumbnail } : {}),
    ...(input.status !== undefined
      ? { status: input.status as PostStatus }
      : {}),
    ...(input.visibility !== undefined
      ? { visibility: input.visibility as PostVisibility }
      : {}),
    ...(categoryId !== undefined ? { categoryId } : {}),
  };
}

function buildPagination(query: ListPostsQuery, total: number) {
  const hasMore = query.skip + query.take < total;
  const pagination: {
    skip: number;
    take: number;
    total: number;
    hasMore: boolean;
    page?: number;
    totalPages?: number;
  } = {
    skip: query.skip,
    take: query.take,
    total,
    hasMore,
  };

  if (query.mode === 'page') {
    pagination.page = query.page;
    pagination.totalPages = Math.ceil(total / query.take) || 0;
  }

  return pagination;
}

async function list(
  query: ListPostsQuery,
  userId?: number,
  isAuthenticated = false,
) {
  const deletedVisibility = query.deleted ?? 'without';
  if (
    (deletedVisibility === 'only' || deletedVisibility === 'with') &&
    !isAuthenticated
  ) {
    throw new RouteError(HttpStatusCodes.UNAUTHORIZED, 'Unauthorized');
  }

  const adminRead = await hasAdminRead(userId);
  const effectiveStatus =
    query.status ?? (adminRead ? undefined : ('published' as const));

  let categoryId: string | undefined;
  if (query.category) {
    const categorySlug = slugify(query.category);
    if (!categorySlug) {
      throw new RouteError(HttpStatusCodes.BAD_REQUEST, 'Invalid category slug');
    }
    const category = await CategoryRepo.findByTypeAndSlug('post', categorySlug);
    if (!category) {
      return {
        data: [],
        pagination: buildPagination(query, 0),
      };
    }
    categoryId = category.id;
  }

  let postIds: string[] | undefined;
  if (query.tag) {
    const tagSlug = slugify(query.tag);
    if (!tagSlug) {
      throw new RouteError(HttpStatusCodes.BAD_REQUEST, 'Invalid tag slug');
    }
    const ids = await PostTagRepo.findPostIdsByTagSlug(tagSlug);
    if (ids.length === 0) {
      return {
        data: [],
        pagination: buildPagination(query, 0),
      };
    }
    postIds = ids;
  }

  const { data, total } = await PostRepo.findManyWithStats({
    status: effectiveStatus,
    search: query.search,
    categoryId,
    postIds,
    skip: query.skip,
    take: query.take,
    userId,
    hasAdminRead: adminRead,
    isAuthenticated,
    deleted: deletedVisibility,
  });

  return {
    data,
    pagination: buildPagination(query, total),
  };
}

async function getBySlug(
  slug: string,
  userId?: number,
  isAuthenticated = false,
): Promise<PostDetail> {
  const adminRead = await hasAdminRead(userId);
  const row = await PostRepo.findBySlugWithStats(slug);

  if (!row) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }

  assertReadable(row, isAuthenticated, adminRead);
  await PostRepo.incrementViewCount(row.id);

  const isLiked = userId ? await PostLikeRepo.exists(row.id, userId) : false;
  const tags = await TagService.syncPostTags(row.id);
  const categoryMap = await CategoryRepo.findByPostIds([row.id]);
  const category = categoryMap.get(row.id) ?? null;

  let prevPost: { title: string; slug: string } | undefined;
  let nextPost: { title: string; slug: string } | undefined;

  if (row.publishedAt) {
    [prevPost, nextPost] = await Promise.all([
      PostRepo.findAdjacentPost(row.publishedAt, 'prev', { hasAdminRead: adminRead, isAuthenticated }),
      PostRepo.findAdjacentPost(row.publishedAt, 'next', { hasAdminRead: adminRead, isAuthenticated }),
    ]);
  }

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: row.content,
    thumbnail: row.thumbnail,
    status: row.status,
    visibility: row.visibility,
    viewCount: row.viewCount + 1,
    publishedAt: row.publishedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
    likeCount: row.likeCount,
    commentCount: row.commentCount,
    isLiked,
    author: {
      id: row.authorId,
      userName: row.authorUserName,
    },
    category,
    tags,
    prevPost,
    nextPost,
  };
}

async function getById(
  id: string,
  userId?: number,
  isAuthenticated = false,
): Promise<PostDetail> {
  const adminRead = await hasAdminRead(userId);
  const row = await PostRepo.findByIdWithStats(id);

  if (!row) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }

  assertReadable(row, isAuthenticated, adminRead);

  const isLiked = userId ? await PostLikeRepo.exists(row.id, userId) : false;
  const tags = await TagService.syncPostTags(row.id);
  const categoryMap = await CategoryRepo.findByPostIds([row.id]);
  const category = categoryMap.get(row.id) ?? null;

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: row.content,
    thumbnail: row.thumbnail,
    status: row.status,
    visibility: row.visibility,
    viewCount: row.viewCount,
    publishedAt: row.publishedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
    likeCount: row.likeCount,
    commentCount: row.commentCount,
    isLiked,
    author: {
      id: row.authorId,
      userName: row.authorUserName,
    },
    category,
    tags,
  };
}

async function create(input: CreatePostInput, authorId: number) {
  const slug = await resolveUniqueSlug(input.title, input.slug);
  const categoryId =
    (await CategoryService.resolveCategoryId(
      'post',
      input.category_id,
      input.category,
    )) ?? null;
  const resolvedTagIds =
    input.tag_ids !== undefined
      ? await TagService.resolveTagIdsByIds(input.tag_ids, 'post')
      : input.tags !== undefined
        ? await TagService.resolveTagIdsBySlugs(input.tags, 'post')
        : undefined;

  const post = await PostRepo.create(
    mapCreateInput(input, slug, authorId, categoryId),
  );

  const tags =
    resolvedTagIds !== undefined
      ? await TagService.syncPostTagIds(post.id, resolvedTagIds)
      : await TagService.syncPostTags(post.id);
  const categoryMap = await CategoryRepo.findByPostIds([post.id]);

  void NotificationService.notify({
    type: post.status === 'published' ? 'post_published' : 'post_created',
    title:
      post.status === 'published'
        ? `Bài viết đã xuất bản: ${post.title}`
        : `Bài viết mới: ${post.title}`,
    body: post.slug,
    href: `/post/${post.id}/edit`,
    entityId: post.id,
  });

  return {
    ...post,
    category: categoryMap.get(post.id) ?? null,
    tags,
  };
}

async function update(id: string, input: UpdatePostInput) {
  const existing = await PostRepo.findById(id);
  if (!existing) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }

  const categoryId = await CategoryService.resolveCategoryId(
    'post',
    input.category_id,
    input.category,
  );

  const payload = mapUpdateInput(input, categoryId);

  if (input.slug !== undefined) {
    const slug = slugify(input.slug);
    if (!slug) {
      throw new RouteError(HttpStatusCodes.BAD_REQUEST, 'Invalid slug');
    }
    if (await PostRepo.slugExists(slug, id)) {
      throw new RouteError(HttpStatusCodes.CONFLICT, Errors.SLUG_EXISTS);
    }
    payload.slug = slug;
  } else if (input.title !== undefined && input.title !== existing.title) {
    payload.slug = await resolveUniqueSlug(input.title, existing.slug, id);
  }

  if (input.status === 'published' && existing.status !== 'published') {
    Object.assign(payload, { publishedAt: new Date() });
  }

  if (input.status === 'draft') {
    Object.assign(payload, { publishedAt: null });
  }

  const updated = await PostRepo.update(id, payload);
  if (!updated) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }

  const resolvedTagIds =
    input.tag_ids !== undefined
      ? await TagService.resolveTagIdsByIds(input.tag_ids, 'post')
      : input.tags !== undefined
        ? await TagService.resolveTagIdsBySlugs(input.tags, 'post')
        : undefined;

  const tags =
    resolvedTagIds !== undefined
      ? await TagService.syncPostTagIds(id, resolvedTagIds)
      : await TagService.syncPostTags(id);

  const categoryMap = await CategoryRepo.findByPostIds([id]);

  if (input.status === 'published' && existing.status !== 'published') {
    void NotificationService.notify({
      type: 'post_published',
      title: `Bài viết đã xuất bản: ${updated.title}`,
      body: updated.slug,
      href: `/post/${updated.id}/edit`,
      entityId: updated.id,
    });
  }

  return {
    ...updated,
    category: categoryMap.get(id) ?? null,
    tags,
  };
}

async function publish(id: string) {
  return update(id, { status: 'published' });
}

async function unpublish(id: string) {
  return update(id, { status: 'draft' });
}

async function archive(id: string) {
  return update(id, { status: 'archived' });
}

async function remove(
  id: string,
  deletedById?: number,
  mode: 'soft' | 'hard' = 'soft',
) {
  const deleted = await PostRepo.remove(id, { deletedById, mode });
  if (!deleted) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }
  return {
    message: mode === 'hard' ? 'Post permanently deleted' : 'Post deleted',
  };
}

async function restore(id: string) {
  const restored = await PostRepo.restore(id);
  if (!restored) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }
  const categoryMap = await CategoryRepo.findByPostIds([restored.id]);
  const tags = await TagService.syncPostTags(restored.id);
  return {
    ...restored,
    category: categoryMap.get(restored.id) ?? null,
    tags,
  };
}

async function likePost(postId: string, userId: number, isAuthenticated: boolean) {
  const post = await PostRepo.findById(postId);
  if (!post) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }

  const adminRead = await hasAdminRead(userId);
  assertReadable(post, isAuthenticated, adminRead);

  await PostLikeRepo.like(postId, userId);
  return { liked: true };
}

async function unlikePost(
  postId: string,
  userId: number,
  isAuthenticated: boolean,
) {
  const post = await PostRepo.findById(postId);
  if (!post) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }

  const adminRead = await hasAdminRead(userId);
  assertReadable(post, isAuthenticated, adminRead);

  await PostLikeRepo.unlike(postId, userId);
  return { liked: false };
}

async function assertPostReadableById(
  postId: string,
  userId?: number,
  isAuthenticated = false,
): Promise<PostRecord> {
  const post = await PostRepo.findById(postId);
  if (!post) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }

  const adminRead = await hasAdminRead(userId);
  assertReadable(post, isAuthenticated, adminRead);
  return post;
}

export default {
  Errors,
  list,
  getBySlug,
  getById,
  create,
  update,
  publish,
  unpublish,
  archive,
  remove,
  restore,
  likePost,
  unlikePost,
  assertPostReadableById,
  hasAdminUpdate,
};
