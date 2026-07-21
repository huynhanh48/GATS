import { Router } from 'express';

import ModerationPaths from '@src/common/paths/moderation';
import authMiddleware from '@src/middleware/authMiddleware';
import { errorHandle } from '@src/middleware/errorHandle';
import requireStaff from '@src/middleware/requireStaff';
import handlers from './moderationRouter';

const apiRouter = Router();
const moderationRouter = Router();

moderationRouter.get(
  ModerationPaths.Moderation.Queue,
  errorHandle(authMiddleware),
  errorHandle(requireStaff),
  handlers.listQueue,
);

moderationRouter.patch(
  ModerationPaths.Moderation.UpdateStatus,
  errorHandle(authMiddleware),
  errorHandle(requireStaff),
  handlers.updateStatus,
);

apiRouter.use(ModerationPaths.Moderation._, moderationRouter);
export default apiRouter;
