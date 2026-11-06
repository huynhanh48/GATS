import { commentStatusEnum } from '@src/db/schema/comment';
import { z } from 'zod';

import { postAuthorSchema } from './Post.model';

export const commentStatusSchema = z.enum(commentStatusEnum.enumValues);

export const commentRecordSchema = z.object({
  id: z.string().uuid(),
  postId: z.string().uuid(),
  userId: z.number().int().positive().nullable(),
  guestName: z.string().nullable().optional(),
  guestEmail: z.string().email().nullable().optional(),
  parentId: z.string().uuid().nullable(),
  content: z.string(),
  status: commentStatusSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const commentListItemSchema = commentRecordSchema
  .omit({ userId: true })
  .extend({
    likeCount: z.number().int().min(0),
    isLiked: z.boolean(),
    author: z.object({
      id: z.number().int().positive().optional(),
      userName: z.string(),
    }),
  });

export const createCommentSchema = z.object({
  content: z.string().min(1).max(5000),
  guestName: z.string().min(1).max(255).optional(),
  guestEmail: z.string().email().max(255).optional(),
}).refine(data => {
  // We'll enforce that guestName/Email are provided at the service level if userId is not present
  return true;
}, "Guest name and email are required if not authenticated");

export const updateCommentSchema = z
  .object({
    content: z.string().min(1).max(5000).optional(),
    status: commentStatusSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export const listCommentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CommentStatus = z.infer<typeof commentStatusSchema>;
export type CommentRecord = z.infer<typeof commentRecordSchema>;
export type CommentListItem = z.infer<typeof commentListItemSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
export type ListCommentsQuery = z.infer<typeof listCommentsQuerySchema>;

export function parseCreateCommentInput(data: unknown): CreateCommentInput {
  return createCommentSchema.parse(data);
}

export function parseUpdateCommentInput(data: unknown): UpdateCommentInput {
  return updateCommentSchema.parse(data);
}

export function parseListCommentsQuery(data: unknown): ListCommentsQuery {
  return listCommentsQuerySchema.parse(data);
}

export function parseCommentRecord(data: unknown): CommentRecord {
  return commentRecordSchema.parse(data);
}

export function parseCommentListItem(data: unknown): CommentListItem {
  return commentListItemSchema.parse(data);
}
