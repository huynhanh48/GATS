"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { mediaClient } from "@/services/media.client";
import type { MediaKind, MediaRecord } from "@/lib/api/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Button } from "@/components/ui/button";
import { AdminPanel } from "@/components/Layouts/admin-surface";
import {
  Copy,
  ExternalLink,
  FileText,
  Loader2,
  Trash2,
  UploadCloud,
} from "lucide-react";

const PAGE_SIZE = 10;

const CONFIG: Record<
  MediaKind,
  {
    accept: string;
    maxBytes: number;
    maxLabel: string;
    hint: string;
  }
> = {
  thumbnail: {
    accept: "image/jpeg,image/png,image/webp,image/gif",
    maxBytes: 10 * 1024 * 1024,
    maxLabel: "10MB",
    hint: "JPEG, PNG, WEBP, GIF",
  },
  file: {
    accept:
      ".pdf,.doc,.docx,.md,.txt,.jpg,.jpeg,.png,.gif,.webp,image/jpeg,image/png,image/webp,image/gif",
    maxBytes: 50 * 1024 * 1024,
    maxLabel: "50MB",
    hint: "PDF, DOC, DOCX, MD, TXT, JPEG, PNG, WEBP, GIF",
  },
};

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return "-";
  const mb = bytes / 1024 / 1024;
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

function formatDate(value: string): string {
  const d = new Date(value);
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

type MediaManagerProps = {
  kind: MediaKind;
};

export function MediaManager({ kind }: MediaManagerProps) {
  const cfg = CONFIG[kind];
  const [items, setItems] = useState<MediaRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const loadList = useCallback(async () => {
    setLoading(true);
    const res = await mediaClient.list({ page, limit: PAGE_SIZE, kind });
    if (res.data) {
      setItems(res.data.data);
      setTotal(res.data.total);
    } else if (res.error) {
      toast.error(res.error.message || "Lỗi khi tải danh sách");
    }
    setLoading(false);
  }, [page, kind]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const handleUpload = useCallback(
    async (file: File) => {
      if (file.size > cfg.maxBytes) {
        toast.error(`File vượt quá dung lượng tối đa ${cfg.maxLabel}`);
        return;
      }
      setUploading(true);
      const res =
        kind === "thumbnail"
          ? await mediaClient.uploadThumbnail(file)
          : await mediaClient.uploadFile(file);
      setUploading(false);

      if (res.data) {
        toast.success("Tải lên thành công");
        if (page === 1) {
          loadList();
        } else {
          setPage(1);
        }
      } else {
        toast.error(res.error?.message || "Tải lên thất bại");
      }
    },
    [cfg.maxBytes, cfg.maxLabel, kind, page, loadList],
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

  const executeDelete = async () => {
    if (!mediaToDelete) return;
    const res = await mediaClient.remove(mediaToDelete);
    if (res.data) {
      toast.success("Đã xóa");
      // If we removed the last item on a page > 1, step back a page.
      if (items.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        loadList();
      }
    } else {
      toast.error(res.error?.message || "Lỗi xóa");
    }
    setMediaToDelete(null);
  };

  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Đã sao chép link");
    } catch {
      toast.error("Không thể sao chép link");
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          dragActive
            ? "border-primary bg-primary/5"
            : "border-slate-300 bg-white hover:border-blue-300 hover:bg-blue-50/30 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-blue-700 dark:hover:bg-blue-950/10"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={cfg.accept}
          className="hidden"
          onChange={onInputChange}
        />
        {uploading ? (
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        ) : (
          <UploadCloud className="h-8 w-8 text-primary" />
        )}
        <p className="text-sm font-medium text-dark dark:text-white">
          {uploading
            ? "Đang tải lên..."
            : "Kéo thả file vào đây hoặc bấm để chọn"}
        </p>
        <p className="text-xs text-dark-4 dark:text-dark-6">
          {cfg.hint} · tối đa {cfg.maxLabel}
        </p>
      </div>

      {/* List */}
      <AdminPanel title="Danh sách tài nguyên" bodyClassName="p-4 sm:p-5">
        {loading ? (
          <p className="py-6 text-center text-sm text-dark-4 dark:text-dark-6">
            Đang tải...
          </p>
        ) : items.length === 0 ? (
          <p className="py-6 text-center text-sm text-dark-4 dark:text-dark-6">
            Chưa có media nào.
          </p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Preview</TableHead>
                  <TableHead>Tên</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Dung lượng</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      {m.kind === "thumbnail" ||
                      m.mimeType.startsWith("image/") ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={m.url}
                          alt={m.originalName}
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded bg-neutral-100 dark:bg-dark-3">
                          <FileText className="h-5 w-5 text-dark-4 dark:text-dark-6" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[240px] truncate font-medium text-dark dark:text-white">
                      {m.originalName}
                    </TableCell>
                    <TableCell className="max-w-[160px] truncate text-dark-4 dark:text-dark-6" title={m.mimeType}>
                      {m.mimeType}
                    </TableCell>
                    <TableCell className="text-dark-4 dark:text-dark-6">
                      {formatBytes(m.size)}
                    </TableCell>
                    <TableCell className="text-dark-4 dark:text-dark-6">
                      {formatDate(m.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(m.url)}
                          title="Sao chép link"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <a
                          href={m.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Mở trong tab mới"
                        >
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </a>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setMediaToDelete(m.id)}
                          title="Xóa"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 text-red" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between text-sm text-dark-4 dark:text-dark-6">
              <span>
                {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, total)} / {total}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded px-2 py-1 hover:bg-neutral-100 disabled:opacity-30 dark:hover:bg-dark-3"
                >
                  ‹
                </button>
                <span className="px-2">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="rounded px-2 py-1 hover:bg-neutral-100 disabled:opacity-30 dark:hover:bg-dark-3"
                >
                  ›
                </button>
              </div>
            </div>
          </>
        )}
      </AdminPanel>

      {/* Delete Media Confirmation Dialog */}
      <AlertDialog open={!!mediaToDelete} onOpenChange={(open) => !open && setMediaToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa tài nguyên</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa media này không? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
