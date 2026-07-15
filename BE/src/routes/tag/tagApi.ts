import { Router } from 'express';

import TagPaths from '@src/common/paths/tag';
import { RESOURCE_TYPES } from '@src/db/schema/constants';
import authMiddleware from '@src/middleware/authMiddleware';
import optionalAuthMiddleware from '@src/middleware/optionalAuthMiddleware';
import requirePermission from '@src/middleware/requirePermission';
import { errorHandle } from '@src/middleware/errorHandle';
import tagHandlers from './tagRouter';

const apiRouter = Router();
const tagRouter = Router();

tagRouter.get(
  TagPaths.Tag.List,
  errorHandle(optionalAuthMiddleware),
  tagHandlers.list,
);

tagRouter.post(
  TagPaths.Tag.Create,
  errorHandle(authMiddleware),
  errorHandle(requirePermission('update', RESOURCE_TYPES.POST)),
  tagHandlers.create,
);

tagRouter.patch(
  TagPaths.Tag.Update,
  errorHandle(authMiddleware),
  errorHandle(requirePermission('update', RESOURCE_TYPES.POST)),
  tagHandlers.update,
);

tagRouter.delete(
  TagPaths.Tag.Delete,
  errorHandle(authMiddleware),
  errorHandle(requirePermission('update', RESOURCE_TYPES.POST)),
  tagHandlers.remove,
);

apiRouter.use(TagPaths.Tag._, tagRouter);
export default apiRouter;
