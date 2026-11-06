import { Request, Response } from 'express';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { getRouteParam } from '@src/common/utils/route-params';
import { errorHandle } from '@src/middleware/errorHandle';
import {
  parseCreateCommentInput,
  parseListCommentsQuery,
  parseUpdateCommentInput,
} from '@src/models/Comment.model';
import {
  parseCreatePostInput,
  parseListPostsQuery,
  parseUpdatePostInput,
} from '@src/models/Post.model';
import {
  parseCreateTagInput,
  parseUpdateTagInput,
} from '@src/models/Tag.model';
import CommentService from '@src/services/CommentService';
import PostService from '@src/services/PostService';
import TagService from '@src/services/TagService';

function isAuthenticated(req: Request): boolean {
  return req.authUser !== undefined;
}

function authUserId(req: Request): number {
  if (!req.authUser) {
    throw new Error('Expected authenticated user');
  }
  return req.authUser.id;
}

async function listTags(_req: Request, res: Response) {
  const result = await TagService.list({ type: 'post' });
  const data = result.data.map((item) => ({
    id: item.id,
    name: item.name,
    slug: item.slug,
    postCount: item.postCount,
  }));
  return res.status(HttpStatusCodes.OK).json({ data });
}

async function createTag(req: Request, res: Response) {
  const input = parseCreateTagInput({ ...req.body, type: req.body.type ?? 'post' });
  const tag = await TagService.create(input);
  return res.status(HttpStatusCodes.CREATED).json({ tag });
}

async function updateTag(req: Request, res: Response) {
  const input = parseUpdateTagInput(req.body);
  const tag = await TagService.update(getRouteParam(req.params.tagId), input);
  return res.status(HttpStatusCodes.OK).json({ tag });
}

async function removeTag(req: Request, res: Response) {
  const result = await TagService.remove(getRouteParam(req.params.tagId));
  return res.status(HttpStatusCodes.OK).json(result);
}

async function list(req: Request, res: Response) {
  const query = parseListPostsQuery(req.query);
  const result = await PostService.list(
    query,
    req.authUser?.id,
    isAuthenticated(req),
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function getBySlug(req: Request, res: Response) {
  const post = await PostService.getBySlug(
    getRouteParam(req.params.slug),
    req.authUser?.id,
    isAuthenticated(req),
  );
  return res.status(HttpStatusCodes.OK).json({ post });
}

async function getById(req: Request, res: Response) {
  const post = await PostService.getById(
    getRouteParam(req.params.postId),
    req.authUser?.id,
    isAuthenticated(req),
  );
  return res.status(HttpStatusCodes.OK).json({ post });
}

async function create(req: Request, res: Response) {
  const input = parseCreatePostInput(req.body);
  const post = await PostService.create(input, authUserId(req));
  return res.status(HttpStatusCodes.CREATED).json({ post });
}

async function update(req: Request, res: Response) {
  const input = parseUpdatePostInput(req.body);
  const post = await PostService.update(
    getRouteParam(req.params.postId),
    input,
  );
  return res.status(HttpStatusCodes.OK).json({ post });
}

async function publish(req: Request, res: Response) {
  const post = await PostService.publish(getRouteParam(req.params.postId));
  return res.status(HttpStatusCodes.OK).json({ post });
}

async function unpublish(req: Request, res: Response) {
  const post = await PostService.unpublish(getRouteParam(req.params.postId));
  return res.status(HttpStatusCodes.OK).json({ post });
}

async function archive(req: Request, res: Response) {
  const post = await PostService.archive(getRouteParam(req.params.postId));
  return res.status(HttpStatusCodes.OK).json({ post });
}

async function remove(req: Request, res: Response) {
  const mode =
    req.query.mode === 'hard' ? ('hard' as const) : ('soft' as const);
  const result = await PostService.remove(
    getRouteParam(req.params.postId),
    authUserId(req),
    mode,
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function restore(req: Request, res: Response) {
  const post = await PostService.restore(getRouteParam(req.params.postId));
  return res.status(HttpStatusCodes.OK).json({ post });
}

async function likePost(req: Request, res: Response) {
  const result = await PostService.likePost(
    getRouteParam(req.params.postId),
    authUserId(req),
    isAuthenticated(req),
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function unlikePost(req: Request, res: Response) {
  const result = await PostService.unlikePost(
    getRouteParam(req.params.postId),
    authUserId(req),
    isAuthenticated(req),
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function listComments(req: Request, res: Response) {
  const query = parseListCommentsQuery(req.query);
  const result = await CommentService.list(
    getRouteParam(req.params.postId),
    query,
    req.authUser?.id,
    isAuthenticated(req),
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function createComment(req: Request, res: Response) {
  const input = parseCreateCommentInput(req.body);
  const comment = await CommentService.create(
    getRouteParam(req.params.postId),
    req.authUser?.id,
    input,
    isAuthenticated(req),
  );
  return res.status(HttpStatusCodes.CREATED).json({ comment });
}

async function listReplies(req: Request, res: Response) {
  const query = parseListCommentsQuery(req.query);
  const result = await CommentService.listReplies(
    getRouteParam(req.params.postId),
    getRouteParam(req.params.commentId),
    query,
    req.authUser?.id,
    isAuthenticated(req),
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function replyComment(req: Request, res: Response) {
  const input = parseCreateCommentInput(req.body);
  const comment = await CommentService.reply(
    getRouteParam(req.params.postId),
    getRouteParam(req.params.commentId),
    req.authUser?.id,
    input,
    isAuthenticated(req),
  );
  return res.status(HttpStatusCodes.CREATED).json({ comment });
}

async function updateComment(req: Request, res: Response) {
  const input = parseUpdateCommentInput(req.body);
  const comment = await CommentService.update(
    getRouteParam(req.params.postId),
    getRouteParam(req.params.commentId),
    authUserId(req),
    input,
    isAuthenticated(req),
  );
  return res.status(HttpStatusCodes.OK).json({ comment });
}

async function removeComment(req: Request, res: Response) {
  const result = await CommentService.remove(
    getRouteParam(req.params.postId),
    getRouteParam(req.params.commentId),
    authUserId(req),
    isAuthenticated(req),
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function likeComment(req: Request, res: Response) {
  const result = await CommentService.likeComment(
    getRouteParam(req.params.postId),
    getRouteParam(req.params.commentId),
    authUserId(req),
    isAuthenticated(req),
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function unlikeComment(req: Request, res: Response) {
  const result = await CommentService.unlikeComment(
    getRouteParam(req.params.postId),
    getRouteParam(req.params.commentId),
    authUserId(req),
    isAuthenticated(req),
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

export default {
  list: errorHandle(list),
  getBySlug: errorHandle(getBySlug),
  getById: errorHandle(getById),
  create: errorHandle(create),
  update: errorHandle(update),
  publish: errorHandle(publish),
  unpublish: errorHandle(unpublish),
  archive: errorHandle(archive),
  remove: errorHandle(remove),
  restore: errorHandle(restore),
  likePost: errorHandle(likePost),
  unlikePost: errorHandle(unlikePost),
  listComments: errorHandle(listComments),
  createComment: errorHandle(createComment),
  listReplies: errorHandle(listReplies),
  replyComment: errorHandle(replyComment),
  updateComment: errorHandle(updateComment),
  removeComment: errorHandle(removeComment),
  likeComment: errorHandle(likeComment),
  unlikeComment: errorHandle(unlikeComment),
  listTags: errorHandle(listTags),
  createTag: errorHandle(createTag),
  updateTag: errorHandle(updateTag),
  removeTag: errorHandle(removeTag),
} as const;
