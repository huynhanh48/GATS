"use client";

import { useEffect, useRef, useState } from "react";
import {
  Eye,
  ImageIcon,
  Info,
  Loader2,
  Maximize2,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { toast } from "sonner";
import { mediaClient } from "@/services/media.client";

const MAX_BYTES = 30 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/svg+xml";

export type ThumbnailPresetType =
  "course" | "post" | "prompt" | "api_model" | "skill";

type ThumbnailFieldUploadProps = {
  inputName?: string;
  inputId?: string;
  fileInputId?: string;
  initialUrl?: string | null;
  disabled?: boolean;
  presetType?: ThumbnailPresetType;
  aspectRatio?: "16/9" | "2/1" | "16/10";
  badgeLabel?: string;
  onUrlChange?: (url: string) => void;
  onUploadingChange?: (uploading: boolean, progress: number) => void;
  hideUploadTrigger?: boolean;
  hideEmptyState?: boolean;
};

export function ThumbnailFieldUpload({
  inputName = "thumbnail",
  inputId,
  fileInputId,
  initialUrl,
  disabled,
  presetType = "course",
  aspectRatio,
  badgeLabel,
  onUrlChange,
  onUploadingChange,
  hideUploadTrigger = false,
  hideEmptyState = false,
}: ThumbnailFieldUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(initialUrl ?? "");
  const [viewMode, setViewMode] = useState<"cover" | "contain">("cover");

  // Determine aspect ratio class & advice based on presetType
  const resolvedRatio =
    aspectRatio ??
    (presetType === "post"
      ? "2/1"
      : presetType === "prompt"
        ? "16/10"
        : "16/9");

  const ratioClass =
    resolvedRatio === "2/1"
      ? "aspect-[2/1]"
      : resolvedRatio === "16/10"
        ? "aspect-[16/10]"
        : "aspect-[16/9]";

  const defaultBadge =
    badgeLabel ??
    (presetType === "post"
      ? "Bài viết"
      : presetType === "prompt"
        ? "AI Prompt"
        : presetType === "api_model"
          ? "API Model"
          : presetType === "skill"
            ? "Skill Package"
            : "Khóa học");

  const ratioAdvice =
    presetType === "post"
      ? "Tỷ lệ chuẩn 2:1 (ví dụ 1200×600px). Ảnh tràn viền tự nhiên trên mọi kích thước màn hình."
      : presetType === "prompt"
        ? "Tỷ lệ chuẩn 16:10 (ví dụ 1280×800px). Khung thẻ Prompt chuẩn marketplace."
        : presetType === "api_model"
          ? "Tỷ lệ chuẩn 16:9 (ví dụ 1200×675px). Ảnh bìa hoặc logo đại diện cho Model."
          : presetType === "skill"
            ? "Tỷ lệ chuẩn 16:9 (ví dụ 1200×675px). Ảnh đại diện hiển thị trên thẻ Skill."
            : "Tỷ lệ chuẩn 16:9 (ví dụ 1200×675px hoặc 800×450px). Căn giữa nội dung quan trọng.";

  // Sync with HTML input whenever user types, pastes or triggers changes
  useEffect(() => {
    const selector = inputId
      ? `#${CSS.escape(inputId)}`
      : `input[name="${CSS.escape(inputName)}"]`;
    const input = document.querySelector<HTMLInputElement>(selector);
    if (!input) return;

    if (input.value && input.value !== previewUrl) {
      setPreviewUrl(input.value);
    }

    const handleSync = () => {
      setPreviewUrl(input.value);
      onUrlChange?.(input.value);
    };

    input.addEventListener("input", handleSync);
    input.addEventListener("change", handleSync);
    return () => {
      input.removeEventListener("input", handleSync);
      input.removeEventListener("change", handleSync);
    };
  }, [inputId, inputName, previewUrl, onUrlChange]);

  useEffect(() => {
    if (initialUrl !== undefined && initialUrl !== null) {
      setPreviewUrl(initialUrl);
    }
  }, [initialUrl]);

  function updateFormField(url: string) {
    const selector = inputId
      ? `#${CSS.escape(inputId)}`
      : `input[name="${CSS.escape(inputName)}"]`;
    const input = document.querySelector<HTMLInputElement>(selector);
    if (input) {
      input.value = url;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }
    setPreviewUrl(url);
    onUrlChange?.(url);
  }

  function handleClear() {
    updateFormField("");
    toast.info("Đã xóa ảnh thumbnail");
  }

  async function upload(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh (JPEG, PNG, WEBP, GIF, SVG)");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Ảnh không được vượt quá 30 MB");
      return;
    }

    setUploading(true);
    setProgress(0);
    onUploadingChange?.(true, 0);
    const result = await mediaClient.uploadThumbnail(file, {
      onProgress: (p) => {
        setProgress(p);
        onUploadingChange?.(true, p);
      },
    });
    setUploading(false);

    if (!result.data?.media.url) {
      onUploadingChange?.(false, 0);
      toast.error(result.error?.message ?? "Tải ảnh lên thất bại");
      return;
    }

    onUploadingChange?.(false, 100);
    updateFormField(result.data.media.url);
    toast.success("Đã tải ảnh lên thành công và điền URL");
  }

  const fileInput = (
    <input
      id={fileInputId}
      ref={fileRef}
      type="file"
      accept={ACCEPT}
      className="sr-only"
      disabled={disabled || uploading}
      onChange={(event) => {
        const file = event.target.files?.[0];
        if (file) void upload(file);
        event.target.value = "";
      }}
    />
  );

  if (hideEmptyState && !previewUrl && !uploading) {
    return fileInput;
  }

  return (
    <div className="mt-3 space-y-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
      {fileInput}

      {/* Action buttons & Status */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          {!hideUploadTrigger ? (
            <button
              type="button"
              disabled={disabled || uploading}
              onClick={() => fileRef.current?.click()}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#0070EB] px-4 text-xs font-semibold text-white shadow-xs transition hover:bg-[#005fc8] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UploadCloud className="h-4 w-4" />
              )}
              {uploading ? `Đang tải ${progress}%` : "Tải ảnh từ máy"}
            </button>
          ) : null}

          {previewUrl ? (
            <button
              type="button"
              disabled={disabled || uploading}
              onClick={handleClear}
              className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/80 px-3 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400"
              title="Xóa thumbnail hiện tại"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Xóa ảnh
            </button>
          ) : null}
        </div>

        {/* View Mode Switcher (Cover vs Contain) */}
        {previewUrl ? (
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs dark:border-slate-700 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setViewMode("cover")}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                viewMode === "cover"
                  ? "bg-[#0070EB] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              Tràn viền (Thực tế web)
            </button>
            <button
              type="button"
              onClick={() => setViewMode("contain")}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                viewMode === "contain"
                  ? "bg-[#0070EB] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              Ảnh gốc & vùng crop
            </button>
          </div>
        ) : null}
      </div>

      {/* Realistic Website Display Preview Frame */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
          <span className="flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5 text-[#0070EB]" />
            Khung hiển thị thực tế trên website ({resolvedRatio})
          </span>
          <span className="text-[11px] font-normal text-slate-400">
            {viewMode === "cover"
              ? "Chế độ: Tràn viền (object-cover)"
              : "Chế độ: Toàn bộ ảnh"}
          </span>
        </div>

        <div
          className={`relative w-full max-w-[540px] overflow-hidden rounded-2xl border-2 border-slate-300/80 bg-slate-900 shadow-md dark:border-slate-700 ${ratioClass}`}
        >
          {uploading ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-6 text-center text-slate-300">
              <Loader2 className="h-8 w-8 animate-spin text-[#0070EB]" />
              <p className="text-xs font-semibold text-white">
                Đang tải ảnh lên... {progress}%
              </p>
              <p className="text-[11px] text-slate-400">
                Vui lòng đợi trong giây lát
              </p>
            </div>
          ) : previewUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Xem trước thực tế"
                className={`h-full w-full ${
                  viewMode === "cover"
                    ? "object-cover object-center"
                    : "bg-slate-950/80 object-contain object-center p-2"
                }`}
              />

              {/* Realistic badge mockup matching the website */}
              <div className="pointer-events-none absolute top-3 left-3 z-10">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold text-white shadow-md ${
                    presetType === "post"
                      ? "bg-[#ff782d]"
                      : presetType === "prompt"
                        ? "border border-white/20 bg-slate-950/80 backdrop-blur-md"
                        : presetType === "api_model"
                          ? "bg-blue-600"
                          : presetType === "skill"
                            ? "bg-[#ff782d]"
                            : "bg-[#111827]"
                  }`}
                >
                  {presetType === "prompt" && (
                    <span className="size-1.5 rounded-full bg-amber-400" />
                  )}
                  {defaultBadge}
                </span>
              </div>

              {/* View mode tag */}
              <div className="pointer-events-none absolute right-2.5 bottom-2.5 z-10">
                <span className="inline-flex items-center gap-1 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-sm">
                  {viewMode === "cover" ? "✓ Tràn viền thực tế" : "Khung gốc"}
                </span>
              </div>

              {/* Safe zone guidelines in contain mode */}
              {viewMode === "contain" && (
                <div className="pointer-events-none absolute inset-0 border-2 border-dashed border-amber-400/60" />
              )}
            </>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-6 text-center text-slate-400">
              <ImageIcon className="h-10 w-10 text-slate-500/60" />
              <p className="text-xs font-semibold text-slate-300">
                Chưa có ảnh thumbnail
              </p>
              <p className="text-[11px] text-slate-500">
                Tải ảnh từ máy hoặc dán URL vào ô phía trên để xem khung hiển
                thị thực tế
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Helpful guidance note */}
      <div className="flex items-start gap-2 rounded-xl bg-blue-50/70 p-3 text-xs text-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
        <div>
          <p className="font-semibold">Lưu ý hiển thị trên website:</p>
          <p className="mt-0.5 text-[11px] text-blue-700/90 dark:text-blue-300/90">
            Ảnh trên website luôn hiển thị{" "}
            <strong>tràn viền (object-cover)</strong> để không bị khoảng trống
            hai bên. {ratioAdvice}
          </p>
        </div>
      </div>
    </div>
  );
}
