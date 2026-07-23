import { Router } from 'express';

import CourseChatPaths from '@src/common/paths/course-chat';
import authMiddleware from '@src/middleware/authMiddleware';
import { errorHandle } from '@src/middleware/errorHandle';
import handlers from './courseChatRouter';

const apiRouter = Router({ mergeParams: true });

apiRouter.get(
  CourseChatPaths.Messages,
  errorHandle(authMiddleware),
  handlers.listMessages,
);
apiRouter.post(
  CourseChatPaths.Messages,
  errorHandle(authMiddleware),
  handlers.sendMessage,
);
apiRouter.patch(
  CourseChatPaths.Pin,
  errorHandle(authMiddleware),
  handlers.pinMessage,
);
apiRouter.delete(
  CourseChatPaths.Message,
  errorHandle(authMiddleware),
  handlers.deleteMessage,
);

export default apiRouter;
