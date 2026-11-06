import type { NextFunction, Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';

const { evalMock } = vi.hoisted(() => ({ evalMock: vi.fn() }));

vi.mock('@src/libs/redis.client', () => ({
  createRateLimitRedisConnection: () => ({
    eval: evalMock,
    on: vi.fn(),
  }),
}));

import { redisRateLimit } from '@src/middleware/redisRateLimit';

function responseDouble() {
  const headers = new Map<string, string>();
  const res = {
    statusCode: 200,
    body: undefined as unknown,
    setHeader(name: string, value: string) {
      headers.set(name, value);
      return this;
    },
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(body: unknown) {
      this.body = body;
      return this;
    },
  };
  return { res: res as unknown as Response, state: res, headers };
}

describe('redisRateLimit', () => {
  it('returns 429 with retry metadata after the shared quota is exhausted', async () => {
    evalMock
      .mockResolvedValueOnce([1, 60_000])
      .mockResolvedValueOnce([3, 42_000]);
    const middleware = redisRateLimit({
      keyPrefix: 'test',
      windowMs: 60_000,
      max: 2,
    });
    const req = {
      ip: '203.0.113.10',
      socket: {},
    } as Request;

    const first = responseDouble();
    const firstNext = vi.fn() as NextFunction;
    await middleware(req, first.res, firstNext);
    expect(firstNext).toHaveBeenCalledOnce();
    expect(first.headers.get('RateLimit-Remaining')).toBe('1');

    const blocked = responseDouble();
    const blockedNext = vi.fn() as NextFunction;
    await middleware(req, blocked.res, blockedNext);
    expect(blockedNext).not.toHaveBeenCalled();
    expect(blocked.state.statusCode).toBe(429);
    expect(blocked.headers.get('Retry-After')).toBe('42');
  });
});
