import { createHash, randomBytes, randomUUID } from 'crypto';

import { and, desc, eq, gt, isNull } from 'drizzle-orm';

import db from '@src/db';
import {
  authSessionsTable,
  type AuthSession,
} from '@src/db/schema/auth-session';

const REFRESH_TTL_DAYS = 30;

export function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function generateRefreshToken(): string {
  return randomBytes(48).toString('base64url');
}

export async function createSession(input: {
  userId: number;
  deviceId: string;
  platform?: string | null;
  appVersion?: string | null;
  familyId?: string;
}): Promise<{ session: AuthSession; refreshToken: string }> {
  const refreshToken = generateRefreshToken();
  const refreshTokenHash = hashRefreshToken(refreshToken);
  const familyId = input.familyId ?? randomUUID();
  const expiresAt = new Date(
    Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000,
  );

  // Revoke previous active session for same device
  await db
    .update(authSessionsTable)
    .set({ revokedAt: new Date() })
    .where(
      and(
        eq(authSessionsTable.userId, input.userId),
        eq(authSessionsTable.deviceId, input.deviceId),
        isNull(authSessionsTable.revokedAt),
      ),
    );

  const rows = await db
    .insert(authSessionsTable)
    .values({
      userId: input.userId,
      deviceId: input.deviceId,
      platform: input.platform ?? null,
      appVersion: input.appVersion ?? null,
      refreshTokenHash,
      familyId,
      expiresAt,
    })
    .returning();

  return { session: rows[0], refreshToken };
}

export async function findByRefreshHash(
  refreshTokenHash: string,
): Promise<AuthSession | undefined> {
  const rows = await db
    .select()
    .from(authSessionsTable)
    .where(eq(authSessionsTable.refreshTokenHash, refreshTokenHash))
    .orderBy(desc(authSessionsTable.createdAt))
    .limit(1);
  return rows[0];
}

export async function findActiveByRefreshHash(
  refreshTokenHash: string,
): Promise<AuthSession | undefined> {
  const rows = await db
    .select()
    .from(authSessionsTable)
    .where(
      and(
        eq(authSessionsTable.refreshTokenHash, refreshTokenHash),
        isNull(authSessionsTable.revokedAt),
        gt(authSessionsTable.expiresAt, new Date()),
      ),
    )
    .limit(1);
  return rows[0];
}

export async function findById(
  sessionId: string,
): Promise<AuthSession | undefined> {
  const rows = await db
    .select()
    .from(authSessionsTable)
    .where(eq(authSessionsTable.id, sessionId))
    .limit(1);
  return rows[0];
}

export async function listByUser(userId: number): Promise<AuthSession[]> {
  return db
    .select()
    .from(authSessionsTable)
    .where(
      and(eq(authSessionsTable.userId, userId), isNull(authSessionsTable.revokedAt)),
    )
    .orderBy(desc(authSessionsTable.lastUsedAt));
}

export async function revokeSession(sessionId: string): Promise<boolean> {
  const rows = await db
    .update(authSessionsTable)
    .set({ revokedAt: new Date() })
    .where(
      and(eq(authSessionsTable.id, sessionId), isNull(authSessionsTable.revokedAt)),
    )
    .returning({ id: authSessionsTable.id });
  return rows.length > 0;
}

export async function revokeFamily(familyId: string): Promise<number> {
  const rows = await db
    .update(authSessionsTable)
    .set({ revokedAt: new Date() })
    .where(
      and(
        eq(authSessionsTable.familyId, familyId),
        isNull(authSessionsTable.revokedAt),
      ),
    )
    .returning({ id: authSessionsTable.id });
  return rows.length;
}

export async function revokeAllForUser(userId: number): Promise<number> {
  const rows = await db
    .update(authSessionsTable)
    .set({ revokedAt: new Date() })
    .where(
      and(eq(authSessionsTable.userId, userId), isNull(authSessionsTable.revokedAt)),
    )
    .returning({ id: authSessionsTable.id });
  return rows.length;
}

export async function revokeOthers(
  userId: number,
  keepSessionId: string,
): Promise<number> {
  const sessions = await listByUser(userId);
  let count = 0;
  for (const s of sessions) {
    if (s.id === keepSessionId) continue;
    if (await revokeSession(s.id)) count += 1;
  }
  return count;
}

export async function touchSession(sessionId: string): Promise<void> {
  await db
    .update(authSessionsTable)
    .set({ lastUsedAt: new Date() })
    .where(eq(authSessionsTable.id, sessionId));
}

export async function rotateRefreshToken(
  sessionId: string,
): Promise<{ session: AuthSession; refreshToken: string } | undefined> {
  const existing = await findById(sessionId);
  if (!existing || existing.revokedAt) return undefined;

  const refreshToken = generateRefreshToken();
  const refreshTokenHash = hashRefreshToken(refreshToken);
  const expiresAt = new Date(
    Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000,
  );

  const rows = await db
    .update(authSessionsTable)
    .set({
      refreshTokenHash,
      expiresAt,
      lastUsedAt: new Date(),
    })
    .where(eq(authSessionsTable.id, sessionId))
    .returning();

  if (!rows[0]) return undefined;
  return { session: rows[0], refreshToken };
}
