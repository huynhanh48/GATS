import { Router } from 'express';

import PostPaths from '@src/common/paths/post';
import { RESOURCE_TYPES } from '@src/db/schema/constants';
import authMiddleware from '@src/middleware/authMiddleware';
import optionalAuthMiddleware from '@src/middleware/optionalAuthMiddleware';
import requirePermission from '@src/middleware/requirePermission';
import { errorHandle } from '@src/middleware/errorHandle';
import idempotencyMiddleware from '@src/middleware/idempotencyMiddleware';
import postHandlers from './postRouter';

const apiRouter = Router();
const postRouter = Router();

postRouter.get(
  PostPaths.Post.List,
  errorHandle(optionalAuthMiddleware),
  postHandlers.list,
);

postRouter.get(
  PostPaths.Post.Tags.List,
  errorHandle(optionalAuthMiddleware),
  postHandlers.listTags,
);

postRouter.post(
  PostPaths.Post.Tags.Create,
  errorHandle(authMiddleware),
  errorHandle(requirePermission('update', RESOURCE_TYPES.POST)),
  postHandlers.createTag,
);

postRouter.patch(
  PostPaths.Post.Tags.Update,
  errorHandle(authMiddleware),
  errorHandle(requirePermission('update', RESOURCE_TYPES.POST)),
  postHandlers.updateTag,
);

postRouter.delete(
  PostPaths.Post.Tags.Delete,
  errorHandle(authMiddleware),
  errorHandle(requirePermission('update', RESOURCE_TYPES.POST)),
  postHandlers.removeTag,
);

postRouter.get(
  PostPaths.Post.GetBySlug,
  errorHandle(optionalAuthMiddleware),
  postHandlers.getBySlug,
);

postRouter.get(
  PostPaths.Post.Get,
  errorHandle(optionalAuthMiddleware),
  postHandlers.getById,
);

postRouter.post(
  PostPaths.Post.Create,
  errorHandle(authMiddleware),
  errorHandle(requirePermission('create', RESOURCE_TYPES.POST)),
  postHandlers.create,
);

postRouter.patch(
  PostPaths.Post.Publish,
  errorHandle(authMiddleware),
  errorHandle(requirePermission('update', RESOURCE_TYPES.POST)),
  postHandlers.publish,
);

postRouter.patch(
  PostPaths.Post.Unpublish,
  errorHandle(authMiddleware),
  errorHandle(requirePermission('update', RESOURCE_TYPES.POST)),
  postHandlers.unpublish,
);

postRouter.patch(
  PostPaths.Post.Archive,
  errorHandle(authMiddleware),
  errorHandle(requirePermission('update', RESOURCE_TYPES.POST)),
  postHandlers.archive,
);

postRouter.post(
  PostPaths.Post.Like,
  errorHandle(authMiddleware),
  postHandlers.likePost,
);

postRouter.delete(
  PostPaths.Post.Like,
  errorHandle(authMiddleware),
  postHandlers.unlikePost,
);

postRouter.get(
  PostPaths.Post.Comments.List,
  errorHandle(optionalAuthMiddleware),
  postHandlers.listComments,
);

postRouter.post(
  PostPaths.Post.Comments.Create,
  errorHandle(authMiddleware),
  errorHandle(idempotencyMiddleware('comment.create')),
  postHandlers.createComment,
);

postRouter.get(
  PostPaths.Post.Comments.Replies,
  errorHandle(optionalAuthMiddleware),
  postHandlers.listReplies,
);

postRouter.post(
  PostPaths.Post.Comments.Replies,
  errorHandle(authMiddleware),
  errorHandle(idempotencyMiddleware('comment.reply')),
  postHandlers.replyComment,
);

postRouter.patch(
  PostPaths.Post.Comments.Update,
  errorHandle(authMiddleware),
  postHandlers.updateComment,
);

postRouter.delete(
  PostPaths.Post.Comments.Delete,
  errorHandle(authMiddleware),
  postHandlers.removeComment,
);

postRouter.post(
  PostPaths.Post.Comments.Like,
  errorHandle(authMiddleware),
  postHandlers.likeComment,
);

postRouter.delete(
  PostPaths.Post.Comments.Like,
  errorHandle(authMiddleware),
  postHandlers.unlikeComment,
);

postRouter.patch(
  PostPaths.Post.Update,
  errorHandle(authMiddleware),
  errorHandle(requirePermission('update', RESOURCE_TYPES.POST)),
  postHandlers.update,
);

postRouter.post(
  PostPaths.Post.Restore,
  errorHandle(authMiddleware),
  errorHandle(requirePermission('delete', RESOURCE_TYPES.POST)),
  postHandlers.restore,
);

postRouter.delete(
  PostPaths.Post.Delete,
  errorHandle(authMiddleware),
  errorHandle(requirePermission('delete', RESOURCE_TYPES.POST)),
  postHandlers.remove,
);

apiRouter.use(PostPaths.Post._, postRouter);
export default apiRouter;
