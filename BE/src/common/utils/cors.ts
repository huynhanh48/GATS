import EnvVars from '@src/common/constants/env';

/**
 * Parse FRONTEND_URL as a comma-separated allowlist of origins.
 * Example: "http://localhost:3001,http://127.0.0.1:3001"
 * The backend's own origin (APP_URL) is always trusted: same-origin
 * requests (e.g. server-rendered dev pages) are never CSRF.
 */
export function getAllowedOrigins(): string[] {
  const origins = EnvVars.FrontendUrl.split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  const appOrigin = EnvVars.AppUrl?.trim().replace(/\/$/, '');
  if (appOrigin && !origins.includes(appOrigin)) {
    origins.push(appOrigin);
  }

  return origins;
}

export function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return false;
  return getAllowedOrigins().includes(origin);
}
