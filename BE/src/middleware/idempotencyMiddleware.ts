import type { NextFunction, Request, Response } from 'express';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import * as IdempotencyRepo from '@src/repos/IdempotencyRepo';

const POLL_MS = 50;
const POLL_ATTEMPTS = 40; // ~2s

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Requires authMiddleware first. Reserves Idempotency-Key before handler runs.
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
    const userId = req.authUser.id;

    let outcome = await IdempotencyRepo.tryReserve({
      userId,
      key: keyHeader,
      route,
      requestHash,
    });

    if (outcome.kind === 'hash_mismatch') {
      throw new RouteError(
        HttpStatusCodes.CONFLICT,
        'Idempotency-Key already used with a different payload',
        'IDEMPOTENCY_KEY_REUSED',
      );
    }

    if (outcome.kind === 'replay') {
      return res
        .status(outcome.row.responseStatus)
        .json(outcome.row.responseBody);
    }

    if (outcome.kind === 'in_progress') {
      for (let i = 0; i < POLL_ATTEMPTS; i++) {
        await sleep(POLL_MS);
        const again = await IdempotencyRepo.find(userId, keyHeader, route);
        if (
          again &&
          again.status === 'completed' &&
          again.responseStatus >= 200
        ) {
          if (again.requestHash !== requestHash) {
            throw new RouteError(
              HttpStatusCodes.CONFLICT,
              'Idempotency-Key already used with a different payload',
              'IDEMPOTENCY_KEY_REUSED',
            );
          }
          return res.status(again.responseStatus).json(again.responseBody);
        }
        if (!again || again.status !== 'in_progress') {
          outcome = await IdempotencyRepo.tryReserve({
            userId,
            key: keyHeader,
            route,
            requestHash,
          });
          if (outcome.kind === 'reserved') break;
          if (outcome.kind === 'replay') {
            return res
              .status(outcome.row.responseStatus)
              .json(outcome.row.responseBody);
          }
          if (outcome.kind === 'hash_mismatch') {
            throw new RouteError(
              HttpStatusCodes.CONFLICT,
              'Idempotency-Key already used with a different payload',
              'IDEMPOTENCY_KEY_REUSED',
            );
          }
        }
      }
      if (outcome.kind !== 'reserved') {
        throw new RouteError(
          HttpStatusCodes.CONFLICT,
          'Idempotency-Key request still in progress',
          'IDEMPOTENCY_KEY_IN_PROGRESS',
          true,
        );
      }
    }

    const originalJson = res.json.bind(res);
    let settled = false;
    res.json = ((body: unknown) => {
      const status = res.statusCode || 200;
      if (!settled && status >= 200 && status < 300) {
        settled = true;
        void IdempotencyRepo.complete({
          userId,
          key: keyHeader,
          route,
          responseStatus: status,
          responseBody: body,
        });
      } else if (!settled && status >= 400) {
        settled = true;
        void IdempotencyRepo.release(userId, keyHeader, route);
      }
      return originalJson(body);
    }) as typeof res.json;

    res.on('finish', () => {
      if (!settled && res.statusCode >= 400) {
        settled = true;
        void IdempotencyRepo.release(userId, keyHeader, route);
      }
    });

    return next();
  };
}

export default idempotencyMiddleware;
