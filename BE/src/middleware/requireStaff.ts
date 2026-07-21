import { NextFunction, Request, Response } from 'express';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';

const STAFF_ROLES = new Set(['admin', 'instructor']);

/** Require authenticated user with admin or instructor role. */
export function requireStaff(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  if (!req.authUser) {
    throw new RouteError(HttpStatusCodes.UNAUTHORIZED, 'Unauthorized');
  }

  const roles = req.authUser.roles ?? [];
  if (!roles.some((role) => STAFF_ROLES.has(role))) {
    throw new RouteError(HttpStatusCodes.FORBIDDEN, 'Forbidden');
  }

  return next();
}

export default requireStaff;
