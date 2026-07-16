import { cookies } from "next/headers";
import { hasAdminAccess } from "@/lib/auth/access";
import { ACCESS_TOKEN_COOKIE, BE_API_URL } from "./config";
import type { MeResponse } from "./types";

export type BackendSession = {
  user: {
    id: number;
    name: string;
    email: string;
    image: string | null;
    roles: string[];
    verified: boolean;
    type: string;
  };
};

function mapUser(user: MeResponse["user"]): BackendSession["user"] {
  return {
    id: user.id,
    name: user.userName,
    email: user.email,
    image: null,
    roles: user.roles,
    verified: user.verified,
    type: user.type,
  };
}

export async function getAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
}

export async function beFetch<T = unknown>(
  path: string,
  init?: RequestInit,
): Promise<{ data: T | null; status: number; ok: boolean; error?: string }> {
  const token = await getAccessToken();
  const url = `${BE_API_URL}/api${path.startsWith("/") ? path : `/${path}`}`;

  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Cookie", `${ACCESS_TOKEN_COOKIE}=${token}`);
  }
  // Satisfy the BE CSRF origin guard on mutating requests: the BE always
  // trusts its own origin (APP_URL), so send it for this server-side call.
  headers.set("Origin", BE_API_URL);

  try {
    const response = await fetch(url, {
      ...init,
      headers,
      cache: "no-store",
    });

    const contentType = response.headers.get("content-type") ?? "";
    let data: T | null = null;
    let error: string | undefined;

    if (contentType.includes("application/json")) {
      const json = await response.json();
      if (response.ok) {
        data = json as T;
      } else {
        error =
          (json as { message?: string }).message ??
          (json as { error?: string }).error ??
          "Request failed";
      }
    } else if (!response.ok) {
      error = await response.text();
    }

    return {
      data,
      status: response.status,
      ok: response.ok,
      error,
    };
  } catch (err) {
    return {
      data: null,
      status: 500,
      ok: false,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
}

/** Any authenticated user (learner or admin). */
export async function getBackendSession(): Promise<BackendSession | null> {
  const token = await getAccessToken();
  if (!token) return null;

  const result = await beFetch<MeResponse>("/user/me");
  if (!result.ok || !result.data?.user) return null;

  return { user: mapUser(result.data.user) };
}

/** Admin / instructor only — use for `/admin/**` pages. */
export async function getAdminSession(): Promise<BackendSession | null> {
  const session = await getBackendSession();
  if (!session || !hasAdminAccess(session.user.roles)) return null;
  return session;
}
