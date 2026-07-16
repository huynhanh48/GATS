import { NextFunction, Request, Response } from 'express';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import EnvVars, { NodeEnvs } from '@src/common/constants/env';
import { isOriginAllowed } from '@src/common/utils/cors';
import { RouteError } from '@src/common/utils/route-errors';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * CSRF mitigation for cookie-based auth:
 * Browser credentialed XHR/fetch always send Origin.
 * Reject mutating requests whose Origin is present but not allowlisted.
 * In production, also reject mutating requests with neither Origin nor Referer
 * matching the allowlist (reduces blind CSRF from non-browser agents).
 */
function originGuard(req: Request, _res: Response, next: NextFunction) {
  if (!MUTATING_METHODS.has(req.method.toUpperCase())) {
    return next();
  }

  // Payment webhooks (Sepay, etc.) have no browser Origin
  const path = req.path.replace(/\/+$/, '');
  if (
    path.endsWith('/payment/sepay/webhook') ||
    path.includes('/payment/sepay/webhook')
  ) {
    return next();
  }

  const origin = req.headers.origin;
  if (origin) {
    if (!isOriginAllowed(origin)) {
      throw new RouteError(HttpStatusCodes.FORBIDDEN, 'Origin not allowed');
    }
    return next();
  }

  if (EnvVars.NodeEnv === NodeEnvs.PRODUCTION) {
    const referer = req.headers.referer;
    if (typeof referer === 'string') {
      try {
        const refererOrigin = new URL(referer).origin;
        if (isOriginAllowed(refererOrigin)) {
          return next();
        }
      } catch {
        // invalid referer
      }
    }
    throw new RouteError(HttpStatusCodes.FORBIDDEN, 'Origin required');
  }

  // Dev/test: allow tools without Origin (curl, Postman, Jest)
  return next();
}

export default originGuard;
