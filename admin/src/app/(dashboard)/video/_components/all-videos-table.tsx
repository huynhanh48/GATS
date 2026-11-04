"use client";

import React, { useEffect, useState } from "react";
import { videoClient, type ListVideosResponse } from "@/services/video.client";
import type { VideoWithDetails } from "@/lib/api/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, MoreHorizontal, Eye, Edit, Trash } from "lucide-react";
import { useRouter } from "next/navigation";

function formatBytes(bytes: number | null): string {
  if (bytes === null) return "-";
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function AllVideosTable() {
  const [videos, setVideos] = useState<VideoWithDetails[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<{ videoId: string; lessonId: string } | null>(null);
  const router = useRouter();

  const loadVideos = async (pageToLoad: number) => {
    setIsLoading(true);
    try {
      const res = await videoClient.listAllVideos(pageToLoad, 10);
      if (res.data) {
        setVideos(res.data.data);
        setPage(res.data.pagination.page);
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch (error: any) {
      toast.error(error?.message || "Không thể tải danh sách video");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVideos(1);
  }, []);

  const handlePrevPage = () => {
    if (page > 1) {
      loadVideos(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      loadVideos(page + 1);
    }
  };

  const executeDeleteVideo = async () => {
    if (!videoToDelete) return;
    try {
      const res = await videoClient.deleteVideo(videoToDelete.videoId);
      if (res.data) {
        toast.success("Đã xóa video");
        // Reload list
        loadVideos(page);
      } else {
        toast.error(res.error?.message || "Lỗi xóa video");
      }
    } catch {
      toast.error("Lỗi xóa video");
    } finally {
      setVideoToDelete(null);
    }
  };

  return (
    <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-none bg-[#F7F9FC] dark:bg-dark-2">
              <TableHead className="min-w-[50px] py-4 text-dark dark:text-white">
                #
              </TableHead>
              <TableHead className="min-w-[200px] py-4 text-dark dark:text-white">
                Khóa học
              </TableHead>
              <TableHead className="min-w-[200px] py-4 text-dark dark:text-white">
                Bài học
              </TableHead>
              <TableHead className="min-w-[120px] py-4 text-dark dark:text-white">
                Trạng thái
              </TableHead>
              <TableHead className="min-w-[120px] py-4 text-dark dark:text-white">
                Dung lượng
              </TableHead>
              <TableHead className="min-w-[150px] py-4 text-dark dark:text-white">
                Ngày tải lên
              </TableHead>
              <TableHead className="py-4 text-right text-dark dark:text-white">
                Hành động
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow key="loading">
                <TableCell
                  colSpan={7}
                  className="py-10 text-center text-dark-4 dark:text-dark-6"
                >
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            ) : videos.length === 0 ? (
              <TableRow key="empty">
                <TableCell
                  colSpan={7}
                  className="py-10 text-center text-dark-4 dark:text-dark-6"
                >
                  Chưa có video nào.
                </TableCell>
              </TableRow>
            ) : (
              videos.map((vid, idx) => {
                const actualId = vid.videoId || (vid as any).id;
                return (
                  <TableRow key={actualId || idx}>
                    <TableCell className="text-dark-4 dark:text-dark-6">
                      {(page - 1) * 10 + idx + 1}
                    </TableCell>
                    <TableCell 
                      className="text-dark dark:text-white font-medium max-w-[150px] sm:max-w-[200px] lg:max-w-[250px] xl:max-w-[300px] truncate"
                      title={vid.courseTitle || ""}
                    >
                      {vid.courseTitle || "N/A"}
                    </TableCell>
                    <TableCell 
                      className="text-dark-4 dark:text-dark-6 max-w-[150px] sm:max-w-[200px] lg:max-w-[250px] xl:max-w-[300px] truncate"
                      title={vid.lessonTitle || ""}
                    >
                      {vid.lessonTitle || "N/A"}
                    </TableCell>
                    <TableCell>
                      {vid.status === "ready" ? (
                        <span className="inline-flex items-center rounded-md bg-green-500/10 px-2 py-1 text-xs font-medium text-green-500">
                          Sẵn sàng
                        </span>
                      ) : vid.status === "pending_upload" ? (
                        <span className="inline-flex items-center rounded-md border border-orange-500/50 bg-orange-500/10 px-2 py-1 text-xs font-medium text-orange-500">
                          Đang tải lên
                        </span>
                      ) : vid.status === "uploaded" ? (
                        <span className="inline-flex items-center rounded-md bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-500">
                          Chờ xử lý
                        </span>
                      ) : vid.status === "processing" ? (
                        <span className="inline-flex items-center rounded-md bg-indigo-500/10 px-2 py-1 text-xs font-medium text-indigo-500">
                          Đang xử lý
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-md bg-red-500/10 px-2 py-1 text-xs font-medium text-red-500">
                          Lỗi
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-dark-4 dark:text-dark-6">
                      {vid.size ? formatBytes(vid.size) : "-"}
                    </TableCell>
                    <TableCell className="text-dark-4 dark:text-dark-6">
                      {new Date(vid.createdAt).toLocaleDateString("en-GB")}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="sm">
                              <span className="sr-only">Mở menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              if (vid.mp4Url) window.open(vid.mp4Url, "_blank");
                            }}
                            disabled={vid.status !== "ready" || !vid.mp4Url}
                          >
                            <Eye className="mr-2 h-4 w-4" /> Xem video
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => {
                              if (vid.audioFlacUrl) {
                                window.open(vid.audioFlacUrl, "_blank", "noopener,noreferrer");
                                return;
                              }
                              toast.error("Video này chưa có file audio FLAC");
                            }}
                            disabled={vid.status !== "ready" || !vid.audioFlacUrl}
                          >
                            <Eye className="mr-2 h-4 w-4" /> Xem audio
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem
                            onClick={() => router.push(`/course/${vid.courseId}/lessons/${vid.lessonId}/edit`)}
                          >
                            <Edit className="mr-2 h-4 w-4" /> Cập nhật
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem
                            onClick={() => setVideoToDelete({ videoId: actualId, lessonId: vid.lessonId })}
                            className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50"
                          >
                            <Trash className="mr-2 h-4 w-4 text-red-500" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={page === 1}
            className="flex items-center gap-1 bg-white hover:bg-gray-100 dark:bg-dark-2 dark:hover:bg-dark-3 border-stroke dark:border-dark-3 text-dark dark:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
            Trước
          </Button>
          <span className="text-sm text-dark-4 dark:text-dark-6 min-w-[4rem] text-center">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={page === totalPages}
            className="flex items-center gap-1 bg-white hover:bg-gray-100 dark:bg-dark-2 dark:hover:bg-dark-3 border-stroke dark:border-dark-3 text-dark dark:text-white"
          >
            Sau
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!videoToDelete} onOpenChange={(open) => !open && setVideoToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa video</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa video này không? Thao tác này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeDeleteVideo}
              className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
