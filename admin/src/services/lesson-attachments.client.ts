"use client";

import { apiRequest, type ApiResult } from "@/lib/api/client";
import type {
  AttachLessonMediaInput,
  LessonAttachment,
} from "@/lib/api/types";

export type LessonAttachmentUploadOptions = {
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
};

function buildUploadConfig(options?: LessonAttachmentUploadOptions) {
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

export const lessonAttachmentsClient = {
  /** GET /courses/:courseId/lessons/:lessonId/attachments */
  list(
    courseId: string,
    lessonId: string,
  ): Promise<ApiResult<{ data: LessonAttachment[] }>> {
    return apiRequest<{ data: LessonAttachment[] }>({
      url: `/courses/${courseId}/lessons/${lessonId}/attachments`,
      method: "GET",
    });
  },

  /** POST /courses/:courseId/lessons/:lessonId/attachments – attach existing media */
  attach(
    courseId: string,
    lessonId: string,
    input: AttachLessonMediaInput,
  ): Promise<ApiResult<{ attachment: LessonAttachment }>> {
    return apiRequest<{ attachment: LessonAttachment }>({
      url: `/courses/${courseId}/lessons/${lessonId}/attachments`,
      method: "POST",
      data: input,
    });
  },

  /** POST /courses/:courseId/lessons/:lessonId/attachments/upload – upload + attach */
  uploadAndAttach(
    courseId: string,
    lessonId: string,
    file: File,
    options?: LessonAttachmentUploadOptions,
  ): Promise<ApiResult<{ attachment: LessonAttachment }>> {
    const form = new FormData();
    form.append("file", file);
    return apiRequest<{ attachment: LessonAttachment }>({
      url: `/courses/${courseId}/lessons/${lessonId}/attachments/upload`,
      method: "POST",
      data: form,
      ...buildUploadConfig(options),
    });
  },

  /** DELETE /courses/:courseId/lessons/:lessonId/attachments/:attachmentId */
  remove(
    courseId: string,
    lessonId: string,
    attachmentId: string,
  ): Promise<ApiResult<{ message: string }>> {
    return apiRequest<{ message: string }>({
      url: `/courses/${courseId}/lessons/${lessonId}/attachments/${attachmentId}`,
      method: "DELETE",
    });
  },
};
