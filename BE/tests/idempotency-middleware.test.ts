import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockTryReserve, mockFind, mockComplete, mockRelease, mockHash } =
  vi.hoisted(() => ({
    mockTryReserve: vi.fn(),
    mockFind: vi.fn(),
    mockComplete: vi.fn(),
    mockRelease: vi.fn(),
    mockHash: vi.fn(() => 'hash-a'),
  }));

vi.mock('@src/repos/IdempotencyRepo', () => ({
  hashRequestPayload: () => mockHash(),
  tryReserve: (...args: unknown[]) => mockTryReserve(...args),
  find: (...args: unknown[]) => mockFind(...args),
  complete: (...args: unknown[]) => mockComplete(...args),
  release: (...args: unknown[]) => mockRelease(...args),
}));

import type { Request, Response } from 'express';
import idempotencyMiddleware from '@src/middleware/idempotencyMiddleware';

function mockRes() {
  const res = {
    statusCode: 200,
    status: vi.fn(function (this: { statusCode: number }, code: number) {
      this.statusCode = code;
      return this;
    }),
    json: vi.fn(function (this: unknown, body: unknown) {
      return body;
    }),
    on: vi.fn(),
  };
  return res as unknown as Response & {
    statusCode: number;
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
  };
}

describe('idempotencyMiddleware reserve', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHash.mockReturnValue('hash-a');
  });

  it('replays completed response for same key+hash', async () => {
    mockTryReserve.mockResolvedValue({
      kind: 'replay',
      row: {
        responseStatus: 201,
        responseBody: { orderId: 'o1' },
        requestHash: 'hash-a',
        status: 'completed',
      },
    });
    const req = {
      get: (h: string) => (h === 'idempotency-key' ? 'k1' : undefined),
      authUser: { id: 1 },
      body: { a: 1 },
      query: {},
      method: 'POST',
      baseUrl: '/api',
      path: '/orders',
    } as unknown as Request;
    const res = mockRes();
    const next = vi.fn();
    await idempotencyMiddleware('order.create')(req, res, next);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ orderId: 'o1' });
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects different payload for same key', async () => {
    mockTryReserve.mockResolvedValue({
      kind: 'hash_mismatch',
      row: { requestHash: 'other' },
    });
    const req = {
      get: (h: string) => (h === 'idempotency-key' ? 'k1' : undefined),
      authUser: { id: 1 },
      body: {},
      query: {},
      method: 'POST',
      baseUrl: '/api',
      path: '/orders',
    } as unknown as Request;
    const res = mockRes();
    await expect(
      idempotencyMiddleware('order.create')(req, res, vi.fn()),
    ).rejects.toMatchObject({ code: 'IDEMPOTENCY_KEY_REUSED' });
  });

  it('reserves then completes on success json', async () => {
    mockTryReserve.mockResolvedValue({ kind: 'reserved' });
    mockComplete.mockResolvedValue({});
    const req = {
      get: (h: string) => (h === 'idempotency-key' ? 'k1' : undefined),
      authUser: { id: 9 },
      body: { x: 1 },
      query: {},
      method: 'POST',
      baseUrl: '/api',
      path: '/orders',
    } as unknown as Request;
    const res = mockRes();
    const next = vi.fn();
    await idempotencyMiddleware('order.create')(req, res, next);
    expect(next).toHaveBeenCalled();
    res.json({ ok: true });
    expect(mockComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 9,
        key: 'k1',
        route: 'order.create',
        responseStatus: 200,
        responseBody: { ok: true },
      }),
    );
  });

  it('returns conflict when still in progress after wait', async () => {
    mockTryReserve.mockResolvedValue({
      kind: 'in_progress',
      row: { status: 'in_progress', requestHash: 'hash-a' },
    });
    mockFind.mockResolvedValue({
      status: 'in_progress',
      requestHash: 'hash-a',
      responseStatus: 0,
    });
    const req = {
      get: (h: string) => (h === 'idempotency-key' ? 'k1' : undefined),
      authUser: { id: 1 },
      body: {},
      query: {},
      method: 'POST',
      baseUrl: '/api',
      path: '/orders',
    } as unknown as Request;
    await expect(
      idempotencyMiddleware('order.create')(req, mockRes(), vi.fn()),
    ).rejects.toMatchObject({ code: 'IDEMPOTENCY_KEY_IN_PROGRESS' });
  }, 10_000);
});
