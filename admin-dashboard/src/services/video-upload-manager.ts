"use client";

/**
 * Global multipart video upload manager.
 * Survives client-side route changes (module singleton) and resumes after
 * hard refresh via IndexedDB (file + completed part ETags).
 *
 * Note: closing the browser / powering off the machine still stops network
 * traffic; on next open we auto-resume remaining parts.
 */

import { toast } from "sonner";
import {
  publishVideoUploadProgress,
  subscribeToVideoProgress,
  type VideoProgressPayload,
} from "@/services/realtime.client";
import { videoClient } from "@/services/video.client";
import type {
  MultipartPart,
  VideoContentType,
  VideoRecord,
  VideoStatus,
} from "@/lib/api/types";
import {
  deleteJob,
  getAllJobs,
  getFile,
  putFile,
  putJob,
  type PersistedUploadJob,
} from "@/lib/video-upload-db";

const CONCURRENCY = 4;
const ALLOWED: VideoContentType[] = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
];

export type UploadJobStatus =
  | "queued"
  | "uploading"
  | "completing"
  | "processing"
  | "done"
  | "error"
  | "aborted";

export type UploadJobSnapshot = {
  id: string;
  courseId: string;
  lessonId: string;
  title: string;
  filename: string;
  size: number;
  videoId: string | null;
  uploadId: string | null;
  status: UploadJobStatus;
  progressPct: number;
  uploadedBytes: number;
  totalBytes: number;
  errorMessage: string | null;
  completedParts: number;
  totalParts: number;
  stageLabel: string | null;
  stageLoadedBytes: number | null;
  stageTotalBytes: number | null;
};

type InternalJob = {
  snapshot: UploadJobSnapshot;
  file: File;
  partSize: number;
  parts: Array<MultipartPart | undefined>;
  abortController: AbortController;
  runPromise: Promise<void> | null;
  realtimeUnsubscribe: (() => void) | null;
};

type Listener = (jobs: UploadJobSnapshot[]) => void;

const jobs = new Map<string, InternalJob>();
const listeners = new Set<Listener>();
let bootstrapped = false;

function emit() {
  const list = getSnapshots();
  for (const listener of listeners) {
    listener(list);
  }
}

export function getSnapshots(): UploadJobSnapshot[] {
  return Array.from(jobs.values()).map((j) => ({ ...j.snapshot }));
}

export function getJobForLesson(lessonId: string): UploadJobSnapshot | null {
  for (const job of jobs.values()) {
    if (
      job.snapshot.lessonId === lessonId &&
      job.snapshot.status !== "done" &&
      job.snapshot.status !== "aborted"
    ) {
      return { ...job.snapshot };
    }
  }
  return null;
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  listener(getSnapshots());
  return () => listeners.delete(listener);
}

function updateSnapshot(
  job: InternalJob,
  patch: Partial<UploadJobSnapshot>,
): void {
  job.snapshot = { ...job.snapshot, ...patch };
  emit();
}

function videoProgressLabel(payload: VideoProgressPayload): string {
  if (payload.errorMessage) return payload.errorMessage;
  if (payload.message) return payload.message;
  switch (payload.phase) {
    case "upload":
      return "Đang upload lên storage";
    case "download":
      return "Backend đang tải file gốc";
    case "transcode":
      return "Backend đang transcode";
    case "hls_upload":
      return "Backend đang upload HLS";
    case "complete":
      return "Video đã sẵn sàng";
    case "failed":
      return "Xử lý video thất bại";
    default:
      return "Đang xử lý video";
  }
}

function bindVideoRealtime(job: InternalJob, videoId: string): void {
  if (job.realtimeUnsubscribe) return;

  let pollInterval: ReturnType<typeof setInterval> | null = null;
  let isPolling = false;

  const startPolling = () => {
    if (pollInterval) return;
    pollInterval = setInterval(async () => {
      if (isPolling) return;
      isPolling = true;
      try {
        const res = await videoClient.getVideoStatus(videoId);
        if (res.data?.data) {
          const status = res.data.data.status;
          if (status === "failed") {
            updateSnapshot(job, {
              status: "error",
              errorMessage: "Xử lý video thất bại tại backend.",
              stageLabel: "Xử lý video thất bại",
            });
            stopPolling();
          } else if (status === "ready") {
            updateSnapshot(job, {
              status: "done",
              progressPct: 100,
              stageLabel: "Video đã sẵn sàng",
            });
            toast.success(`Video đã xử lý xong: ${job.snapshot.title}`);
            stopPolling();
            setTimeout(() => {
              jobs.delete(job.snapshot.id);
              emit();
            }, 4500);
          }
        }
      } catch (e) {
        console.error("Failed to poll video status", e);
      } finally {
        isPolling = false;
      }
    }, 3000);
  };

  const stopPolling = () => {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
  };

  // Start polling immediately as fallback for socket
  startPolling();

  job.realtimeUnsubscribe = subscribeToVideoProgress(videoId, (payload) => {
    if (payload.status === "failed" || payload.phase === "failed") {
      updateSnapshot(job, {
        status: "error",
        errorMessage:
          payload.errorMessage || payload.message || "Xử lý video thất bại",
        stageLabel: videoProgressLabel(payload),
        stageLoadedBytes: payload.loadedBytes ?? null,
        stageTotalBytes: payload.totalBytes ?? null,
      });
      stopPolling();
      return;
    }

    if (payload.phase === "complete") {
      updateSnapshot(job, {
        status: "done",
        progressPct: 100,
        stageLabel: videoProgressLabel(payload),
        stageLoadedBytes: payload.loadedBytes ?? null,
        stageTotalBytes: payload.totalBytes ?? null,
      });
      toast.success(`Video đã xử lý xong: ${job.snapshot.title}`);
      job.realtimeUnsubscribe?.();
      job.realtimeUnsubscribe = null;
      stopPolling();
      setTimeout(() => {
        jobs.delete(job.snapshot.id);
        emit();
      }, 4500);
      return;
    }

    if (
      payload.status === "completed" &&
      (payload.phase === "download" || payload.phase === "hls_upload")
    ) {
      updateSnapshot(job, {
        status: "processing",
        progressPct: payload.progressPct ?? job.snapshot.progressPct,
        stageLabel: videoProgressLabel(payload),
        stageLoadedBytes: payload.loadedBytes ?? null,
        stageTotalBytes: payload.totalBytes ?? null,
      });
      return;
    }

    updateSnapshot(job, {
      status: payload.phase === "upload" ? "uploading" : "processing",
      progressPct: payload.progressPct ?? job.snapshot.progressPct,
      uploadedBytes:
        payload.phase === "upload"
          ? (payload.loadedBytes ?? job.snapshot.uploadedBytes)
          : job.snapshot.uploadedBytes,
      stageLabel: videoProgressLabel(payload),
      stageLoadedBytes: payload.loadedBytes ?? null,
      stageTotalBytes: payload.totalBytes ?? null,
    });
  });

  const originalUnsubscribe = job.realtimeUnsubscribe;
  job.realtimeUnsubscribe = () => {
    stopPolling();
    originalUnsubscribe();
  };
}

function toPersisted(job: InternalJob): PersistedUploadJob | null {
  if (!job.snapshot.videoId || !job.snapshot.uploadId) return null;
  const completedParts = job.parts.filter((p): p is MultipartPart =>
    Boolean(p?.etag),
  );
  return {
    id: job.snapshot.id,
    courseId: job.snapshot.courseId,
    lessonId: job.snapshot.lessonId,
    title: job.snapshot.title,
    filename: job.snapshot.filename,
    contentType: job.file.type,
    size: job.snapshot.size,
    videoId: job.snapshot.videoId,
    uploadId: job.snapshot.uploadId,
    partSize: job.partSize,
    totalParts: job.snapshot.totalParts,
    completedParts,
    uploadedBytes: job.snapshot.uploadedBytes,
    status:
      job.snapshot.status === "completing"
        ? "completing"
        : job.snapshot.status === "error"
          ? "error"
          : job.snapshot.status === "aborted"
            ? "aborted"
            : "uploading",
    errorMessage: job.snapshot.errorMessage,
    updatedAt: Date.now(),
  };
}

async function persistJob(job: InternalJob): Promise<void> {
  const data = toPersisted(job);
  if (!data) return;
  try {
    await putJob(data);
  } catch {
    // Persistence failure should not stop the in-flight upload.
  }
}

async function uploadOnePart(
  videoId: string,
  uploadId: string,
  partNumber: number,
  blob: Blob,
  signal: AbortSignal,
): Promise<MultipartPart> {
  const urlRes = await videoClient.getMultipartPartUrl(
    videoId,
    uploadId,
    partNumber,
  );
  if (urlRes.error || !urlRes.data?.data) {
    throw new Error(urlRes.error?.message || "Không lấy được URL upload");
  }
  const etag = await videoClient.uploadPart(urlRes.data.data.url, blob, signal);
  return { partNumber, etag };
}

async function runJob(job: InternalJob): Promise<void> {
  const { abortController, file } = job;
  const signal = abortController.signal;

  try {
    let videoId = job.snapshot.videoId;
    let uploadId = job.snapshot.uploadId;

    if (!videoId || !uploadId || job.snapshot.totalParts === 0) {
      const contentType = ALLOWED.find((t) => t === file.type);
      if (!contentType) {
        throw new Error("Chỉ hỗ trợ file MP4, MOV hoặc WebM");
      }

      updateSnapshot(job, { status: "uploading" });
      const initRes = await videoClient.initMultipartUpload({
        courseId: job.snapshot.courseId,
        lessonId: job.snapshot.lessonId,
        title: job.snapshot.title,
        filename: file.name,
        contentType,
        size: file.size,
      });
      if (initRes.error || !initRes.data?.data) {
        throw new Error(initRes.error?.message || "Không khởi tạo được upload");
      }

      const init = initRes.data.data;
      videoId = init.videoId;
      uploadId = init.uploadId;
      job.partSize = init.partSize;
      job.parts = new Array(init.totalParts);
      updateSnapshot(job, {
        videoId,
        uploadId,
        totalParts: init.totalParts,
        status: "uploading",
        stageLabel: "Đang upload lên storage",
      });
      bindVideoRealtime(job, videoId);
      await putFile(job.snapshot.id, file);
      await persistJob(job);
    } else {
      updateSnapshot(job, { status: "uploading" });
    }

    if (!videoId || !uploadId) {
      throw new Error("Missing multipart session");
    }
    bindVideoRealtime(job, videoId);

    const totalParts = job.snapshot.totalParts;
    const partSize = job.partSize;

    let uploaded = job.snapshot.uploadedBytes;
    const pendingIndexes: number[] = [];
    for (let i = 0; i < totalParts; i++) {
      if (!job.parts[i]?.etag) pendingIndexes.push(i);
    }

    let cursor = 0;
    const worker = async () => {
      while (cursor < pendingIndexes.length) {
        if (signal.aborted) throw new DOMException("Aborted", "AbortError");
        const index = pendingIndexes[cursor];
        cursor += 1;
        const partNumber = index + 1;
        const start = index * partSize;
        const end = Math.min(start + partSize, file.size);
        const blob = file.slice(start, end);
        const part = await uploadOnePart(
          videoId!,
          uploadId!,
          partNumber,
          blob,
          signal,
        );
        job.parts[index] = part;
        uploaded += end - start;
        updateSnapshot(job, {
          uploadedBytes: uploaded,
          progressPct: Math.min(100, (uploaded / file.size) * 100),
          completedParts: job.parts.filter((p) => p?.etag).length,
          stageLabel: "Đang upload lên storage",
          stageLoadedBytes: uploaded,
          stageTotalBytes: file.size,
        });
        publishVideoUploadProgress({
          videoId: videoId!,
          courseId: job.snapshot.courseId,
          lessonId: job.snapshot.lessonId,
          progressPct: Math.min(100, (uploaded / file.size) * 100),
          loadedBytes: uploaded,
          totalBytes: file.size,
          message: "Uploading original video",
        });
        void persistJob(job);
      }
    };

    await Promise.all(
      Array.from(
        { length: Math.min(CONCURRENCY, Math.max(pendingIndexes.length, 1)) },
        () => worker(),
      ),
    );

    if (signal.aborted) throw new DOMException("Aborted", "AbortError");

    updateSnapshot(job, {
      status: "completing",
      progressPct: 100,
      stageLabel: "Đang hoàn tất multipart upload",
      stageLoadedBytes: file.size,
      stageTotalBytes: file.size,
    });
    const parts = job.parts.filter((p): p is MultipartPart => Boolean(p?.etag));
    if (parts.length !== totalParts) {
      throw new Error("Một số phần upload bị thiếu — hãy thử lại");
    }

    const completeRes = await videoClient.completeMultipartUpload(
      videoId,
      uploadId,
      parts,
    );
    if (completeRes.error || !completeRes.data?.data) {
      throw new Error(
        completeRes.error?.message || "Không hoàn tất được upload",
      );
    }

    updateSnapshot(job, {
      status: "processing",
      progressPct: 100,
      uploadedBytes: file.size,
      stageLabel: "Upload xong, backend đang xử lý video",
      stageLoadedBytes: null,
      stageTotalBytes: null,
    });
    await deleteJob(job.snapshot.id).catch(() => undefined);
    toast.success(`Upload xong, đang xử lý: ${job.snapshot.title}`);
  } catch (err) {
    if (
      signal.aborted ||
      (err instanceof DOMException && err.name === "AbortError")
    ) {
      updateSnapshot(job, { status: "aborted", errorMessage: null });
      job.realtimeUnsubscribe?.();
      job.realtimeUnsubscribe = null;
      await deleteJob(job.snapshot.id).catch(() => undefined);
      jobs.delete(job.snapshot.id);
      emit();
      return;
    }
    const message = err instanceof Error ? err.message : "Upload thất bại";
    updateSnapshot(job, { status: "error", errorMessage: message });
    await persistJob(job);
    toast.error(message);
  }
}

export type StartUploadInput = {
  courseId: string;
  lessonId: string;
  title: string;
  file: File;
};

export async function startUpload(input: StartUploadInput): Promise<string> {
  const existing = getJobForLesson(input.lessonId);
  if (
    existing &&
    (existing.status === "uploading" ||
      existing.status === "queued" ||
      existing.status === "completing" ||
      existing.status === "processing")
  ) {
    throw new Error("Bài học này đang có upload/xử lý chạy ngầm");
  }

  const contentType = ALLOWED.find((t) => t === input.file.type);
  if (!contentType) {
    throw new Error("Chỉ hỗ trợ file MP4, MOV hoặc WebM");
  }
  if (!input.title.trim()) {
    throw new Error("Vui lòng nhập tiêu đề video");
  }

  const id = crypto.randomUUID();
  const job: InternalJob = {
    file: input.file,
    partSize: 0,
    parts: [],
    abortController: new AbortController(),
    runPromise: null,
    realtimeUnsubscribe: null,
    snapshot: {
      id,
      courseId: input.courseId,
      lessonId: input.lessonId,
      title: input.title.trim(),
      filename: input.file.name,
      size: input.file.size,
      videoId: null,
      uploadId: null,
      status: "queued",
      progressPct: 0,
      uploadedBytes: 0,
      totalBytes: input.file.size,
      errorMessage: null,
      completedParts: 0,
      totalParts: 0,
      stageLabel: null,
      stageLoadedBytes: null,
      stageTotalBytes: null,
    },
  };

  jobs.set(id, job);
  emit();
  // toast.message("Upload chạy ngầm — có thể chuyển trang, tiến độ vẫn tiếp tục");
  job.runPromise = runJob(job);
  return id;
}

export async function abortUpload(jobId: string): Promise<void> {
  const job = jobs.get(jobId);
  if (!job) return;
  job.abortController.abort();
  const { videoId, uploadId } = job.snapshot;
  if (videoId && uploadId) {
    await videoClient
      .abortMultipartUpload(videoId, uploadId)
      .catch(() => undefined);
  }
  job.realtimeUnsubscribe?.();
  job.realtimeUnsubscribe = null;
  await deleteJob(jobId).catch(() => undefined);
  updateSnapshot(job, { status: "aborted" });
  jobs.delete(jobId);
  emit();
  toast("Đã hủy upload");
}

export function abortUploadForLesson(lessonId: string): Promise<void> {
  const snap = getJobForLesson(lessonId);
  if (!snap) return Promise.resolve();
  return abortUpload(snap.id);
}

export function jobToVideoRecord(
  job: UploadJobSnapshot,
  status: VideoStatus = "pending_upload",
): VideoRecord {
  return {
    videoId: job.videoId ?? "",
    courseId: job.courseId,
    lessonId: job.lessonId,
    title: job.title,
    status,
    originalKey: null,
    hlsKey: null,
    mp4Url: null,
    errorMessage: job.errorMessage,
    duration: null,
    size: job.size,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Reload unfinished jobs from IndexedDB and continue remaining parts.
 * Safe to call once on app boot.
 */
export async function bootstrapResumableUploads(): Promise<void> {
  if (bootstrapped || typeof window === "undefined") return;
  bootstrapped = true;

  let persisted: PersistedUploadJob[] = [];
  try {
    persisted = await getAllJobs();
  } catch {
    return;
  }

  for (const row of persisted) {
    if (row.status === "aborted" || row.status === "error") {
      // Keep errored jobs visible via HUD after hydrate? Drop errors from IDB
      // but surface toast once — simpler: resume uploading/completing only.
      if (row.status !== "error") {
        await deleteJob(row.id).catch(() => undefined);
      }
      continue;
    }

    // Already restored in this session
    if (jobs.has(row.id)) continue;

    const file = await getFile(row.id);
    if (!file) {
      await deleteJob(row.id).catch(() => undefined);
      toast.error(
        `Không tìm thấy file để resume upload “${row.title}”. Hãy upload lại.`,
      );
      continue;
    }

    const parts: Array<MultipartPart | undefined> = new Array(row.totalParts);
    for (const p of row.completedParts) {
      parts[p.partNumber - 1] = p;
    }

    const job: InternalJob = {
      file,
      partSize: row.partSize,
      parts,
      abortController: new AbortController(),
      runPromise: null,
      realtimeUnsubscribe: null,
      snapshot: {
        id: row.id,
        courseId: row.courseId,
        lessonId: row.lessonId,
        title: row.title,
        filename: row.filename,
        size: row.size,
        videoId: row.videoId,
        uploadId: row.uploadId,
        status: "queued",
        progressPct: Math.min(100, (row.uploadedBytes / row.size) * 100),
        uploadedBytes: row.uploadedBytes,
        totalBytes: row.size,
        errorMessage: null,
        completedParts: row.completedParts.length,
        totalParts: row.totalParts,
        stageLabel: null,
        stageLoadedBytes: null,
        stageTotalBytes: null,
      },
    };
    jobs.set(row.id, job);
    toast.message(`Tiếp tục upload ngầm: ${row.title}`);
    job.runPromise = runJob(job);
  }

  emit();
}

export function hasActiveUploads(): boolean {
  return getSnapshots().some(
    (j) =>
      j.status === "uploading" ||
      j.status === "queued" ||
      j.status === "completing",
  );
}
