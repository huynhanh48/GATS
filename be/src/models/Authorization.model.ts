export interface PermissionCheck {
  userId: number;
  action: string;
  resourceType: string;
  resourceId?: string;
}

export const PERMISSION_CACHE_TTL_MS = 60_000;
