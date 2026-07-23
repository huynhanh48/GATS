import { and, count, eq, isNull } from 'drizzle-orm';

import authorizationService from '@src/services/AuthorizationService';
import db from '@src/db';
import { rolesTable } from '@src/db/schema/role';
import { userRolesTable } from '@src/db/schema/user-role';
import { type RoleRecord, roleSchema } from '@src/models/Role.model';

const DEFAULT_ROLES = ['admin', 'user', 'instructor'] as const;

function parseRoleRow(row: unknown): RoleRecord {
  return roleSchema.parse(row);
}

export async function findByName(name: string): Promise<RoleRecord | undefined> {
  const rows = await db
    .select()
    .from(rolesTable)
    .where(eq(rolesTable.name, name))
    .limit(1);
  return rows[0] ? parseRoleRow(rows[0]) : undefined;
}

export async function assignRoleToUser(
  userId: number,
  roleId: number,
  scope?: { resourceType?: string; resourceId?: string },
): Promise<void> {
  const conditions = [
    eq(userRolesTable.userId, userId),
    eq(userRolesTable.roleId, roleId),
  ];

  if (scope?.resourceId) {
    conditions.push(eq(userRolesTable.resourceId, scope.resourceId));
    if (scope.resourceType) {
      conditions.push(eq(userRolesTable.resourceType, scope.resourceType));
    }
  } else {
    conditions.push(isNull(userRolesTable.resourceId));
  }

  const existing = await db
    .select({ id: userRolesTable.id })
    .from(userRolesTable)
    .where(and(...conditions))
    .limit(1);

  if (existing.length > 0) {
    return;
  }

  await db.insert(userRolesTable).values({
    userId,
    roleId,
    resourceType: scope?.resourceType ?? null,
    resourceId: scope?.resourceId ?? null,
  });

  await authorizationService.invalidateUser(userId);
}

export async function getGlobalRoleNames(userId: number): Promise<string[]> {
  const rows = await db
    .select({ name: rolesTable.name })
    .from(userRolesTable)
    .innerJoin(rolesTable, eq(userRolesTable.roleId, rolesTable.id))
    .where(
      and(
        eq(userRolesTable.userId, userId),
        isNull(userRolesTable.resourceId),
      ),
    );
  return rows.map((row) => row.name);
}

export async function countUsersWithGlobalRole(name: string): Promise<number> {
  const rows = await db
    .select({ value: count() })
    .from(userRolesTable)
    .innerJoin(rolesTable, eq(userRolesTable.roleId, rolesTable.id))
    .where(
      and(eq(rolesTable.name, name), isNull(userRolesTable.resourceId)),
    );
  return Number(rows[0]?.value ?? 0);
}

/** Replace only account-wide roles. Course-scoped mentor roles are preserved. */
export async function replaceGlobalRole(
  userId: number,
  roleName: string,
): Promise<void> {
  await db.transaction(async (tx) => {
    const roles = await tx
      .select({ id: rolesTable.id })
      .from(rolesTable)
      .where(eq(rolesTable.name, roleName))
      .limit(1);
    const role = roles[0];
    if (!role) {
      throw new Error(`Role not found: ${roleName}`);
    }

    await tx
      .delete(userRolesTable)
      .where(
        and(
          eq(userRolesTable.userId, userId),
          isNull(userRolesTable.resourceId),
        ),
      );
    await tx.insert(userRolesTable).values({ userId, roleId: role.id });
  });

  await authorizationService.invalidateUser(userId);
}

export async function removeScopedRoleFromUser(
  userId: number,
  roleId: number,
  resourceType: string,
  resourceId: string,
): Promise<void> {
  await db
    .delete(userRolesTable)
    .where(
      and(
        eq(userRolesTable.userId, userId),
        eq(userRolesTable.roleId, roleId),
        eq(userRolesTable.resourceType, resourceType),
        eq(userRolesTable.resourceId, resourceId),
      ),
    );
  await authorizationService.invalidateUser(userId);
}

export async function seedDefaults(): Promise<void> {
  for (const name of DEFAULT_ROLES) {
    await db.insert(rolesTable).values({ name }).onConflictDoNothing();
  }
}
