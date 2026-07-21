import { NextFunction, Request, Response } from 'express';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';

/** Require authenticated user with admin role (not instructor). */
export function requireAdmin(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  if (!req.authUser) {
    throw new RouteError(HttpStatusCodes.UNAUTHORIZED, 'Unauthorized');
  }

  const roles = req.authUser.roles ?? [];
  if (!roles.includes('admin')) {
    throw new RouteError(HttpStatusCodes.FORBIDDEN, 'Forbidden');
  }

  return next();
}

export default requireAdmin;
