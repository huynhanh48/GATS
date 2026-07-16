import { and, eq, isNull, or } from 'drizzle-orm';

import { PermissionCache, permissionCache } from '@src/common/cache/permission-cache';
import db from '@src/db';
import { permissionsTable } from '@src/db/schema/permission';
import { rolePermissionsTable } from '@src/db/schema/role-permission';
import type { PermissionAction } from '@src/db/schema/permission';
import { userRolesTable } from '@src/db/schema/user-role';
import {
  type PermissionCheck,
  PERMISSION_CACHE_TTL_MS,
} from '@src/models/Authorization.model';

export class AuthorizationService {
  constructor(
    private readonly database: typeof db = db,
    private readonly cache: PermissionCache = permissionCache,
  ) {}

  async canPerform(check: PermissionCheck): Promise<boolean> {
    const cacheKey = this.buildCacheKey(check);
    const cached = await this.cache.get(cacheKey);
    if (cached !== undefined) {
      return cached;
    }

    const allowed = await this.checkPermission(check);
    await this.cache.set(cacheKey, allowed, PERMISSION_CACHE_TTL_MS);
    return allowed;
  }

  async invalidateUser(userId: number): Promise<void> {
    await this.cache.deleteByPrefix(`perm:${userId}:`);
  }

  private async checkPermission(check: PermissionCheck): Promise<boolean> {
    const rows = await this.database
      .select({ id: userRolesTable.id })
      .from(userRolesTable)
      .innerJoin(
        rolePermissionsTable,
        eq(userRolesTable.roleId, rolePermissionsTable.roleId),
      )
      .innerJoin(
        permissionsTable,
        eq(rolePermissionsTable.permissionId, permissionsTable.id),
      )
      .where(
        and(
          eq(userRolesTable.userId, check.userId),
          eq(permissionsTable.resourceType, check.resourceType),
          eq(permissionsTable.action, check.action as PermissionAction),
          this.buildResourceScopeCondition(check),
        ),
      )
      .limit(1);

    return rows.length > 0;
  }

  private buildResourceScopeCondition(check: PermissionCheck) {
    const typeScoped = and(
      eq(userRolesTable.resourceType, check.resourceType),
      check.resourceId
        ? or(
            isNull(userRolesTable.resourceId),
            eq(userRolesTable.resourceId, check.resourceId),
          )
        : isNull(userRolesTable.resourceId),
    );

    return or(isNull(userRolesTable.resourceType), typeScoped);
  }

  private buildCacheKey(check: PermissionCheck): string {
    return `perm:${check.userId}:${check.resourceType}:${check.action}:${check.resourceId ?? 'all'}`;
  }
}

export const authorizationService = new AuthorizationService();

export default authorizationService;
