import { NextFunction, Request, Response } from 'express';

import { getAccessTokenFromRequest } from '@src/common/utils/cookies';
import AuthService from '@src/services/AuthService';

const BEARER_PREFIX = 'Bearer ';

function getBearerToken(req: Request): string | undefined {
  const header = req.headers.authorization;
  if (!header?.startsWith(BEARER_PREFIX)) return undefined;
  return header.slice(BEARER_PREFIX.length);
}

async function optionalAuthMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const token = getAccessTokenFromRequest(req) ?? getBearerToken(req);
  if (token) {
    try {
      req.authUser = await AuthService.authenticate(token);
    } catch {
      req.authUser = undefined;
    }
  }
  return next();
}

export default optionalAuthMiddleware;
