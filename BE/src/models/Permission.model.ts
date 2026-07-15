import { z } from 'zod';

import { permissionActionEnum } from '@src/db/schema/permission';

export const permissionActionSchema = z.enum(permissionActionEnum.enumValues);

export const permissionSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(64),
  resourceType: z.string().min(1).max(64),
  action: permissionActionSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type PermissionRecord = z.infer<typeof permissionSchema>;
export type PermissionAction = z.infer<typeof permissionActionSchema>;

export function parsePermission(data: unknown): PermissionRecord {
  return permissionSchema.parse(data);
}
