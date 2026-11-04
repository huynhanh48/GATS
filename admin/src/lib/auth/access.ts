export const ALLOWED_ADMIN_ROLES = ["admin", "instructor"] as const;

export type AdminRole = (typeof ALLOWED_ADMIN_ROLES)[number];

export function hasAdminAccess(roles: string[]): boolean {
  return ALLOWED_ADMIN_ROLES.some((role) => roles.includes(role));
}

/** Full admin only — instructors cannot access payment/order management. */
export function hasAdminRole(roles: string[]): boolean {
  return roles.includes("admin");
}

/** Instructor without the global admin role. */
export function isInstructorOnly(roles: string[]): boolean {
  return roles.includes("instructor") && !hasAdminRole(roles);
}

/**
 * Instructors use the admin app as a teaching workspace, not as a back office.
 * All course authoring screens live below /course.
 */
export function canAccessDashboardPath(
  roles: string[],
  pathname: string,
): boolean {
  if (hasAdminRole(roles)) return true;
  if (!isInstructorOnly(roles)) return false;

  if (
    pathname === "/course/category" ||
    pathname.startsWith("/course/category/") ||
    pathname === "/course/trash" ||
    pathname.startsWith("/course/trash/") ||
    pathname === "/course/menu" ||
    pathname.startsWith("/course/menu/")
  ) {
    return false;
  }

  return pathname === "/course" || pathname.startsWith("/course/");
}

/** Any signed-in account (learner `user`, admin, instructor, …). */
export function isSignedIn(roles: string[] | null | undefined): boolean {
  return Array.isArray(roles) && roles.length > 0;
}

export function defaultPostLoginPath(roles: string[]): string {
  if (hasAdminRole(roles)) return "/";
  if (isInstructorOnly(roles)) return "/course";
  return "/auth/sign-in?error=unauthorized";
}
