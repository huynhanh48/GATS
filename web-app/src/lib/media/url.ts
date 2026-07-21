import { PUBLIC_API_URL } from "@/lib/apiClient";

const INTERNAL_HOST_RE =
  /^(localhost|127\.0\.0\.1|minio|host\.docker\.internal)(:\d+)?$/i;

/**
 * Normalize media URLs from BE (MinIO/S3, relative paths, internal hosts)
 * so cart/checkout `<img>` can load them in production.
 */
export function resolveMediaUrl(
  url: string | null | undefined,
  fallback = "/auth-bg.jpg",
): string {
  if (!url || !url.trim()) return fallback;
  const raw = url.trim();

  if (raw.startsWith("data:") || raw.startsWith("blob:")) return raw;

  if (raw.startsWith("//")) {
    return `https:${raw}`;
  }

  // Absolute path
  if (raw.startsWith("/")) {
    if (
      raw.startsWith("/api/") ||
      raw.startsWith("/media/") ||
      raw.startsWith("/files/") ||
      raw.startsWith("/thumbnails/") ||
      raw.startsWith("/uploads/")
    ) {
      return joinOrigin(getMediaOrigin(), raw);
    }
    return raw;
  }

  // Relative path without leading slash (uploads/a.jpg, media/x.webp)
  if (!hasUrlScheme(raw)) {
    return joinOrigin(getMediaOrigin(), `/${raw.replace(/^\/+/, "")}`);
  }

  try {
    const parsed = new URL(raw);
    if (INTERNAL_HOST_RE.test(parsed.hostname)) {
      return joinOrigin(
        getMediaOrigin(),
        `${parsed.pathname}${parsed.search}`,
      );
    }
    return raw;
  } catch {
    return fallback;
  }
}

function hasUrlScheme(value: string): boolean {
  return /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(value);
}

function joinOrigin(origin: string, path: string): string {
  if (!origin) return path;
  return `${origin.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Prefer dedicated media CDN/base over API origin when both are set. */
function getMediaOrigin(): string {
  const fromEnv =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_MEDIA_BASE_URL ||
        process.env.NEXT_PUBLIC_API_URL
      : undefined;
  const base = (fromEnv || PUBLIC_API_URL || "").replace(/\/$/, "");
  try {
    return new URL(base).origin;
  } catch {
    return "";
  }
}
