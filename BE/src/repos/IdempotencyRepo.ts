import { createHash } from 'crypto';

import { and, eq, gt } from 'drizzle-orm';

import db from '@src/db';
import { idempotencyKeysTable } from '@src/db/schema/idempotency-key';

const TTL_MS = 24 * 60 * 60 * 1000;

export function hashRequestPayload(payload: unknown): string {
  return createHash('sha256')
    .update(JSON.stringify(payload ?? null))
    .digest('hex');
}

export async function find(
  userId: number,
  key: string,
  route: string,
) {
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

export async function save(input: {
  userId: number;
  key: string;
  route: string;
  requestHash: string;
  responseStatus: number;
  responseBody: unknown;
}) {
  const expiresAt = new Date(Date.now() + TTL_MS);
  const existing = await find(input.userId, input.key, input.route);
  if (existing) return existing;

  const rows = await db
    .insert(idempotencyKeysTable)
    .values({
      key: input.key,
      userId: input.userId,
      route: input.route,
      requestHash: input.requestHash,
      responseStatus: input.responseStatus,
      responseBody: input.responseBody as object,
      expiresAt,
    })
    .returning();
  return rows[0];
}
