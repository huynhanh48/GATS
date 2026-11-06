import { permissionActionEnum } from './permission';

/** Common resource types used in permission checks. */
export const RESOURCE_TYPES = {
  USER: 'user',
  ROLE: 'role',
  PERMISSION: 'permission',
  COURSE: 'course',
  POST: 'post',
  PROJECT: 'project',
} as const;

export type ResourceType = (typeof RESOURCE_TYPES)[keyof typeof RESOURCE_TYPES];

export const PERMISSION_ACTIONS = permissionActionEnum.enumValues;

export type { PermissionAction } from './permission';
