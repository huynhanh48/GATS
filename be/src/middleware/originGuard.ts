import { NextFunction, Request, Response } from 'express';
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { isOriginAllowed } from '@src/common/utils/cors';
import { RouteError } from '@src/common/utils/route-errors';

/**
 * CSRF mitigation for browser mutations. Non-browser clients and signed
 * webhooks do not send Origin and are authenticated by their own credentials.
 */
function originGuard(req: Request, _res: Response, next: NextFunction) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const origin = req.get('origin');
  if (!origin || isOriginAllowed(origin)) {
    return next();
  }

  throw new RouteError(
    HttpStatusCodes.FORBIDDEN,
    'Request origin is not allowed',
  );
}

export default originGuard;
