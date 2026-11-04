import { Router } from 'express';
import { errorHandle } from '@src/middleware/errorHandle';
import authMiddleware from '@src/middleware/authMiddleware';
import {
  authenticatedUserRateKey,
  redisRateLimit,
} from '@src/middleware/redisRateLimit';
import aiCoachHandlers from './aiCoachRouter';

const apiRouter = Router();
const aiChatLimit = redisRateLimit({
  keyPrefix: 'ai:chat',
  windowMs: 10 * 60 * 1000,
  max: 30,
  keyFn: authenticatedUserRateKey,
});

apiRouter.post(
  '/chat',
  errorHandle(authMiddleware),
  errorHandle(aiChatLimit),
  errorHandle(aiCoachHandlers.chat)
);

apiRouter.get(
  '/',
  errorHandle(authMiddleware),
  errorHandle(aiCoachHandlers.getSessions)
);

apiRouter.post(
  '/',
  errorHandle(authMiddleware),
  errorHandle(aiCoachHandlers.createSession)
);

apiRouter.get(
  '/:id',
  errorHandle(authMiddleware),
  errorHandle(aiCoachHandlers.getSessionDetails)
);

apiRouter.put(
  '/:id',
  errorHandle(authMiddleware),
  errorHandle(aiCoachHandlers.updateSession)
);

apiRouter.delete(
  '/:id',
  errorHandle(authMiddleware),
  errorHandle(aiCoachHandlers.deleteSession)
);

apiRouter.post(
  '/:id/messages',
  errorHandle(authMiddleware),
  errorHandle(aiCoachHandlers.addMessage)
);

export default apiRouter;
