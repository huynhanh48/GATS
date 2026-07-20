/** Public API origin for production (browser + sockets). */
export const PUBLIC_API_URL = "https://api.gats.vn";

export const ACCESS_TOKEN_COOKIE = "access_token";

/**
 * Browser-facing API URL (cookies / socket.io).
 * Never fall back to server-only BE_API_URL (that defaults to localhost:3000
 * and gets baked into the client bundle → WS spam).
 */
export function resolvePublicApiUrl(): string {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (
      host === "admin.gats.vn" ||
      host === "gats.vn" ||
      host === "www.gats.vn"
    ) {
      return PUBLIC_API_URL;
    }
    // Local admin (localhost:9000 / 9100) → local BE
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://localhost:3000";
    }
  }

  const fromEnv =
    process.env.NEXT_PUBLIC_BE_SOCKET_URL ||
    process.env.NEXT_PUBLIC_BE_API_URL ||
    process.env.NEXT_PUBLIC_API_URL;

  if (fromEnv && fromEnv.trim().length > 0) {
    return fromEnv.replace(/\/$/, "");
  }

  return PUBLIC_API_URL;
}
