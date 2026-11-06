import { createHash } from 'crypto';

import { and, eq, gt } from 'drizzle-orm';

import db from '@src/db';
import { idempotencyKeysTable } from '@src/db/schema/idempotency-key';

const TTL_MS = 24 * 60 * 60 * 1000;
const IN_PROGRESS_STALE_MS = 2 * 60 * 1000;

export type IdempotencyStatus = 'in_progress' | 'completed';

export function hashRequestPayload(payload: unknown): string {
  return createHash('sha256')
    .update(JSON.stringify(payload ?? null))
    .digest('hex');
}

export async function find(userId: number, key: string, route: string) {
  const rows = await db
    .select()
    .from(idempotencyKeysTable)
    .where(
      and(
        eq(idempotencyKeysTable.userId, userId),
        eq(idempotencyKeysTable.key, key),
        eq(idempotencyKeysTable.route, route),
        gt(idempotencyKeysTable.expiresAt, new Date()),
      ),
    )
    .limit(1);
  return rows[0];
}

function isStaleInProgress(row: { status: string; createdAt: Date }) {
  return (
    row.status === 'in_progress' &&
    Date.now() - row.createdAt.getTime() > IN_PROGRESS_STALE_MS
  );
}

/**
 * Atomically reserve an idempotency key, or return existing completed/in-progress row.
 */
export async function tryReserve(input: {
  userId: number;
  key: string;
  route: string;
  requestHash: string;
}): Promise<
  | { kind: 'reserved' }
  | { kind: 'replay'; row: typeof idempotencyKeysTable.$inferSelect }
  | { kind: 'in_progress'; row: typeof idempotencyKeysTable.$inferSelect }
  | { kind: 'hash_mismatch'; row: typeof idempotencyKeysTable.$inferSelect }
> {
  const expiresAt = new Date(Date.now() + TTL_MS);

  const inserted = await db
    .insert(idempotencyKeysTable)
    .values({
      key: input.key,
      userId: input.userId,
      route: input.route,
      requestHash: input.requestHash,
      responseStatus: 0,
      responseBody: {},
      status: 'in_progress',
      expiresAt,
    })
    .onConflictDoNothing({
      target: [
        idempotencyKeysTable.userId,
        idempotencyKeysTable.key,
        idempotencyKeysTable.route,
      ],
    })
    .returning();

  if (inserted[0]) {
    return { kind: 'reserved' };
  }

  let existing = await find(input.userId, input.key, input.route);
  if (!existing) {
    // Expired conflict row — try once more after delete is not available; treat as race.
    const retry = await db
      .insert(idempotencyKeysTable)
      .values({
        key: input.key,
        userId: input.userId,
        route: input.route,
        requestHash: input.requestHash,
        responseStatus: 0,
        responseBody: {},
        status: 'in_progress',
        expiresAt,
      })
      .onConflictDoNothing({
        target: [
          idempotencyKeysTable.userId,
          idempotencyKeysTable.key,
          idempotencyKeysTable.route,
        ],
      })
      .returning();
    if (retry[0]) return { kind: 'reserved' };
    existing = await find(input.userId, input.key, input.route);
  }

  if (!existing) {
    return { kind: 'reserved' };
  }

  if (existing.requestHash !== input.requestHash) {
    return { kind: 'hash_mismatch', row: existing };
  }

  if (existing.status === 'completed' && existing.responseStatus >= 200) {
    return { kind: 'replay', row: existing };
  }

  if (isStaleInProgress(existing)) {
    await db
      .update(idempotencyKeysTable)
      .set({
        status: 'in_progress',
        requestHash: input.requestHash,
        responseStatus: 0,
        responseBody: {},
        expiresAt,
        createdAt: new Date(),
      })
      .where(eq(idempotencyKeysTable.id, existing.id));
    return { kind: 'reserved' };
  }

  return { kind: 'in_progress', row: existing };
}

export async function complete(input: {
  userId: number;
  key: string;
  route: string;
  responseStatus: number;
  responseBody: unknown;
}) {
  const expiresAt = new Date(Date.now() + TTL_MS);
  const rows = await db
    .update(idempotencyKeysTable)
    .set({
      status: 'completed',
      responseStatus: input.responseStatus,
      responseBody: input.responseBody as object,
      expiresAt,
    })
    .where(
      and(
        eq(idempotencyKeysTable.userId, input.userId),
        eq(idempotencyKeysTable.key, input.key),
        eq(idempotencyKeysTable.route, input.route),
      ),
    )
    .returning();
  return rows[0];
}

export async function release(userId: number, key: string, route: string) {
  await db
    .delete(idempotencyKeysTable)
    .where(
      and(
        eq(idempotencyKeysTable.userId, userId),
        eq(idempotencyKeysTable.key, key),
        eq(idempotencyKeysTable.route, route),
        eq(idempotencyKeysTable.status, 'in_progress'),
      ),
    );
}

/** @deprecated use tryReserve + complete */
export async function save(input: {
  userId: number;
  key: string;
  route: string;
  requestHash: string;
  responseStatus: number;
  responseBody: unknown;
}) {
  return complete({
    userId: input.userId,
    key: input.key,
    route: input.route,
    responseStatus: input.responseStatus,
    responseBody: input.responseBody,
  });
}
