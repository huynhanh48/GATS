import { ACCESS_TOKEN_COOKIE, BE_API_URL } from "@/lib/api/config";
import type { MeResponse } from "@/lib/api/types";
import { hasAdminAccess } from "@/lib/auth/access";
import { NextRequest, NextResponse } from "next/server";

const AUTH_ONLY_PATHS = ["/auth/sign-in", "/auth/sign-up"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const callbackUrl = `${pathname}${request.nextUrl.search}`;
  const isAuthOnly = AUTH_ONLY_PATHS.some((path) => pathname.startsWith(path));
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    if (!isAuthOnly) {
      const url = request.nextUrl.clone();
      url.searchParams.set("callbackUrl", callbackUrl);
      url.pathname = "/auth/sign-in";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  try {
    const response = await fetch(`${BE_API_URL}/api/user/me`, {
      headers: {
        Cookie: `${ACCESS_TOKEN_COOKIE}=${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      if (!isAuthOnly) {
        const url = request.nextUrl.clone();
        url.searchParams.set("callbackUrl", callbackUrl);
        url.pathname = "/auth/sign-in";
        return NextResponse.redirect(url);
      }

      return NextResponse.next();
    }

    const data = (await response.json()) as MeResponse;
    const roles = data.user?.roles ?? [];

    if (!hasAdminAccess(roles)) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/sign-in";
      url.searchParams.set("error", "unauthorized");
      const redirect = NextResponse.redirect(url);
      redirect.cookies.delete(ACCESS_TOKEN_COOKIE);
      return redirect;
    }

    if (isAuthOnly) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  } catch (error) {
    console.error(error);
    if (!isAuthOnly) {
      const url = request.nextUrl.clone();
      url.searchParams.set("callbackUrl", callbackUrl);
      url.pathname = "/auth/sign-in";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
