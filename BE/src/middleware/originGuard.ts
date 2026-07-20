import { NextFunction, Request, Response } from 'express';

/**
 * CSRF mitigation disabled: allow all Origins (temporary open policy).
 * Mutating requests from any browser Origin are accepted.
 * Payment webhooks and non-browser clients (no Origin) still pass.
 */
function originGuard(_req: Request, _res: Response, next: NextFunction) {
  return next();
}

export default originGuard;
