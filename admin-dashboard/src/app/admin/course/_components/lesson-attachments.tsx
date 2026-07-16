"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Download,
  ExternalLink,
  FileText,
  FolderOpen,
  Loader2,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { LessonAttachment, MediaRecord } from "@/lib/api/types";
import { lessonAttachmentsClient } from "@/services/lesson-attachments.client";
import { mediaClient } from "@/services/media.client";

const ACCEPT = ".pdf,.doc,.docx,.md,.txt";
const MAX_BYTES = 50 * 1024 * 1024;

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return "-";
  const mb = bytes / 1024 / 1024;
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

type LessonAttachmentsProps = {
  courseId: string;
  lessonId: string;
  /** Seed list from course detail while the dedicated list API loads. */
  initialAttachments?: LessonAttachment[];
};

export function LessonAttachments({
  courseId,
  lessonId,
  initialAttachments = [],
}: LessonAttachmentsProps) {
  const [attachments, setAttachments] =
    useState<LessonAttachment[]>(initialAttachments);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [libraryFiles, setLibraryFiles] = useState<MediaRecord[]>([]);
  const [attachingId, setAttachingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadAttachments = useCallback(async () => {
    setLoading(true);
    const res = await lessonAttachmentsClient.list(courseId, lessonId);
    if (res.data) {
      setAttachments(res.data.data);
    } else if (res.error) {
      toast.error(res.error.message || "Không tải được danh sách tài liệu");
    }
    setLoading(false);
  }, [courseId, lessonId]);

  useEffect(() => {
    loadAttachments();
  }, [loadAttachments]);

  const handleUpload = useCallback(
    async (file: File) => {
      if (file.size > MAX_BYTES) {
        toast.error("File vượt quá dung lượng tối đa 50MB");
        return;
      }

      setUploading(true);
      const res = await lessonAttachmentsClient.uploadAndAttach(
        courseId,
        lessonId,
        file,
      );
      setUploading(false);

      if (res.data) {
        setAttachments((prev) => [...prev, res.data!.attachment]);
        toast.success("Đã thêm tài liệu");
      } else {
        toast.error(res.error?.message || "Tải lên thất bại");
      }
    },
    [courseId, lessonId],
  );

  const handleAttachFromLibrary = useCallback(
    async (media: MediaRecord) => {
      if (attachments.some((item) => item.mediaId === media.id)) {
        toast.error("File này đã được gắn vào bài học");
        return;
      }

      setAttachingId(media.id);
      const res = await lessonAttachmentsClient.attach(courseId, lessonId, {
        mediaId: media.id,
        title: media.originalName,
      });
      setAttachingId(null);

      if (res.data) {
        setAttachments((prev) => [...prev, res.data!.attachment]);
        toast.success("Đã gắn tài liệu từ thư viện");
      } else {
        toast.error(res.error?.message || "Không thể gắn tài liệu");
      }
    },
    [attachments, courseId, lessonId],
  );

  const handleRemove = useCallback(
    async (attachmentId: string) => {
      const res = await lessonAttachmentsClient.remove(
        courseId,
        lessonId,
        attachmentId,
      );
      if (res.data) {
        setAttachments((prev) => prev.filter((item) => item.id !== attachmentId));
        toast.success("Đã gỡ tài liệu");
      } else {
        toast.error(res.error?.message || "Không thể gỡ tài liệu");
      }
    },
    [courseId, lessonId],
  );

  const loadLibrary = useCallback(async () => {
    setLibraryLoading(true);
    const res = await mediaClient.list({ page: 1, limit: 50, kind: "file" });
    if (res.data) {
      setLibraryFiles(res.data.data);
    } else {
      toast.error(res.error?.message || "Không tải được thư viện file");
    }
    setLibraryLoading(false);
  }, []);

  const handleLibraryOpenChange = useCallback(
    (open: boolean) => {
      setLibraryOpen(open);
      if (open) loadLibrary();
    },
    [loadLibrary],
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <label className="text-sm font-medium text-dark dark:text-white pt-4">
          Tài liệu đính kèm
        </label>
        <DropdownMenu open={libraryOpen} onOpenChange={handleLibraryOpenChange}>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
              />
            }
          >
            <FolderOpen className="size-3.5" />
            Chọn từ thư viện
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            positionerClassName="z-[200]"
            className="max-h-72 w-80 overflow-y-auto"
          >
            <div className="px-3 py-2 text-xs font-medium text-muted-foreground">
              Chọn file từ thư viện
            </div>
            {libraryLoading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-dark-4">
                <Loader2 className="size-4 animate-spin" />
                Đang tải...
              </div>
            ) : libraryFiles.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-dark-4">
                Chưa có file trong thư viện. Hãy upload tại trang Files.
              </p>
            ) : (
              libraryFiles.map((file) => {
                const alreadyAttached = attachments.some(
                  (item) => item.mediaId === file.id,
                );
                return (
                  <DropdownMenuItem
                    key={file.id}
                    disabled={alreadyAttached || attachingId === file.id}
                    // Keep the menu open so users can attach multiple files.
                    closeOnClick={false}
                    onClick={() => handleAttachFromLibrary(file)}
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <FileText className="size-4 shrink-0 text-primary" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {file.originalName}
                        </p>
                        <p className="text-xs text-dark-4">
                          {formatBytes(file.size)}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 text-xs text-dark-4">
                      {alreadyAttached
                        ? "Đã gắn"
                        : attachingId === file.id
                          ? "..."
                          : "Gắn"}
                    </span>
                  </DropdownMenuItem>
                );
              })
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <p className="text-xs text-dark-4 dark:text-dark-6">
        PDF, DOC, DOCX, MD, TXT — tối đa 50MB. Học viên có thể xem và tải xuống.
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-5 text-center transition-colors ${dragActive
          ? "border-primary bg-primary/5"
          : "border-stroke bg-gray-50 dark:border-dark-3 dark:bg-dark-2"
          }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={onInputChange}
        />
        {uploading ? (
          <>
            <Loader2 className="size-6 animate-spin text-primary" />
            <p className="text-sm text-dark-4 dark:text-dark-6">
              Đang tải lên...
            </p>
          </>
        ) : (
          <>
            <UploadCloud className="size-6 text-dark-4 dark:text-dark-6" />
            <p className="text-sm text-dark dark:text-white">
              Kéo thả hoặc bấm để tải file lên
            </p>
          </>
        )}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-dark-4 dark:text-dark-6">
          <Loader2 className="size-4 animate-spin" />
          Đang tải danh sách...
        </div>
      ) : attachments.length === 0 ? (
        <p className="text-sm text-dark-4 dark:text-dark-6">
          Chưa có tài liệu đính kèm.
        </p>
      ) : (
        <ul className="divide-y divide-stroke rounded-lg border border-stroke dark:divide-dark-3 dark:border-dark-3">
          {attachments.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 px-3 py-2.5"
            >
              <div className="flex min-w-0 items-center gap-2">
                <FileText className="size-4 shrink-0 text-primary" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-dark dark:text-white">
                    {item.name}
                  </p>
                  <p className="text-xs text-dark-4 dark:text-dark-6">
                    {formatBytes(item.size)}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex size-8 items-center justify-center rounded-md text-dark-4 hover:bg-gray-2 hover:text-dark dark:text-dark-6 dark:hover:bg-dark-3"
                  title="Mở / tải xuống"
                >
                  <Download className="size-4" />
                </a>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex size-8 items-center justify-center rounded-md text-dark-4 hover:bg-gray-2 hover:text-dark dark:text-dark-6 dark:hover:bg-dark-3"
                  title="Mở tab mới"
                >
                  <ExternalLink className="size-4" />
                </a>
                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  className="inline-flex size-8 items-center justify-center rounded-md text-red hover:bg-red/10"
                  title="Gỡ khỏi bài học"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default LessonAttachments;
