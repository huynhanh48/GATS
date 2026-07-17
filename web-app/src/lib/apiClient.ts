import axios from "axios";

type SessionClearedListener = () => void;

let onUnauthorizedSession: SessionClearedListener | null = null;

/** AuthProvider registers this so a 401 resets session state once. */
export function setUnauthorizedSessionHandler(
  handler: SessionClearedListener | null
): void {
  onUnauthorizedSession = handler;
}

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

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
