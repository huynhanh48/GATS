import {
  postStatusEnum,
  postVisibilityEnum,
} from '@src/db/schema/post';
import { categoryPublicSchema } from '@src/models/Category.model';
import { tagPublicSchema } from '@src/models/Tag.model';
import { z } from 'zod';

export const postStatusSchema = z.enum(postStatusEnum.enumValues);
export const postVisibilitySchema = z.enum(postVisibilityEnum.enumValues);

export const postAuthorSchema = z.object({
  id: z.number().int().positive(),
  userName: z.string(),
});

export const postRecordSchema = z.object({
  id: z.string().uuid(),
  authorId: z.number().int().positive(),
  categoryId: z.string().uuid().nullable(),
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  excerpt: z.string().nullable(),
  content: z.string(),
  thumbnail: z.string().nullable(),
  status: postStatusSchema,
  visibility: postVisibilitySchema,
  viewCount: z.number().int().min(0),
  publishedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
  deletedById: z.number().int().positive().nullable(),
});

export const postListItemSchema = postRecordSchema
  .omit({
    content: true,
    authorId: true,
    categoryId: true,
    deletedById: true,
  })
  .extend({
    likeCount: z.number().int().min(0),
    commentCount: z.number().int().min(0),
    isLiked: z.boolean(),
    author: postAuthorSchema,
    category: categoryPublicSchema.nullable(),
    tags: z.array(tagPublicSchema).default([]),
  });

export const postDetailSchema = postRecordSchema
  .omit({
    authorId: true,
    categoryId: true,
    deletedById: true,
  })
  .extend({
    likeCount: z.number().int().min(0),
    commentCount: z.number().int().min(0),
    isLiked: z.boolean(),
    author: postAuthorSchema,
    category: categoryPublicSchema.nullable(),
    tags: z.array(tagPublicSchema).default([]),
    prevPost: z.object({ title: z.string(), slug: z.string() }).nullable().optional(),
    nextPost: z.object({ title: z.string(), slug: z.string() }).nullable().optional(),
  });

export const createPostSchema = z
  .object({
    title: z.string().min(1).max(255),
    slug: z.string().min(1).max(255).optional(),
    excerpt: z.string().optional(),
    content: z.string().min(1),
    thumbnail: z.string().max(512).optional(),
    visibility: postVisibilitySchema.default('public'),
    category_id: z.string().uuid().optional(),
    category: z.string().min(1).max(100).optional(),
    tags: z.array(z.string().min(1).max(100)).optional(),
    tag_ids: z.array(z.string().uuid()).optional(),
  })
  .refine((data) => data.tags === undefined || data.tag_ids === undefined, {
    message: 'Use either tags or tag_ids, not both',
  });

export const updatePostSchema = z
  .object({
    title: z.string().min(1).max(255).optional(),
    slug: z.string().min(1).max(255).optional(),
    excerpt: z.string().nullable().optional(),
    content: z.string().min(1).optional(),
    thumbnail: z.string().max(512).nullable().optional(),
    status: postStatusSchema.optional(),
    visibility: postVisibilitySchema.optional(),
    category_id: z.string().uuid().nullable().optional(),
    category: z.string().min(1).max(100).nullable().optional(),
    tags: z.array(z.string().min(1).max(100)).optional(),
    tag_ids: z.array(z.string().uuid()).optional(),
  })
  .refine((data) => data.tags === undefined || data.tag_ids === undefined, {
    message: 'Use either tags or tag_ids, not both',
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export const softDeleteVisibilitySchema = z.enum(['without', 'with', 'only']);

const listPostsQueryBaseSchema = z.object({
  status: postStatusSchema.optional(),
  search: z.string().optional(),
  tag: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  /** Soft-delete visibility. `only`/`with` require auth (admin trash). Default: without */
  deleted: softDeleteVisibilitySchema.optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  take: z.coerce.number().int().min(1).max(100).optional(),
  skip: z.coerce.number().int().min(0).optional(),
});

export const listPostsQuerySchema = listPostsQueryBaseSchema.transform((data) => {
  if (data.take !== undefined) {
    return {
      status: data.status,
      search: data.search,
      tag: data.tag,
      category: data.category,
      deleted: data.deleted,
      skip: data.skip ?? 0,
      take: data.take,
      mode: 'offset' as const,
    };
  }

  const limit = data.limit ?? 20;
  const page = data.page ?? 1;

  return {
    status: data.status,
    search: data.search,
    tag: data.tag,
    category: data.category,
    deleted: data.deleted,
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit,
    mode: 'page' as const,
  };
});

export const postPaginationSchema = z.object({
  skip: z.number().int().min(0),
  take: z.number().int().min(1),
  total: z.number().int().min(0),
  hasMore: z.boolean(),
  page: z.number().int().min(1).optional(),
  totalPages: z.number().int().min(0).optional(),
});

export type PostStatus = z.infer<typeof postStatusSchema>;
export type PostVisibility = z.infer<typeof postVisibilitySchema>;
export type PostRecord = z.infer<typeof postRecordSchema>;
export type PostListItem = z.infer<typeof postListItemSchema>;
export type PostDetail = z.infer<typeof postDetailSchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type ListPostsQuery = z.infer<typeof listPostsQuerySchema>;
export type PostPagination = z.infer<typeof postPaginationSchema>;

export function parseCreatePostInput(data: unknown): CreatePostInput {
  return createPostSchema.parse(data);
}

export function parseUpdatePostInput(data: unknown): UpdatePostInput {
  return updatePostSchema.parse(data);
}

export function parseListPostsQuery(data: unknown): ListPostsQuery {
  return listPostsQuerySchema.parse(data);
}

export function parsePostRecord(data: unknown): PostRecord {
  return postRecordSchema.parse(data);
}

export function parsePostListItem(data: unknown): PostListItem {
  return postListItemSchema.parse(data);
}

export function parsePostDetail(data: unknown): PostDetail {
  return postDetailSchema.parse(data);
}
