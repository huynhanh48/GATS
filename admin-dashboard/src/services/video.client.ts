"use client";

import { apiRequest, type ApiResult } from "@/lib/api/client";
import type {
  InitMultipartUploadData,
  InitMultipartUploadInput,
  LinkVideoInput,
  MultipartAbortData,
  MultipartCompleteData,
  MultipartPart,
  MultipartPartUrlData,
  VideoPlaybackData,
  VideoRecord,
  VideoWithDetails,
} from "@/lib/api/types";

export interface ListVideosResponse {
  data: VideoWithDetails[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const videoClient = {
  /** GET /courses/:courseId/lessons/:lessonId/video – existing video or data:null */
  getByLesson(
    courseId: string,
    lessonId: string,
  ): Promise<ApiResult<{ data: VideoRecord | null }>> {
    return apiRequest<{ data: VideoRecord | null }>({
      url: `/courses/${courseId}/lessons/${lessonId}/video`,
      method: "GET",
    });
  },

  /** GET /admin/videos/:videoId/status */
  getStatus(videoId: string): Promise<ApiResult<{ data: VideoRecord }>> {
    return apiRequest<{ data: VideoRecord }>({
      url: `/admin/videos/${videoId}/status`,
      method: "GET",
    });
  },

  /** POST /admin/videos/init-multipart-upload */
  initMultipartUpload(
    input: InitMultipartUploadInput,
  ): Promise<ApiResult<{ data: InitMultipartUploadData }>> {
    return apiRequest<{ data: InitMultipartUploadData }>({
      url: "/admin/videos/init-multipart-upload",
      method: "POST",
      data: input,
    });
  },

  /** POST /admin/videos/:videoId/multipart/part-url */
  getMultipartPartUrl(
    videoId: string,
    uploadId: string,
    partNumber: number,
  ): Promise<ApiResult<{ data: MultipartPartUrlData }>> {
    return apiRequest<{ data: MultipartPartUrlData }>({
      url: `/admin/videos/${videoId}/multipart/part-url`,
      method: "POST",
      data: { uploadId, partNumber },
    });
  },

  /** POST /admin/videos/:videoId/multipart/complete */
  completeMultipartUpload(
    videoId: string,
    uploadId: string,
    parts: MultipartPart[],
  ): Promise<ApiResult<{ data: MultipartCompleteData }>> {
    return apiRequest<{ data: MultipartCompleteData }>({
      url: `/admin/videos/${videoId}/multipart/complete`,
      method: "POST",
      data: { uploadId, parts },
    });
  },

  /** POST /admin/videos/:videoId/multipart/abort */
  abortMultipartUpload(
    videoId: string,
    uploadId: string,
  ): Promise<ApiResult<{ data: MultipartAbortData }>> {
    return apiRequest<{ data: MultipartAbortData }>({
      url: `/admin/videos/${videoId}/multipart/abort`,
      method: "POST",
      data: { uploadId },
    });
  },

  /** DELETE /admin/videos/:videoId – removes DB record + S3 objects */
  deleteVideo(
    videoId: string,
  ): Promise<
    ApiResult<{ data: { videoId: string; lessonId: string; deleted: true } }>
  > {
    return apiRequest<{
      data: { videoId: string; lessonId: string; deleted: true };
    }>({
      url: `/admin/videos/${videoId}`,
      method: "DELETE",
    });
  },

  /** POST /admin/videos/link – attach an existing HLS/MP4 URL instead of uploading */
  linkVideo(
    input: LinkVideoInput,
  ): Promise<ApiResult<{ data: VideoRecord }>> {
    return apiRequest<{ data: VideoRecord }>({
      url: "/admin/videos/link",
      method: "POST",
      data: input,
    });
  },

  /** GET /courses/:courseId/videos/:videoId/playback */
  getPlayback(
    courseId: string,
    videoId: string,
  ): Promise<ApiResult<{ data: VideoPlaybackData }>> {
    return apiRequest<{ data: VideoPlaybackData }>({
      url: `/courses/${courseId}/videos/${videoId}/playback`,
      method: "GET",
    });
  },

  /** GET /admin/videos – list all videos with pagination */
  listAllVideos(
    page: number = 1,
    limit: number = 20,
    status?: VideoRecord["status"],
  ): Promise<ApiResult<ListVideosResponse>> {
    return apiRequest<ListVideosResponse>({
      url: `/admin/videos`,
      method: "GET",
      params: { page, limit, status },
    });
  },

  /** GET /admin/videos/:videoId/status */
  getVideoStatus(
    videoId: string,
  ): Promise<ApiResult<{ data: { status: VideoRecord["status"] } }>> {
    return apiRequest<{ data: { status: VideoRecord["status"] } }>({
      url: `/admin/videos/${videoId}/status`,
      method: "GET",
    });
  },

  /**
   * Uploads a single part's bytes directly to the S3 presigned URL.
   * This bypasses the `/api/be` proxy entirely (S3 URL is already signed).
   */
  async uploadPart(
    url: string,
    blob: Blob,
    signal?: AbortSignal,
  ): Promise<string> {
    let res: Response;
    try {
      res = await fetch(url, { method: "PUT", body: blob, signal });
    } catch (err) {
      const isHttp =
        typeof url === "string" && url.startsWith("http://");
      if (isHttp && typeof window !== "undefined" && window.isSecureContext) {
        throw new Error(
          "Upload bị chặn mixed-content: URL S3 đang là HTTP trong khi admin chạy HTTPS. Đặt S3_PUBLIC_ENDPOINT (HTTPS) trên API rồi rebuild/restart.",
        );
      }
      throw err instanceof Error ? err : new Error("Failed to fetch");
    }
    if (!res.ok) {
      throw new Error(`Upload part failed (status ${res.status})`);
    }
    const etag = res.headers.get("ETag") || res.headers.get("etag");
    if (!etag) {
      throw new Error(
        "Missing ETag header – check S3 bucket CORS (ExposeHeaders: ETag)",
      );
    }
    return etag;
  },
};
