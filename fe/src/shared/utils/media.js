const PUBLIC_API_URL = import.meta.env.PUBLIC_API_URL || 'https://api.gats.vn';
const DOCKER_INTERNAL_HOST_RE = /^(minio|host\.docker\.internal)$/i;

/**
 * resolveMediaUrl - Chuẩn hóa URL ảnh/video/stream từ Backend (MinIO/S3, relative paths, internal hosts)
 * @param {string} url - URL media gốc từ Backend
 * @param {string} [fallback] - Fallback placeholder nếu URL rỗng
 * @returns {string} URL tuyệt đối có thể truy cập được từ browser
 */
export function resolveMediaUrl(url, fallback = '') {
  if (!url || typeof url !== 'string' || !url.trim()) return fallback;
  const raw = url.trim();

  if (raw.startsWith('data:') || raw.startsWith('blob:')) return raw;

  if (raw.startsWith('//')) {
    return `https:${raw}`;
  }

  // Absolute path từ server
  if (raw.startsWith('/')) {
    if (
      raw.startsWith('/api/') ||
      raw.startsWith('/media/') ||
      raw.startsWith('/files/') ||
      raw.startsWith('/thumbnails/') ||
      raw.startsWith('/uploads/')
    ) {
      return joinOrigin(getMediaOrigin(), raw);
    }
    return raw;
  }

  // Relative path không có slash đầu
  if (!hasUrlScheme(raw)) {
    return joinOrigin(getMediaOrigin(), `/${raw.replace(/^\/+/, '')}`);
  }

  try {
    const parsed = new URL(raw);
    if (DOCKER_INTERNAL_HOST_RE.test(parsed.hostname)) {
      return joinOrigin(
        getMediaOrigin(),
        `${parsed.pathname}${parsed.search}`
      );
    }
    return raw;
  } catch {
    return fallback;
  }
}

function hasUrlScheme(value) {
  return /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(value);
}

function joinOrigin(origin, path) {
  if (!origin) return path;
  return `${origin.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
}

function getMediaOrigin() {
  const base = PUBLIC_API_URL.replace(/\/$/, '');
  try {
    return new URL(base).origin;
  } catch {
    return 'https://api.gats.vn';
  }
}
