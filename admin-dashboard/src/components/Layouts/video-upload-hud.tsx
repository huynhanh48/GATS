"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Upload, X } from "lucide-react";
import {
  abortUpload,
  bootstrapResumableUploads,
  hasActiveUploads,
  subscribe,
  type UploadJobSnapshot,
} from "@/services/video-upload-manager";

function formatBytes(bytes: number): string {
  if (bytes <= 0) return "0 B";
  const mb = bytes / 1024 / 1024;
  if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`;
  return `${mb.toFixed(1)} MB`;
}

export function VideoUploadHud() {
  const [jobs, setJobs] = useState<UploadJobSnapshot[]>([]);

  useEffect(() => {
    void bootstrapResumableUploads();
    return subscribe(setJobs);
  }, []);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!hasActiveUploads()) return;
      e.preventDefault();
      e.returnValue =
        "Đang upload video ngầm. Đóng tab sẽ tạm dừng — mở lại sẽ tiếp tục phần còn lại.";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  const active = jobs.filter(
    (j) =>
      j.status === "uploading" ||
      j.status === "queued" ||
      j.status === "completing" ||
      j.status === "processing" ||
      j.status === "error",
  );

  if (active.length === 0) return null;

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-50 flex w-[min(100vw-2rem,22rem)] flex-col gap-2">
      {active.map((job) => (
        <div
          key={job.id}
          className="pointer-events-auto rounded-xl border border-stroke bg-white p-3 shadow-lg dark:border-dark-3 dark:bg-gray-dark"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-start gap-2">
              <div className="mt-0.5 rounded-lg bg-primary/10 p-1.5 text-primary">
                {job.status === "error" ? (
                  <Upload className="h-4 w-4" />
                ) : (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-dark dark:text-white">
                  {job.title}
                </p>
                <p className="text-xs text-dark-4 dark:text-dark-6">
                  {job.status === "error"
                    ? job.errorMessage || "Upload lỗi"
                    : job.status === "completing"
                      ? "Đang hoàn tất..."
                      : job.status === "processing"
                        ? job.stageLabel || "Backend đang xử lý video..."
                        : job.status === "queued"
                          ? "Đang chờ..."
                          : job.stageLabel ||
                            `Upload ngầm · ${job.progressPct.toFixed(0)}%`}
                </p>
              </div>
            </div>
            {(job.status === "uploading" ||
              job.status === "queued" ||
              job.status === "completing") && (
              <button
                type="button"
                title="Hủy upload"
                onClick={() => void abortUpload(job.id)}
                className="rounded p-1 text-dark-4 hover:bg-gray-2 hover:text-red dark:hover:bg-dark-3"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {job.status !== "error" && (
            <div className="mt-2">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-2 dark:bg-dark-3">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${job.progressPct}%` }}
                />
              </div>
              <p className="mt-1 text-[11px] text-dark-4 dark:text-dark-6">
                {formatBytes(job.uploadedBytes)} / {formatBytes(job.totalBytes)}
                {job.totalParts > 0
                  ? ` · ${job.completedParts}/${job.totalParts} phần`
                  : null}
                {job.stageTotalBytes
                  ? ` · ${formatBytes(job.stageLoadedBytes ?? 0)} / ${formatBytes(job.stageTotalBytes)}`
                  : null}
              </p>
            </div>
          )}

          <Link
            href="/admin/video"
            className="mt-2 inline-block text-xs font-medium text-primary hover:underline"
          >
            Mở trang Video
          </Link>
        </div>
      ))}
    </div>
  );
}
