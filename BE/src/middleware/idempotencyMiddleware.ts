import type { NextFunction, Request, Response } from 'express';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import * as IdempotencyRepo from '@src/repos/IdempotencyRepo';

/**
 * Requires authMiddleware first. Replays stored responses for Idempotency-Key.
 */
export function idempotencyMiddleware(routeName?: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const keyHeader = req.get('idempotency-key')?.trim();
    if (!keyHeader) {
      return next();
    }
    if (!req.authUser) {
      throw new RouteError(HttpStatusCodes.UNAUTHORIZED, 'Unauthorized');
    }
    if (keyHeader.length > 128) {
      throw new RouteError(
        HttpStatusCodes.BAD_REQUEST,
        'Idempotency-Key too long',
        'IDEMPOTENCY_KEY_INVALID',
      );
    }

    const route =
      routeName ?? `${req.method}:${req.baseUrl}${req.path}`.slice(0, 255);
    const requestHash = IdempotencyRepo.hashRequestPayload({
      body: req.body ?? null,
      query: req.query ?? null,
    });

    const existing = await IdempotencyRepo.find(
      req.authUser.id,
      keyHeader,
      route,
    );
    if (existing) {
      if (existing.requestHash !== requestHash) {
        throw new RouteError(
          HttpStatusCodes.CONFLICT,
          'Idempotency-Key already used with a different payload',
          'IDEMPOTENCY_KEY_REUSED',
        );
      }
      return res.status(existing.responseStatus).json(existing.responseBody);
    }

    const originalJson = res.json.bind(res);
    res.json = ((body: unknown) => {
      const status = res.statusCode || 200;
      if (status >= 200 && status < 300) {
        void IdempotencyRepo.save({
          userId: req.authUser!.id,
          key: keyHeader,
          route,
          requestHash,
          responseStatus: status,
          responseBody: body,
        });
      }
      return originalJson(body);
    }) as typeof res.json;

    return next();
  };
}

export default idempotencyMiddleware;
