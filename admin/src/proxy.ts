import { ACCESS_TOKEN_COOKIE, BE_API_URL } from "@/lib/api/config";
import type { MeResponse } from "@/lib/api/types";
import {
  canAccessDashboardPath,
  defaultPostLoginPath,
  hasAdminAccess,
} from "@/lib/auth/access";
import { NextRequest, NextResponse } from "next/server";

const AUTH_ONLY_PATHS = ["/auth/sign-in", "/auth/sign-up"];

function isAuthOnlyPath(pathname: string) {
  return AUTH_ONLY_PATHS.some((path) => pathname.startsWith(path));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const callbackUrl = `${pathname}${request.nextUrl.search}`;
  const isAuthOnly = isAuthOnlyPath(pathname);
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    if (isAuthOnly) {
      return NextResponse.next();
    }

    const url = request.nextUrl.clone();
    url.searchParams.set("callbackUrl", callbackUrl);
    url.pathname = "/auth/sign-in";
    url.searchParams.delete("error");
    return NextResponse.redirect(url);
  }

  try {
    const response = await fetch(`${BE_API_URL}/api/user/me`, {
      headers: {
        Cookie: `${ACCESS_TOKEN_COOKIE}=${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      if (isAuthOnly) {
        return NextResponse.next();
      }

      const url = request.nextUrl.clone();
      url.searchParams.set("callbackUrl", callbackUrl);
      url.pathname = "/auth/sign-in";
      return NextResponse.redirect(url);
    }

    const data = (await response.json()) as MeResponse;
    const roles = data.user?.roles ?? [];

    if (!hasAdminAccess(roles)) {
      if (isAuthOnly) {
        // Stay on auth pages so the user can sign out / switch account.
        if (
          pathname.startsWith("/auth/sign-in") &&
          request.nextUrl.searchParams.get("error") !== "unauthorized"
        ) {
          const url = request.nextUrl.clone();
          url.searchParams.set("error", "unauthorized");
          return NextResponse.redirect(url);
        }
        return NextResponse.next();
      }

      const url = request.nextUrl.clone();
      url.pathname = "/auth/sign-in";
      url.search = "";
      url.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(url);
    }

    if (isAuthOnly) {
      const dest = defaultPostLoginPath(roles);
      return NextResponse.redirect(new URL(dest, request.url));
    }

    if (!canAccessDashboardPath(roles, pathname)) {
      return NextResponse.redirect(
        new URL(defaultPostLoginPath(roles), request.url),
      );
    }
  } catch (error) {
    console.error(error);
    if (isAuthOnly) {
      return NextResponse.next();
    }
    const url = request.nextUrl.clone();
    url.searchParams.set("callbackUrl", callbackUrl);
    url.pathname = "/auth/sign-in";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
