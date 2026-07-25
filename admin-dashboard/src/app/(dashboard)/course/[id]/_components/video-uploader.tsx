"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { videoClient } from "@/services/video.client";
import { subscribeToVideoProgress } from "@/services/realtime.client";
import {
  abortUploadForLesson,
  getJobForLesson,
  startUpload,
  subscribe,
  type UploadJobSnapshot,
} from "@/services/video-upload-manager";
import InputGroup from "@/components/FormElements/InputGroup";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Play, Trash2, Loader2 } from "lucide-react";
import type {
  VideoContentType,
  VideoRecord,
  VideoStatus,
} from "@/lib/api/types";

type VideoUploaderProps = {
  courseId: string;
  lessonId: string;
  existingVideo?: VideoRecord | null;
  /** Called whenever the video record changes (created, replaced, status updated). */
  onVideoUpdated?: (video: VideoRecord) => void;
};

const ALLOWED_CONTENT_TYPES: VideoContentType[] = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
];
const POLL_INTERVAL_MS = 3000;

const STATUS_LABELS: Record<VideoStatus, string> = {
  pending_upload: "Đang chờ upload",
  uploaded: "Đã upload, chờ xử lý",
  processing: "Đang xử lý (HLS + FLAC)",
  ready: "Sẵn sàng",
  failed: "Lỗi",
};

const STATUS_BADGE_CLASS: Record<VideoStatus, string> = {
  pending_upload: "bg-yellow-light-4 text-yellow-dark",
  uploaded: "bg-blue-light-5 text-blue-dark",
  processing: "bg-blue-light-5 text-blue-dark",
  ready: "bg-green-light-6 text-green-dark",
  failed: "bg-red-light-6 text-red",
};

function formatBytes(bytes: number | null): string {
  if (!bytes || bytes <= 0) return "-";
  const mb = bytes / 1024 / 1024;
  if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`;
  return `${mb.toFixed(1)} MB`;
}

function isProcessingStatus(status: VideoStatus): boolean {
  return (
    status === "pending_upload" ||
    status === "uploaded" ||
    status === "processing"
  );
}

function isActiveJob(job: UploadJobSnapshot | null): boolean {
  return Boolean(
    job &&
    (job.status === "uploading" ||
      job.status === "queued" ||
      job.status === "completing"),
  );
}

export function VideoUploader({
  courseId,
  lessonId,
  existingVideo,
  onVideoUpdated,
}: VideoUploaderProps) {
  const [video, setVideo] = useState<VideoRecord | null>(existingVideo ?? null);
  const [replaceConfirmOpen, setReplaceConfirmOpen] = useState(false);
  const [title, setTitle] = useState(existingVideo?.title ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [bgJob, setBgJob] = useState<UploadJobSnapshot | null>(() =>
    getJobForLesson(lessonId),
  );

  const uploading = isActiveJob(bgJob);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollGenRef = useRef(0);
  const onVideoUpdatedRef = useRef(onVideoUpdated);
  onVideoUpdatedRef.current = onVideoUpdated;

  useEffect(() => {
    setVideo(existingVideo ?? null);
  }, [existingVideo]);

  useEffect(() => {
    return subscribe((jobs) => {
      const job =
        jobs.find((j) => j.lessonId === lessonId && j.status !== "aborted") ??
        null;
      setBgJob(job);

      if (
        job?.videoId &&
        (job.status === "processing" || job.status === "done")
      ) {
        const next: VideoRecord = {
          videoId: job.videoId,
          courseId: job.courseId,
          lessonId: job.lessonId,
          title: job.title,
          status: job.status === "done" ? "ready" : "processing",
          originalKey: null,
          hlsKey: null,
          mp4Url: null,
          errorMessage: null,
          duration: null,
          size: job.size,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setVideo(next);
        onVideoUpdatedRef.current?.(next);
      }

      if (job?.status === "error") {
        setErrorMsg(job.errorMessage);
      }
    });
  }, [lessonId]);

  const stopPolling = useCallback(() => {
    pollGenRef.current += 1;
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const pollStatus = useCallback(
    (videoId: string) => {
      stopPolling();
      const gen = pollGenRef.current;
      const isActive = () => gen === pollGenRef.current;

      const tick = async () => {
        if (!isActive()) return;
        const res = await videoClient.getStatus(videoId);
        if (!isActive()) return;

        if (res.error || !res.data?.data) {
          if (res.error?.status === 404) return;
          pollTimerRef.current = setTimeout(tick, POLL_INTERVAL_MS);
          return;
        }

        const updated = res.data.data;
        setVideo(updated);
        onVideoUpdatedRef.current?.(updated);

        if (isProcessingStatus(updated.status)) {
          pollTimerRef.current = setTimeout(tick, POLL_INTERVAL_MS);
        } else if (updated.status === "ready") {
          toast.success("Video đã xử lý xong, sẵn sàng phát!");
        } else if (updated.status === "failed") {
          toast.error(updated.errorMessage || "Xử lý video thất bại");
        }
      };

      void tick();
    },
    [stopPolling],
  );

  useEffect(() => {
    if (!video || !isProcessingStatus(video.status) || uploading) {
      return stopPolling;
    }

    const unsubscribe = subscribeToVideoProgress(video.videoId, (payload) => {
      if (payload.status === "failed" || payload.phase === "failed") {
        const failed: VideoRecord = {
          ...video,
          status: "failed",
          errorMessage:
            payload.errorMessage || payload.message || "Xử lý video thất bại",
          updatedAt: payload.updatedAt,
        };
        setVideo(failed);
        onVideoUpdatedRef.current?.(failed);
        toast.error(failed.errorMessage || "Xử lý video thất bại");
        return;
      }

      if (payload.phase === "complete") {
        pollStatus(video.videoId);
        return;
      }

      const processing: VideoRecord = {
        ...video,
        status: "processing",
        updatedAt: payload.updatedAt,
      };
      setVideo(processing);
      onVideoUpdatedRef.current?.(processing);
    });

    if (video && isProcessingStatus(video.status) && !uploading) {
      pollStatus(video.videoId);
    }
    return () => {
      unsubscribe();
      stopPolling();
    };
  }, [video?.videoId, video?.status, uploading, pollStatus, stopPolling]);

  useEffect(() => {
    if (bgJob?.status === "done" && bgJob.videoId) {
      pollStatus(bgJob.videoId);
    }
  }, [bgJob?.status, bgJob?.videoId, pollStatus]);

  async function handleStartUpload() {
    if (!file) {
      toast.error("Vui lòng chọn file video");
      return;
    }
    if (!title.trim()) {
      toast.error("Vui lòng nhập tiêu đề video");
      return;
    }
    if (!ALLOWED_CONTENT_TYPES.includes(file.type as VideoContentType)) {
      toast.error("Chỉ hỗ trợ file MP4, MOV hoặc WebM");
      return;
    }

    setErrorMsg(null);
    try {
      await startUpload({
        courseId,
        lessonId,
        title: title.trim(),
        file,
      });
      setFile(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload thất bại";
      setErrorMsg(message);
      toast.error(message);
    }
  }

  async function handleAbortUpload() {
    await abortUploadForLesson(lessonId);
    setErrorMsg(null);
  }

  async function executeReplaceVideo() {
    if (!video) return;
    setReplaceConfirmOpen(false);

    stopPolling();
    setDeleting(true);
    const res = await videoClient.deleteVideo(video.videoId);
    setDeleting(false);
    if (res.error) {
      toast.error(res.error.message);
      return;
    }

    setVideo(null);
    setTitle("");
    setFile(null);
    setErrorMsg(null);
    toast.success("Đã xóa video cũ, hãy upload video mới");
  }

  async function handlePreview() {
    if (!video) return;
    setPreviewLoading(true);
    const res = await videoClient.getPlayback(courseId, video.videoId);
    setPreviewLoading(false);
    if (res.error || !res.data?.data) {
      toast.error(res.error?.message || "Không lấy được link phát video");
      return;
    }
    window.open(res.data.data.playbackUrl, "_blank", "noopener,noreferrer");
  }

  const showExistingCard = Boolean(video) && !uploading;

  const showUploadForm =
    uploading ||
    bgJob?.status === "error" ||
    !video;

  return (
    <div className="space-y-4">
      <p className="text-sm text-dark-4 dark:text-dark-6">
        Video bài học (upload theo phần, chạy ngầm khi chuyển trang; đóng tab sẽ
        tạm dừng rồi tự resume khi mở lại)
      </p>

      {showExistingCard && video && (
        <div className="rounded-lg border border-stroke p-4 dark:border-dark-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_BADGE_CLASS[video.status]}`}
              >
                {STATUS_LABELS[video.status]}
              </span>
              {video.title && (
                <span className="text-sm font-medium text-dark dark:text-white">
                  {video.title}
                </span>
              )}
            </div>

            <div className="flex gap-2">
              {video.status === "ready" && (
                <button
                  type="button"
                  onClick={handlePreview}
                  disabled={previewLoading}
                  title="Xem trước"
                  className="rounded p-1.5 text-primary hover:bg-gray-2 disabled:opacity-50 dark:hover:bg-dark-3"
                >
                  {previewLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </button>
              )}
              <button
                type="button"
                onClick={() => setReplaceConfirmOpen(true)}
                disabled={deleting}
                title="Xóa & thay video khác"
                className="rounded p-1.5 text-red hover:bg-gray-2 disabled:opacity-50 dark:hover:bg-dark-3"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {(video.status === "uploaded" || video.status === "processing") && (
            <p className="mt-2 text-xs text-dark-4 dark:text-dark-6">
              {video.processingPhase === "extracting_audio"
                ? "Đang tách audio FLAC sau HLS, tự động cập nhật..."
                : "Đang chờ hệ thống xử lý (HLS + FLAC), tự động cập nhật..."}
            </p>
          )}

          {video.status === "ready" && video.audioFlacUrl ? (
            <p className="mt-2 text-xs text-dark-4 dark:text-dark-6">
              Audio FLAC:{" "}
              <a
                href={video.audioFlacUrl}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-primary hover:underline"
              >
                Tải xuống
              </a>
            </p>
          ) : null}

          <dl className="mt-3 text-xs text-dark-4 dark:text-dark-6">
            <div className="flex gap-1.5">
              <dt className="font-medium">Dung lượng:</dt>
              <dd>{formatBytes(video.size)}</dd>
            </div>
          </dl>
        </div>
      )}

      {showUploadForm && (
        <div className="space-y-3">
          {uploading && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm text-dark dark:text-white">
              Đang upload ngầm — có thể thoát trang Video; góc phải dưới vẫn
              hiện tiến độ.
            </div>
          )}

          {video?.status === "pending_upload" && !uploading && (
            <p className="text-xs text-orange-500">
              Upload multipart chưa hoàn tất trên server (trạng thái chờ
              upload). Bấm thùng rác để xóa phiên treo rồi upload lại. Nếu đang
              thấy &quot;Đang xử lý&quot; ở danh sách thì đang transcode — hãy
              đợi.
            </p>
          )}

          <InputGroup
            type="text"
            label="Tiêu đề video"
            placeholder="Ví dụ: Bài 1 - RAG là gì"
            value={title || bgJob?.title || ""}
            handleChange={(e) => setTitle(e.target.value)}
            disabled={uploading}
          />

          {!uploading && (
            <div>
              <InputGroup
                type="file"
                fileStyleVariant="style1"
                label="File video (MP4, MOV, WebM)"
                placeholder="Chọn file video"
                accept="video/mp4,video/quicktime,video/webm"
                disabled={uploading}
                handleChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              {file && (
                <p className="mt-1 text-xs text-dark-4 dark:text-dark-6">
                  {file.name} · {formatBytes(file.size)}
                </p>
              )}
            </div>
          )}

          {(errorMsg || bgJob?.errorMessage) && (
            <p className="text-sm text-red">
              {errorMsg || bgJob?.errorMessage}
            </p>
          )}

          {bgJob &&
            (uploading ||
              bgJob.status === "processing" ||
              bgJob.progressPct > 0) &&
            bgJob.status !== "aborted" && (
              <div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-2 dark:bg-dark-3">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-300"
                    style={{ width: `${bgJob.progressPct}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-dark-4 dark:text-dark-6">
                  {bgJob.stageLabel ? `${bgJob.stageLabel} · ` : null}
                  {bgJob.progressPct.toFixed(1)}% ·{" "}
                  {formatBytes(bgJob.uploadedBytes)} /{" "}
                  {formatBytes(bgJob.totalBytes)}
                  {bgJob.totalParts > 0
                    ? ` · ${bgJob.completedParts}/${bgJob.totalParts} phần`
                    : null}
                </p>
              </div>
            )}

          <div className="flex justify-end gap-3 pt-1">
            {uploading && (
              <button
                type="button"
                onClick={handleAbortUpload}
                className="rounded-lg border border-red px-4 py-2 text-sm font-medium text-red hover:bg-red/5"
              >
                Hủy upload
              </button>
            )}
            {!uploading && (
              <button
                type="button"
                onClick={handleStartUpload}
                disabled={!file}
                className="hover:bg-opacity-90 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                Bắt đầu upload
              </button>
            )}
          </div>
        </div>
      )}

      <AlertDialog
        open={replaceConfirmOpen}
        onOpenChange={setReplaceConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận thay thế video</AlertDialogTitle>
            <AlertDialogDescription>
              Xóa video hiện tại (bao gồm file trên storage) và upload video
              mới? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeReplaceVideo}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Thay thế
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
