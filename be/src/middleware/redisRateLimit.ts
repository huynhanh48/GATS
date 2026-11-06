import type { NextFunction, Request, Response } from 'express';
import type IORedis from 'ioredis';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { createRateLimitRedisConnection } from '@src/libs/redis.client';

type RateLimitOptions = {
  keyPrefix: string;
  windowMs: number;
  max: number;
  keyFn?: (req: Request) => string;
};

const INCREMENT_SCRIPT = `
local count = redis.call('INCR', KEYS[1])
if count == 1 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
end
local ttl = redis.call('PTTL', KEYS[1])
return {count, ttl}
`;

let redis: IORedis | undefined;

function getRedis(): IORedis {
  if (!redis) {
    redis = createRateLimitRedisConnection();
    redis.on('error', () => undefined);
  }
  return redis;
}

function clientIp(req: Request): string {
  return String(req.ip || req.socket.remoteAddress || 'unknown');
}

function safeKeyPart(value: string): string {
  return Buffer.from(value).toString('base64url');
}

export function redisRateLimit(options: RateLimitOptions) {
  const keyFn = options.keyFn ?? clientIp;

  return async (req: Request, res: Response, next: NextFunction) => {
    const key = `rate-limit:${options.keyPrefix}:${safeKeyPart(keyFn(req))}`;

    try {
      const result = (await getRedis().eval(
        INCREMENT_SCRIPT,
        1,
        key,
        String(options.windowMs),
      )) as [number, number];
      const count = Number(result[0]);
      const ttlMs = Math.max(0, Number(result[1]));
      const retryAfterSec = Math.max(1, Math.ceil(ttlMs / 1000));

      res.setHeader('RateLimit-Limit', String(options.max));
      res.setHeader(
        'RateLimit-Remaining',
        String(Math.max(0, options.max - count)),
      );
      res.setHeader('RateLimit-Reset', String(retryAfterSec));

      if (count > options.max) {
        res.setHeader('Retry-After', String(retryAfterSec));
        return res.status(HttpStatusCodes.TOO_MANY_REQUESTS).json({
          error: 'Too many requests. Please try again later.',
        });
      }
    } catch {
      // Keep auth and AI available during a short Redis outage.
    }

    return next();
  };
}

export function authenticatedUserRateKey(req: Request): string {
  return req.authUser ? `user:${req.authUser.id}` : `ip:${clientIp(req)}`;
}
