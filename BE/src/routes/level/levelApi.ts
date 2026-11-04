import { Router } from 'express';

import LevelPaths from '@src/common/paths/level';
import { RESOURCE_TYPES } from '@src/db/schema/constants';
import authMiddleware from '@src/middleware/authMiddleware';
import { errorHandle } from '@src/middleware/errorHandle';
import optionalAuthMiddleware from '@src/middleware/optionalAuthMiddleware';
import requirePermission from '@src/middleware/requirePermission';

import handlers from './levelRouter';

const router = Router();
router.get(LevelPaths.List, errorHandle(optionalAuthMiddleware), errorHandle(handlers.list));
router.patch(
  LevelPaths.Update,
  errorHandle(authMiddleware),
  errorHandle(requirePermission('update', RESOURCE_TYPES.COURSE)),
  errorHandle(handlers.update),
);

const apiRouter = Router();
apiRouter.use(LevelPaths._, router);
export default apiRouter;
