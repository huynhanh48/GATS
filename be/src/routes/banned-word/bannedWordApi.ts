import { Router } from 'express';

import BannedWordPaths from '@src/common/paths/banned-word';
import authMiddleware from '@src/middleware/authMiddleware';
import { errorHandle } from '@src/middleware/errorHandle';
import requireStaff from '@src/middleware/requireStaff';
import handlers from './bannedWordRouter';

const apiRouter = Router();
const bannedWordRouter = Router();

bannedWordRouter.get(
  BannedWordPaths.BannedWord.List,
  errorHandle(authMiddleware),
  errorHandle(requireStaff),
  handlers.list,
);

bannedWordRouter.post(
  BannedWordPaths.BannedWord.Create,
  errorHandle(authMiddleware),
  errorHandle(requireStaff),
  handlers.create,
);

bannedWordRouter.patch(
  BannedWordPaths.BannedWord.Update,
  errorHandle(authMiddleware),
  errorHandle(requireStaff),
  handlers.update,
);

bannedWordRouter.delete(
  BannedWordPaths.BannedWord.Delete,
  errorHandle(authMiddleware),
  errorHandle(requireStaff),
  handlers.remove,
);

apiRouter.use(BannedWordPaths.BannedWord._, bannedWordRouter);
export default apiRouter;
