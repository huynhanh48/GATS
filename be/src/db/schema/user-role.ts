import { sql } from 'drizzle-orm';
import {
  index,
  integer,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { rolesTable } from './role';
import { usersTable } from './user';

export const userRolesTable = pgTable(
  'user_roles',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: integer('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    roleId: integer('role_id')
      .notNull()
      .references(() => rolesTable.id, { onDelete: 'cascade' }),
    resourceType: varchar('resource_type', { length: 64 }),
    resourceId: uuid('resource_id'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_user_roles_unique').on(
      table.userId,
      table.roleId,
      sql`COALESCE(${table.resourceId}, '00000000-0000-0000-0000-000000000000'::uuid)`,
    ),
    index('idx_user_roles_user_lookup').on(table.userId),
    index('idx_user_roles_resource_lookup').on(
      table.userId,
      table.resourceType,
      table.resourceId,
    ),
    index('idx_user_roles_role_lookup').on(table.roleId),
  ],
);

export type UserRole = typeof userRolesTable.$inferSelect;
export type NewUserRole = typeof userRolesTable.$inferInsert;
