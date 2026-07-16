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
  // The BE runs a CSRF origin guard that rejects mutating requests whose
  // Origin is missing (in prod) or not allowlisted. The BE always trusts its
  // own origin, so present it as the request origin for this server-to-server
  // call. The browser's cross-origin Origin (:9000) is intentionally dropped.
  headers.set("Origin", BE_API_URL);

  const init: RequestInit = {
    method: request.method,
    headers,
    cache: "no-store",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    // Read as raw bytes so binary payloads (multipart file uploads) are
    // forwarded intact. Using text() would corrupt non-UTF8 file content.
    init.body = await request.arrayBuffer();
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
  for (const cookieHeader of setCookieHeaders) {
    const cookieName = cookieHeader.split("=")[0]?.trim();
    if (cookieName === ACCESS_TOKEN_COOKIE) {
      const match = cookieHeader.match(/access_token=([^;]+)/);
      if (match?.[1]) {
        response.cookies.set(ACCESS_TOKEN_COOKIE, match[1], {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          maxAge: 7 * 24 * 60 * 60,
        });
      }
    }
  }

  if (request.method === "POST" && path.join("/") === "user/logout") {
    response.cookies.delete(ACCESS_TOKEN_COOKIE);
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
