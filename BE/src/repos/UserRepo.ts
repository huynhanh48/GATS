import { randomUUID } from 'crypto';

import { eq, or } from 'drizzle-orm';

import db from '@src/db';
import { rolesTable } from '@src/db/schema/role';
import { userRolesTable } from '@src/db/schema/user-role';
import { type NewUser, usersTable } from '@src/db/schema/user';
import {
  type UserPublic,
  type UserRecord,
  userPublicSchema,
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
  data: Partial<Pick<NewUser, 'userName' | 'email'>>,
): Promise<UserRecord | undefined> {
  const rows = await db
    .update(usersTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(usersTable.id, id))
    .returning();
  return rows[0] ? parseUserRow(rows[0]) : undefined;
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
  });
}

export function createVerifyToken(): string {
  return randomUUID();
}
