export { ACCESS_TOKEN_COOKIE, PUBLIC_API_URL, resolvePublicApiUrl } from "./public-api";

/**
 * Server-side BE base URL (SSR / Route Handlers / proxy only).
 * In Docker (same container as API): BE_API_URL=http://localhost:3000
 * Must NOT be imported by client components for socket/browser calls.
 */
export const BE_API_URL = process.env.BE_API_URL ?? "http://localhost:3000";
