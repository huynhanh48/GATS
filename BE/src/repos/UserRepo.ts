import { randomUUID } from 'crypto';
import { and, count, desc, eq, ilike, inArray, or } from 'drizzle-orm';

import db from '@src/db';
import { rolesTable } from '@src/db/schema/role';
import { type NewUser, usersTable } from '@src/db/schema/user';
import { userRolesTable } from '@src/db/schema/user-role';
import {
  type UserPublic,
  userPublicSchema,
  type UserRecord,
  userRecordSchema,
} from '@src/models/User.model';

function parseUserRow(row: unknown): UserRecord {
  return userRecordSchema.parse(row);
}

export async function findByEmail(
  email: string,
): Promise<UserRecord | undefined> {
  const rows = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);
  return rows[0] ? parseUserRow(rows[0]) : undefined;
}

export async function findByUserName(
  userName: string,
): Promise<UserRecord | undefined> {
  const rows = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.userName, userName))
    .limit(1);
  return rows[0] ? parseUserRow(rows[0]) : undefined;
}

export async function findById(id: number): Promise<UserRecord | undefined> {
  const rows = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, id))
    .limit(1);
  return rows[0] ? parseUserRow(rows[0]) : undefined;
}

export async function findByIds(ids: number[]): Promise<UserRecord[]> {
  if (ids.length === 0) return [];
  const rows = await db
    .select()
    .from(usersTable)
    .where(inArray(usersTable.id, ids));
  return rows.map(parseUserRow);
}

export async function findAuthorById(
  id: number,
): Promise<{ id: number; userName: string } | undefined> {
  const rows = await db
    .select({
      id: usersTable.id,
      userName: usersTable.userName,
    })
    .from(usersTable)
    .where(eq(usersTable.id, id))
    .limit(1);
  return rows[0];
}

export async function findByVerifyToken(
  token: string,
): Promise<UserRecord | undefined> {
  const rows = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.verifyToken, token))
    .limit(1);
  return rows[0] ? parseUserRow(rows[0]) : undefined;
}

export async function findByEmailOrUserName(
  email?: string,
  userName?: string,
): Promise<UserRecord | undefined> {
  if (!email && !userName) return undefined;

  const conditions = [];
  if (email) conditions.push(eq(usersTable.email, email));
  if (userName) conditions.push(eq(usersTable.userName, userName));

  const rows = await db
    .select()
    .from(usersTable)
    .where(or(...conditions))
    .limit(1);
  return rows[0] ? parseUserRow(rows[0]) : undefined;
}

export async function create(data: NewUser): Promise<UserRecord> {
  const rows = await db.insert(usersTable).values(data).returning();
  return parseUserRow(rows[0]);
}

export async function saveSession(
  userId: number,
  accessToken: string,
  tokenExpiresAt: Date,
): Promise<void> {
  await db
    .update(usersTable)
    .set({ accessToken, tokenExpiresAt, updatedAt: new Date() })
    .where(eq(usersTable.id, userId));
}

export async function clearSession(userId: number): Promise<void> {
  await db
    .update(usersTable)
    .set({ accessToken: null, tokenExpiresAt: null, updatedAt: new Date() })
    .where(eq(usersTable.id, userId));
}

export async function setVerified(userId: number): Promise<void> {
  await db
    .update(usersTable)
    .set({ verified: true, verifyToken: null, updatedAt: new Date() })
    .where(eq(usersTable.id, userId));
}

export async function update(
  id: number,
  data: Partial<
    Pick<
      NewUser,
      | 'userName'
      | 'email'
      | 'passwordHash'
      | 'verifyToken'
      | 'isLocked'
      | 'type'
      | 'providerId'
      | 'onboardingAnswers'
      | 'onboardingCompletedAt'
      | 'avatarUrl'
      | 'coverUrl'
    >
  >,
): Promise<UserRecord | undefined> {
  const rows = await db
    .update(usersTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(usersTable.id, id))
    .returning();
  return rows[0] ? parseUserRow(rows[0]) : undefined;
}

export async function saveOnboarding(
  userId: number,
  answers: Record<string, unknown>,
): Promise<void> {
  await db
    .update(usersTable)
    .set({
      onboardingAnswers: answers,
      onboardingCompletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(usersTable.id, userId));
}

export async function getRoleNames(userId: number): Promise<string[]> {
  const rows = await db
    .select({ name: rolesTable.name })
    .from(userRolesTable)
    .innerJoin(rolesTable, eq(userRolesTable.roleId, rolesTable.id))
    .where(eq(userRolesTable.userId, userId));
  return rows.map((row) => row.name);
}

export function toPublicUser(user: UserRecord, roles: string[]): UserPublic {
  return userPublicSchema.parse({
    id: user.id,
    userName: user.userName,
    verified: user.verified,
    email: user.email,
    type: user.type,
    roles,
    isLocked: user.isLocked,
    avatarUrl: user.avatarUrl ?? null,
    coverUrl: user.coverUrl ?? null,
  });
}

export function createVerifyToken(): string {
  return randomUUID();
}

export async function listAdmin(options: {
  skip?: number;
  take?: number;
  q?: string;
  verified?: boolean;
  locked?: boolean;
}): Promise<{ data: UserRecord[]; total: number }> {
  const skip = Math.max(0, options.skip ?? 0);
  const take = Math.min(100, Math.max(1, options.take ?? 20));
  const q = options.q?.trim();

  const conditions = [];
  if (options.verified !== undefined) {
    conditions.push(eq(usersTable.verified, options.verified));
  }
  if (options.locked !== undefined) {
    conditions.push(eq(usersTable.isLocked, options.locked));
  }
  if (q) {
    const term = `%${q}%`;
    conditions.push(
      or(ilike(usersTable.userName, term), ilike(usersTable.email, term)),
    );
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [data, totalRow] = await Promise.all([
    db
      .select()
      .from(usersTable)
      .where(where)
      .orderBy(desc(usersTable.createdAt))
      .limit(take)
      .offset(skip),
    db.select({ value: count() }).from(usersTable).where(where),
  ]);

  return {
    data: data.map(parseUserRow),
    total: Number(totalRow[0]?.value ?? 0),
  };
}
