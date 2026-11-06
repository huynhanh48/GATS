import { NextFunction, Request, Response } from 'express';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import type { PermissionAction } from '@src/db/schema/permission';
import authorizationService from '@src/services/AuthorizationService';

type ResourceIdResolver = (
  req: Request,
) => string | undefined;

function resolveResourceIdFromParams(req: Request): string | undefined {
  const raw = req.params.id ?? req.params.resourceId;
  return typeof raw === 'string' ? raw : undefined;
}

export function requirePermission(
  action: PermissionAction,
  resourceType: string,
  resolveResourceId: ResourceIdResolver = resolveResourceIdFromParams,
) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.authUser) {
      throw new RouteError(HttpStatusCodes.UNAUTHORIZED, 'Unauthorized');
    }

    const allowed = await authorizationService.canPerform({
      userId: req.authUser.id,
      action,
      resourceType,
      resourceId: resolveResourceId(req),
    });

    if (!allowed) {
      throw new RouteError(HttpStatusCodes.FORBIDDEN, 'Forbidden');
    }

    return next();
  };
}

export default requirePermission;
