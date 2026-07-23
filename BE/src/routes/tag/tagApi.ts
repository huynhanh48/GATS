import { NextFunction, Request, Response, Router } from 'express';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import TagPaths from '@src/common/paths/tag';
import { RouteError } from '@src/common/utils/route-errors';
import { RESOURCE_TYPES } from '@src/db/schema/constants';
import authMiddleware from '@src/middleware/authMiddleware';
import optionalAuthMiddleware from '@src/middleware/optionalAuthMiddleware';
import requirePermission from '@src/middleware/requirePermission';
import { errorHandle } from '@src/middleware/errorHandle';
import authorizationService from '@src/services/AuthorizationService';
import tagHandlers from './tagRouter';

const apiRouter = Router();
const tagRouter = Router();

async function requireTagCreatePermission(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const user = req.authUser;
  if (!user) {
    throw new RouteError(HttpStatusCodes.UNAUTHORIZED, 'Unauthorized');
  }

  const type = req.body?.type;
  if (type === 'global') {
    if (!user.roles.includes('admin')) {
      throw new RouteError(HttpStatusCodes.FORBIDDEN, 'Forbidden');
    }
    return next();
  }

  const resourceType =
    type === 'course'
      ? RESOURCE_TYPES.COURSE
      : type === 'post'
        ? RESOURCE_TYPES.POST
        : undefined;
  if (!resourceType) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, 'Invalid tag type');
  }

  const allowed = await authorizationService.canPerform({
    userId: user.id,
    action: 'update',
    resourceType,
  });
  if (!allowed) {
    throw new RouteError(HttpStatusCodes.FORBIDDEN, 'Forbidden');
  }
  return next();
}

tagRouter.get(
  TagPaths.Tag.List,
  errorHandle(optionalAuthMiddleware),
  tagHandlers.list,
);

tagRouter.post(
  TagPaths.Tag.Create,
  errorHandle(authMiddleware),
  errorHandle(requireTagCreatePermission),
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
