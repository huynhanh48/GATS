import axios from "axios";

type SessionClearedListener = () => void;

let onUnauthorizedSession: SessionClearedListener | null = null;

/** AuthProvider registers this so a 401 resets session state once. */
export function setUnauthorizedSessionHandler(
  handler: SessionClearedListener | null
): void {
  onUnauthorizedSession = handler;
}

/** Production API — browser must use HTTPS public host, never container localhost. */
export const PUBLIC_API_URL = "https://api.gats.vn";

/**
 * Resolve API base URL for the browser.
 * On gats.vn domains always use the public API (avoids mixed-content from
 * old Docker builds that baked http://IP:3000 or localhost).
 */
function resolveApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (
      host === "gats.vn" ||
      host === "www.gats.vn" ||
      host === "admin.gats.vn"
    ) {
      return PUBLIC_API_URL;
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
}

const apiClient = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Correct baseURL in the browser after hydration (SSR has no window).
if (typeof window !== "undefined") {
  apiClient.defaults.baseURL = resolveApiBaseUrl();
}

type RetriableRequest = {
  _auth401Handled?: boolean;
};

apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const status = error.response?.status;
    const originalRequest = error.config as
      | (RetriableRequest & typeof error.config)
      | undefined;

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._auth401Handled &&
      typeof window !== "undefined"
    ) {
      originalRequest._auth401Handled = true;
      onUnauthorizedSession?.();
    }

    return Promise.reject(error.response?.data || error.message);
  }
);

export default apiClient;
