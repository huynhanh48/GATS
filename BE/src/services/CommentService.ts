import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import type {
  CommentListItem,
  CommentRecord,
  CreateCommentInput,
  ListCommentsQuery,
  UpdateCommentInput,
} from '@src/models/Comment.model';
import * as CommentLikeRepo from '@src/repos/CommentLikeRepo';
import * as CommentRepo from '@src/repos/CommentRepo';
import PostService from '@src/services/PostService';

const Errors = {
  NOT_FOUND: 'Comment not found',
  FORBIDDEN: 'You do not have permission to modify this comment',
  INVALID_REPLY: 'Cannot reply to this comment',
} as const;

async function list(
  postId: string,
  query: ListCommentsQuery,
  userId?: number,
  isAuthenticated = false,
) {
  await PostService.assertPostReadableById(postId, userId, isAuthenticated);

  const includeHidden = userId
    ? await PostService.hasAdminUpdate(userId)
    : false;

  const { data, total } = await CommentRepo.findRootsByPostId(
    postId,
    query.page,
    query.limit,
    userId,
    includeHidden,
  );

  return {
    data,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit) || 0,
    },
  };
}

async function listReplies(
  postId: string,
  commentId: string,
  query: ListCommentsQuery,
  userId?: number,
  isAuthenticated = false,
) {
  await PostService.assertPostReadableById(postId, userId, isAuthenticated);

  const parent = await CommentRepo.findById(commentId);
  if (!parent || parent.postId !== postId || parent.parentId !== null) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }

  const includeHidden = userId
    ? await PostService.hasAdminUpdate(userId)
    : false;

  const { data, total } = await CommentRepo.findReplies(
    commentId,
    query.page,
    query.limit,
    userId,
    includeHidden,
  );

  return {
    data,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit) || 0,
    },
  };
}

async function create(
  postId: string,
  userId: number,
  input: CreateCommentInput,
  isAuthenticated: boolean,
): Promise<CommentRecord> {
  await PostService.assertPostReadableById(postId, userId, isAuthenticated);

  return CommentRepo.create({
    postId,
    userId,
    content: input.content,
    parentId: null,
  });
}

async function reply(
  postId: string,
  parentId: string,
  userId: number,
  input: CreateCommentInput,
  isAuthenticated: boolean,
): Promise<CommentRecord> {
  await PostService.assertPostReadableById(postId, userId, isAuthenticated);

  const parent = await CommentRepo.findById(parentId);
  if (
    !parent ||
    parent.postId !== postId ||
    parent.status === 'deleted' ||
    parent.parentId !== null
  ) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.INVALID_REPLY);
  }

  return CommentRepo.create({
    postId,
    userId,
    content: input.content,
    parentId,
  });
}

async function assertCanModify(
  comment: CommentRecord,
  userId: number,
): Promise<void> {
  const isOwner = comment.userId === userId;
  const isAdmin = await PostService.hasAdminUpdate(userId);

  if (!isOwner && !isAdmin) {
    throw new RouteError(HttpStatusCodes.FORBIDDEN, Errors.FORBIDDEN);
  }
}

async function update(
  postId: string,
  commentId: string,
  userId: number,
  input: UpdateCommentInput,
  isAuthenticated: boolean,
): Promise<CommentRecord> {
  await PostService.assertPostReadableById(postId, userId, isAuthenticated);

  const comment = await CommentRepo.findById(commentId);
  if (!comment || comment.postId !== postId || comment.status === 'deleted') {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }

  await assertCanModify(comment, userId);

  const isAdmin = await PostService.hasAdminUpdate(userId);
  const payload: {
    content?: string;
    status?: CommentRecord['status'];
  } = {};

  if (input.content !== undefined) {
    payload.content = input.content;
  }

  if (input.status !== undefined) {
    if (!isAdmin) {
      throw new RouteError(HttpStatusCodes.FORBIDDEN, Errors.FORBIDDEN);
    }
    payload.status = input.status;
  }

  const updated = await CommentRepo.update(commentId, payload);
  if (!updated) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }

  return updated;
}

async function remove(
  postId: string,
  commentId: string,
  userId: number,
  isAuthenticated: boolean,
) {
  await PostService.assertPostReadableById(postId, userId, isAuthenticated);

  const comment = await CommentRepo.findById(commentId);
  if (!comment || comment.postId !== postId || comment.status === 'deleted') {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }

  await assertCanModify(comment, userId);

  const deleted = await CommentRepo.softDelete(commentId);
  if (!deleted) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }

  return { message: 'Comment deleted' };
}

async function likeComment(
  postId: string,
  commentId: string,
  userId: number,
  isAuthenticated: boolean,
) {
  await PostService.assertPostReadableById(postId, userId, isAuthenticated);

  const belongs = await CommentRepo.belongsToPost(commentId, postId);
  if (!belongs) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }

  await CommentLikeRepo.like(commentId, userId);
  return { liked: true };
}

async function unlikeComment(
  postId: string,
  commentId: string,
  userId: number,
  isAuthenticated: boolean,
) {
  await PostService.assertPostReadableById(postId, userId, isAuthenticated);

  const belongs = await CommentRepo.belongsToPost(commentId, postId);
  if (!belongs) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }

  await CommentLikeRepo.unlike(commentId, userId);
  return { liked: false };
}

export default {
  Errors,
  list,
  listReplies,
  create,
  reply,
  update,
  remove,
  likeComment,
  unlikeComment,
};

export type { CommentListItem };
