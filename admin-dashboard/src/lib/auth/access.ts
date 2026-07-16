export const ALLOWED_ADMIN_ROLES = ["admin", "instructor"] as const;

export type AdminRole = (typeof ALLOWED_ADMIN_ROLES)[number];

export function hasAdminAccess(roles: string[]): boolean {
  return ALLOWED_ADMIN_ROLES.some((role) => roles.includes(role));
}

/** Any signed-in account (learner `user`, admin, instructor, …). */
export function isSignedIn(roles: string[] | null | undefined): boolean {
  return Array.isArray(roles) && roles.length > 0;
}

export function defaultPostLoginPath(roles: string[]): string {
  return hasAdminAccess(roles) ? "/admin" : "/course";
}
