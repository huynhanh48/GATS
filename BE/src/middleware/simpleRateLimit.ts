import type { NextFunction, Request, Response } from 'express';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';

type Bucket = { count: number; resetAt: number };

/**
 * Lightweight in-memory rate limit for public endpoints (e.g. leads).
 * Not shared across processes — fine for spam soft-guard on a single instance.
 */
export function simpleRateLimit(options: {
  windowMs: number;
  max: number;
  keyFn?: (req: Request) => string;
}) {
  const buckets = new Map<string, Bucket>();
  const keyFn =
    options.keyFn ??
    ((req: Request) =>
      String(req.ip || req.headers['x-forwarded-for'] || 'unknown'));

  return (req: Request, res: Response, next: NextFunction) => {
    const key = keyFn(req);
    const now = Date.now();
    let bucket = buckets.get(key);

    if (!bucket || now >= bucket.resetAt) {
      bucket = { count: 0, resetAt: now + options.windowMs };
      buckets.set(key, bucket);
    }

    bucket.count += 1;
    if (bucket.count > options.max) {
      const retryAfterSec = Math.max(
        1,
        Math.ceil((bucket.resetAt - now) / 1000),
      );
      res.setHeader('Retry-After', String(retryAfterSec));
      return res.status(HttpStatusCodes.TOO_MANY_REQUESTS).json({
        error: 'Too many requests. Please try again later.',
      });
    }

    return next();
  };
}
