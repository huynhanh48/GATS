"use client";

import { apiRequest, type ApiResult } from "@/lib/api/client";
import type {
  MediaKind,
  MediaListResponse,
  MediaRecord,
} from "@/lib/api/types";

export type MediaUploadOptions = {
  /** Called with an integer upload percentage (0-100). */
  onProgress?: (percent: number) => void;
  /** Abort signal to cancel an in-flight upload. */
  signal?: AbortSignal;
};

function buildUploadConfig(options?: MediaUploadOptions) {
  return {
    signal: options?.signal,
    onUploadProgress: options?.onProgress
      ? (event: { loaded: number; total?: number }) => {
          if (event.total) {
            options.onProgress?.(Math.round((event.loaded / event.total) * 100));
          }
        }
      : undefined,
  };
}

export const mediaClient = {
  /** POST /media/thumbnails – multipart field: file (image) */
  uploadThumbnail(
    file: File,
    options?: MediaUploadOptions,
  ): Promise<ApiResult<{ media: MediaRecord }>> {
    const form = new FormData();
    form.append("file", file);
    return apiRequest<{ media: MediaRecord }>({
      url: "/media/thumbnails",
      method: "POST",
      data: form,
      ...buildUploadConfig(options),
    });
  },

  /** POST /media/files – multipart field: file (pdf/docx/doc/md/txt) */
  uploadFile(
    file: File,
    options?: MediaUploadOptions,
  ): Promise<ApiResult<{ media: MediaRecord }>> {
    const form = new FormData();
    form.append("file", file);
    return apiRequest<{ media: MediaRecord }>({
      url: "/media/files",
      method: "POST",
      data: form,
      ...buildUploadConfig(options),
    });
  },

  /** GET /media?page&limit&kind */
  list(params: {
    page?: number;
    limit?: number;
    kind?: MediaKind;
  }): Promise<ApiResult<MediaListResponse>> {
    return apiRequest<MediaListResponse>({
      url: "/media",
      method: "GET",
      params,
    });
  },

  /** GET /media/:mediaId */
  getOne(mediaId: string): Promise<ApiResult<{ media: MediaRecord }>> {
    return apiRequest<{ media: MediaRecord }>({
      url: `/media/${mediaId}`,
      method: "GET",
    });
  },

  /** GET /media/:mediaId/link – returns { id, url } only */
  getLink(
    mediaId: string,
  ): Promise<ApiResult<{ id: string; url: string }>> {
    return apiRequest<{ id: string; url: string }>({
      url: `/media/${mediaId}/link`,
      method: "GET",
    });
  },

  /** DELETE /media/:mediaId – removes DB record + MinIO object */
  remove(mediaId: string): Promise<ApiResult<{ message: string }>> {
    return apiRequest<{ message: string }>({
      url: `/media/${mediaId}`,
      method: "DELETE",
    });
  },
};
