import { Router } from 'express';

import CategoryPaths from '@src/common/paths/category';
import authMiddleware from '@src/middleware/authMiddleware';
import { errorHandle } from '@src/middleware/errorHandle';
import optionalAuthMiddleware from '@src/middleware/optionalAuthMiddleware';
import requireCategoryWritePermission from '@src/middleware/requireCategoryWritePermission';

import categoryHandlers from './categoryRouter';

const apiRouter = Router();
const categoryRouter = Router();

categoryRouter.get(
  CategoryPaths.Category.List,
  errorHandle(optionalAuthMiddleware),
  categoryHandlers.list,
);

categoryRouter.post(
  CategoryPaths.Category.Create,
  errorHandle(authMiddleware),
  errorHandle(requireCategoryWritePermission()),
  categoryHandlers.create,
);

categoryRouter.put(
  CategoryPaths.Category.Reorder,
  errorHandle(authMiddleware),
  errorHandle(requireCategoryWritePermission()),
  categoryHandlers.reorder,
);

categoryRouter.patch(
  CategoryPaths.Category.Update,
  errorHandle(authMiddleware),
  errorHandle(requireCategoryWritePermission()),
  categoryHandlers.update,
);

categoryRouter.delete(
  CategoryPaths.Category.Delete,
  errorHandle(authMiddleware),
  errorHandle(requireCategoryWritePermission()),
  categoryHandlers.remove,
);

apiRouter.use(CategoryPaths.Category._, categoryRouter);
export default apiRouter;
