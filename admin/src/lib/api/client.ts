import axios from "axios";
import type {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";

type ApiErrorPayload = {
  message?: string;
  error?: string;
};

export type ApiError = {
  message: string;
  status?: number;
};

export type ApiResult<T = unknown> = {
  data: T | null;
  error: ApiError | null;
};

export class ApiRequestError extends Error {
  status?: number;
  payload?: unknown;

  constructor(message: string, status?: number, payload?: unknown) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.payload = payload;
  }
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: "/api/be",
  withCredentials: true,
  timeout: 60_000,
  headers: {
    Accept: "application/json",
  },
});

function payloadMessage(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") return undefined;

  const body = payload as ApiErrorPayload;
  return body.message ?? body.error;
}

export function normalizeApiError(
  error: unknown,
  fallback = "Request failed",
): ApiError {
  if (error instanceof ApiRequestError) {
    return {
      message: error.message || fallback,
      status: error.status,
    };
  }

  if (axios.isAxiosError<ApiErrorPayload>(error)) {
    return {
      message:
        payloadMessage(error.response?.data) ?? error.message ?? fallback,
      status: error.response?.status,
    };
  }

  if (error instanceof Error) {
    return { message: error.message || fallback };
  }

  return { message: fallback };
}

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<ApiErrorPayload>) => {
    const message =
      payloadMessage(error.response?.data) ?? error.message ?? "Network error";

    return Promise.reject(
      new ApiRequestError(
        message,
        error.response?.status,
        error.response?.data,
      ),
    );
  },
);

export async function toApiResult<T>(
  request: Promise<AxiosResponse<T>>,
): Promise<ApiResult<T>> {
  try {
    const response = await request;
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: normalizeApiError(error) };
  }
}

export function apiRequest<T>(
  config: AxiosRequestConfig,
): Promise<ApiResult<T>> {
  return toApiResult(apiClient.request<T>(config));
}
