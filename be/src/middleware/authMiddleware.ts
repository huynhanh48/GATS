import { NextFunction, Request, Response } from 'express';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { getAccessTokenFromRequest } from '@src/common/utils/cookies';
import { RouteError } from '@src/common/utils/route-errors';
import AuthService from '@src/services/AuthService';

const BEARER_PREFIX = 'Bearer ';

function getBearerToken(req: Request): string | undefined {
  const header = req.headers.authorization;
  if (!header?.startsWith(BEARER_PREFIX)) return undefined;
  return header.slice(BEARER_PREFIX.length);
}

async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const token = getAccessTokenFromRequest(req) ?? getBearerToken(req);

  if (!token) {
    throw new RouteError(HttpStatusCodes.UNAUTHORIZED, 'Unauthorized');
  }

  req.authUser = await AuthService.authenticate(token);
  return next();
}

export default authMiddleware;
