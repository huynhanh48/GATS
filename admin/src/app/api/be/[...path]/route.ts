import { ACCESS_TOKEN_COOKIE, BE_API_URL } from "@/lib/api/config";
import { isPathAllowed } from "@/lib/api/proxy-allowlist";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

async function proxyRequest(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  const { path } = await context.params;

  if (!isPathAllowed(path)) {
    return NextResponse.json({ message: "Forbidden path" }, { status: 403 });
  }

  const targetUrl = new URL(`/api/${path.join("/")}`, BE_API_URL);
  request.nextUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value);
  });

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) {
    headers.set("Content-Type", contentType);
  }
  if (accessToken) {
    headers.set("Cookie", `${ACCESS_TOKEN_COOKIE}=${accessToken}`);
  }
  // Preserve the browser's real Origin so the BE can validate it against
  // FRONTEND_URL. Server-to-server calls may legitimately have no Origin;
  // in that case omit the header instead of pretending to be localhost.
  const requestOrigin = request.headers.get("origin");
  if (requestOrigin) {
    headers.set("Origin", requestOrigin);
  }

  const init: RequestInit & { duplex?: "half" } = {
    method: request.method,
    headers,
    cache: "no-store",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    // We stream the body directly to the backend
    init.body = request.body;
    // Required for streaming bodies in Node.js fetch.
    init.duplex = "half";
  }

  const backendResponse = await fetch(targetUrl.toString(), init);
  const responseBody = await backendResponse.text();
  const response = new NextResponse(responseBody, {
    status: backendResponse.status,
    statusText: backendResponse.statusText,
  });

  const responseContentType = backendResponse.headers.get("content-type");
  if (responseContentType) {
    response.headers.set("Content-Type", responseContentType);
  }

  const setCookieHeaders = backendResponse.headers.getSetCookie?.() ?? [];
  const authCookieDomain =
    process.env.AUTH_COOKIE_DOMAIN?.trim() || undefined;
  for (const cookieHeader of setCookieHeaders) {
    const cookieName = cookieHeader.split("=")[0]?.trim();
    if (cookieName === ACCESS_TOKEN_COOKIE) {
      const match = cookieHeader.match(/access_token=([^;]+)/);
      if (match?.[1]) {
        response.cookies.set(ACCESS_TOKEN_COOKIE, match[1], {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 7 * 24 * 60 * 60,
          domain: authCookieDomain,
        });
      }
    }
  }

  if (request.method === "POST" && path.join("/") === "user/logout") {
    response.cookies.set(ACCESS_TOKEN_COOKIE, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      domain: authCookieDomain,
    });
  }

  return response;
}

export async function GET(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function POST(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}
