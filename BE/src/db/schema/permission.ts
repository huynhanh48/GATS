import {
  integer,
  pgEnum,
  pgTable,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';

export const permissionActionEnum = pgEnum('permission_action', [
  'read',
  'create',
  'update',
  'delete',
]);

export const permissionsTable = pgTable(
  'permissions',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 64 }).notNull(),
    resourceType: varchar('resource_type', { length: 64 }).notNull(),
    action: permissionActionEnum().notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_permissions_resource_action_unique').on(
      table.resourceType,
      table.action,
    ),
    uniqueIndex('idx_permissions_name_unique').on(table.name),
  ],
);

export type Permission = typeof permissionsTable.$inferSelect;
export type NewPermission = typeof permissionsTable.$inferInsert;
export type PermissionAction = (typeof permissionActionEnum.enumValues)[number];
