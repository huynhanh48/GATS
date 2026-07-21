import { Router } from 'express';

import NotificationPaths from '@src/common/paths/notification';
import authMiddleware from '@src/middleware/authMiddleware';
import { errorHandle } from '@src/middleware/errorHandle';
import requireAdmin from '@src/middleware/requireAdmin';
import handlers from './notificationRouter';

const apiRouter = Router();
const notificationRouter = Router();

notificationRouter.get(
  NotificationPaths.Notification.List,
  errorHandle(authMiddleware),
  handlers.list,
);

notificationRouter.post(
  NotificationPaths.Notification.MarkRead,
  errorHandle(authMiddleware),
  handlers.markRead,
);

/** Registered before nothing conflicting — literal path, no params. */
notificationRouter.post(
  NotificationPaths.Notification.Compose,
  errorHandle(authMiddleware),
  errorHandle(requireAdmin),
  handlers.compose,
);

apiRouter.use(NotificationPaths.Notification._, notificationRouter);
export default apiRouter;
