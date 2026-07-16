export const ALLOWED_ADMIN_ROLES = ["admin", "instructor"] as const;

export type AdminRole = (typeof ALLOWED_ADMIN_ROLES)[number];

export function hasAdminAccess(roles: string[]): boolean {
  return ALLOWED_ADMIN_ROLES.some((role) => roles.includes(role));
}
