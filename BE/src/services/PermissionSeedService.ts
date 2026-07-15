import { eq } from 'drizzle-orm';

import db from '@src/db';
import { RESOURCE_TYPES } from '@src/db/schema/constants';
import { permissionsTable } from '@src/db/schema/permission';
import { rolePermissionsTable } from '@src/db/schema/role-permission';
import * as RoleRepo from '@src/repos/RoleRepo';

const COURSE_PERMISSIONS = [
  { name: 'course:read', action: 'read' as const },
  { name: 'course:create', action: 'create' as const },
  { name: 'course:update', action: 'update' as const },
  { name: 'course:delete', action: 'delete' as const },
];

const POST_PERMISSIONS = [
  { name: 'post:read', action: 'read' as const },
  { name: 'post:create', action: 'create' as const },
  { name: 'post:update', action: 'update' as const },
  { name: 'post:delete', action: 'delete' as const },
];

async function seedPermissionsForResource(
  resourceType: string,
  permissions: typeof COURSE_PERMISSIONS,
) {
  for (const permission of permissions) {
    await db
      .insert(permissionsTable)
      .values({
        name: permission.name,
        resourceType,
        action: permission.action,
      })
      .onConflictDoNothing();
  }
}

async function assignPermissionsToRoles(
  resourceType: string,
  instructorPermissionNames: Set<string>,
) {
  const adminRole = await RoleRepo.findByName('admin');
  if (!adminRole) {
    throw new Error('Admin role not found');
  }

  const instructorRole = await RoleRepo.findByName('instructor');
  if (!instructorRole) {
    throw new Error('Instructor role not found');
  }

  const resourcePermissions = await db
    .select()
    .from(permissionsTable)
    .where(eq(permissionsTable.resourceType, resourceType));

  for (const permission of resourcePermissions) {
    await db
      .insert(rolePermissionsTable)
      .values({
        roleId: adminRole.id,
        permissionId: permission.id,
      })
      .onConflictDoNothing();

    if (instructorPermissionNames.has(permission.name)) {
      await db
        .insert(rolePermissionsTable)
        .values({
          roleId: instructorRole.id,
          permissionId: permission.id,
        })
        .onConflictDoNothing();
    }
  }
}

export async function seedPermissions(): Promise<void> {
  await RoleRepo.seedDefaults();
  await seedPermissionsForResource(RESOURCE_TYPES.COURSE, COURSE_PERMISSIONS);
  await seedPermissionsForResource(RESOURCE_TYPES.POST, POST_PERMISSIONS);
  await assignPermissionsToRoles(
    RESOURCE_TYPES.COURSE,
    new Set(['course:read', 'course:update']),
  );
  await assignPermissionsToRoles(RESOURCE_TYPES.POST, new Set());
}
