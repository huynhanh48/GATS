import { integer, pgTable, primaryKey, timestamp } from 'drizzle-orm/pg-core';

import { permissionsTable } from './permission';
import { rolesTable } from './role';

export const rolePermissionsTable = pgTable(
  'role_permissions',
  {
    roleId: integer('role_id')
      .notNull()
      .references(() => rolesTable.id, { onDelete: 'cascade' }),
    permissionId: integer('permission_id')
      .notNull()
      .references(() => permissionsTable.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.roleId, table.permissionId] })],
);

export type RolePermission = typeof rolePermissionsTable.$inferSelect;
export type NewRolePermission = typeof rolePermissionsTable.$inferInsert;
