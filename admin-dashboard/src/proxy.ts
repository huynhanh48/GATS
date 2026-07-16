import { ACCESS_TOKEN_COOKIE, BE_API_URL } from "@/lib/api/config";
import type { MeResponse } from "@/lib/api/types";
import { defaultPostLoginPath, hasAdminAccess } from "@/lib/auth/access";
import { NextRequest, NextResponse } from "next/server";

const AUTH_ONLY_PATHS = ["/auth/sign-in", "/auth/sign-up"];
/** Marketing / catalog — no login required */
const PUBLIC_PATHS = ["/", "/course", "/posts"];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

function isAdminPath(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const callbackUrl = `${pathname}${request.nextUrl.search}`;
  const isAuthOnly = AUTH_ONLY_PATHS.some((path) => pathname.startsWith(path));
  const isPublic = isPublicPath(pathname);
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    if (isPublic || isAuthOnly) {
      return NextResponse.next();
    }

    const url = request.nextUrl.clone();
    url.searchParams.set("callbackUrl", callbackUrl);
    url.pathname = "/auth/sign-in";
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
      if (isPublic || isAuthOnly) {
        return NextResponse.next();
      }

      const url = request.nextUrl.clone();
      url.searchParams.set("callbackUrl", callbackUrl);
      url.pathname = "/auth/sign-in";
      return NextResponse.redirect(url);
    }

    const data = (await response.json()) as MeResponse;
    const roles = data.user?.roles ?? [];

    if (isAdminPath(pathname) && !hasAdminAccess(roles)) {
      const url = request.nextUrl.clone();
      url.pathname = "/course";
      url.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(url);
    }

    if (isAuthOnly) {
      const dest = defaultPostLoginPath(roles);
      return NextResponse.redirect(new URL(dest, request.url));
    }
  } catch (error) {
    console.error(error);
    if (isPublic || isAuthOnly) {
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
