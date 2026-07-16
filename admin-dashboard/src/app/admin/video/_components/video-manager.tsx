"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
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
import {
  coursesClient,
  type CourseCurriculumSection,
} from "@/services/courses.client";
import { videoClient } from "@/services/video.client";
import type {
  CourseDetailLesson,
  CoursePublic,
  VideoRecord,
} from "@/lib/api/types";
import { VideoUploader } from "../../course/[id]/_components/video-uploader";
import { AllVideosTable } from "./all-videos-table";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Button } from "@/components/ui/button";
import { AdminPanel } from "@/components/Layouts/admin-surface";
import { MoreHorizontal, Trash2 } from "lucide-react";

type VideoLesson = CourseDetailLesson & { sectionTitle: string };

// ── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: VideoRecord["status"] | "no_video" }) {
  const map: Record<string, { label: string; className: string }> = {
    no_video: { label: "Chưa có video", className: "bg-neutral-100 text-neutral-500 dark:bg-dark-3 dark:text-dark-6" },
    pending_upload: { label: "Chờ upload", className: "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400" },
    processing: { label: "Đang xử lý", className: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" },
    ready: { label: "Sẵn sàng", className: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400" },
    failed: { label: "Thất bại", className: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400" },
  };
  const cfg = map[status] ?? map.no_video;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

// ── Pagination ───────────────────────────────────────────────────────────────
const PAGE_SIZE = 10;

// ── Main component ────────────────────────────────────────────────────────────
export function VideoManager() {
  const [courses, setCourses] = useState<CoursePublic[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  const [selectedCourse, setSelectedCourse] = useState<CoursePublic | null>(null);
  const [sections, setSections] = useState<CourseCurriculumSection[]>([]);
  const [loadingCurriculum, setLoadingCurriculum] = useState(false);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("list");

  // Tab: upload
  const [selectedLesson, setSelectedLesson] = useState<VideoLesson | null>(null);
  const [video, setVideo] = useState<VideoRecord | null>(null);
  const [loadingVideo, setLoadingVideo] = useState(false);

  // AlertDialog state for deletion
  const [videoToDelete, setVideoToDelete] = useState<{ videoId: string; lessonId: string } | null>(null);

  // Tab: list – per-row video records
  const [videoMap, setVideoMap] = useState<Record<string, VideoRecord | null>>({});
  const [loadingList, setLoadingList] = useState(false);

  // 1. Load courses
  useEffect(() => {
    async function fetchCourses() {
      try {
        setLoadingCourses(true);
        const res = await coursesClient.list({ take: 100 });
        if (res.data) setCourses(res.data.data);
        else if (res.error) toast.error(res.error.message);
      } catch {
        toast.error("Lỗi khi tải danh sách khóa học");
      } finally {
        setLoadingCourses(false);
      }
    }
    fetchCourses();
  }, []);

  // 2. Load curriculum when course changes
  useEffect(() => {
    let cancelled = false;

    async function fetchCurriculum() {
      if (!selectedCourse) {
        setSections([]);
        setSelectedLesson(null);
        setVideo(null);
        setVideoMap({});
        setPage(1);
        setActiveTab("list");
        return;
      }

      const courseId = selectedCourse.id;
      // Clear immediately so list effect never pairs a new courseId with old lessons.
      setSections([]);
      setSelectedLesson(null);
      setVideo(null);
      setVideoMap({});
      setPage(1);
      setActiveTab("list");

      try {
        setLoadingCurriculum(true);
        const res = await coursesClient.getCurriculum(courseId);
        if (cancelled) return;
        if (res.data) {
          setSections(res.data.data);
        } else if (res.error) {
          toast.error(res.error.message);
        }
      } catch {
        if (!cancelled) toast.error("Lỗi khi tải chương trình học");
      } finally {
        if (!cancelled) setLoadingCurriculum(false);
      }
    }

    fetchCurriculum();
    return () => {
      cancelled = true;
    };
  }, [selectedCourse]);

  // Flatten video-type lessons
  const videoLessons = useMemo<VideoLesson[]>(() => {
    const lessons: VideoLesson[] = [];
    for (const sec of sections) {
      for (const les of sec.lessons) {
        if (les.type === "video") {
          lessons.push({ ...les, sectionTitle: sec.title });
        }
      }
    }
    return lessons;
  }, [sections]);

  // 3. Load per-lesson video status for table when videoLessons change
  useEffect(() => {
    if (!selectedCourse || videoLessons.length === 0) {
      setVideoMap({});
      return;
    }

    const courseId = selectedCourse.id;
    let cancelled = false;

    async function loadAll() {
      setLoadingList(true);
      const map: Record<string, VideoRecord | null> = {};
      await Promise.all(
        videoLessons.map(async (les) => {
          const res = await videoClient.getByLesson(courseId, les.id);
          if (cancelled) return;
          // Soft empty when no video (200 data:null) or unexpected errors
          map[les.id] = res.data?.data ?? null;
        }),
      );
      if (cancelled) return;
      setVideoMap(map);
      setLoadingList(false);
    }

    loadAll();
    return () => {
      cancelled = true;
    };
  }, [selectedCourse, videoLessons]);

  // 4. Load video for selected upload lesson
  useEffect(() => {
    let cancelled = false;

    async function fetchVideo() {
      if (!selectedCourse || !selectedLesson) {
        setVideo(null);
        return;
      }
      try {
        setLoadingVideo(true);
        const res = await videoClient.getByLesson(
          selectedCourse.id,
          selectedLesson.id,
        );
        if (cancelled) return;
        setVideo(res.data?.data ?? null);
      } catch {
        if (!cancelled) setVideo(null);
      } finally {
        if (!cancelled) setLoadingVideo(false);
      }
    }
    fetchVideo();
    return () => {
      cancelled = true;
    };
  }, [selectedCourse, selectedLesson]);

  // 5. Delete video handler
  const executeDeleteVideo = async () => {
    if (!videoToDelete) return;
    const { videoId, lessonId } = videoToDelete;

    try {
      const res = await videoClient.deleteVideo(videoId);
      if (res.data) {
        toast.success("Đã xóa video");
        setVideoMap((prev) => {
          const next = { ...prev };
          delete next[lessonId];
          return next;
        });
        if (selectedLesson?.id === lessonId) {
          setVideo(null);
        }
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
    <div className="space-y-6">
      {/* Course selector */}
      <AdminPanel
        title="Chọn khóa học"
        description="Lọc chương trình học trước khi cập nhật video cho từng bài."
      >
        <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
          Khóa học
        </label>
        <div className="max-w-md">
          <Combobox
            items={courses}
            value={selectedCourse}
            onValueChange={(val) => setSelectedCourse(val as CoursePublic | null)}
            itemToStringLabel={(c: CoursePublic) => c.title}
            isItemEqualToValue={(a: CoursePublic, b: CoursePublic) => a.id === b.id}
            disabled={loadingCourses}
          >
            <ComboboxInput
              placeholder={loadingCourses ? "Đang tải..." : "Tìm khóa học..."}
            />
            <ComboboxContent>
              <ComboboxEmpty>Không tìm thấy khóa học nào.</ComboboxEmpty>
              <ComboboxList>
                {(item: CoursePublic) => (
                  <ComboboxItem key={item.id} value={item}>
                    {item.title}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
      </AdminPanel>

      {/* Tabs: only show after course is selected */}
      {selectedCourse && (
        <AdminPanel bodyClassName="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b border-stroke px-6 py-5  dark:border-dark-3">
              <TabsList variant="line">
                <TabsTrigger value="list">Danh sách video</TabsTrigger>
                <TabsTrigger value="upload">Tải lên video</TabsTrigger>
              </TabsList>
            </div>

            {/* ── Tab 1: List ───────────────────────────────────────────── */}
            <TabsContent value="list" className="p-6">
              {loadingCurriculum || loadingList ? (
                <p className="text-sm text-dark-4 dark:text-dark-6">Đang tải...</p>
              ) : videoLessons.length === 0 ? (
                <p className="text-sm text-orange-500">
                  Khóa học này chưa có bài học loại Video.
                </p>
              ) : (() => {
                const totalPages = Math.ceil(videoLessons.length / PAGE_SIZE);
                const paged = videoLessons.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
                return (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-8">#</TableHead>
                          <TableHead>Chương</TableHead>
                          <TableHead>Bài học</TableHead>
                          <TableHead>Trạng thái</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paged.map((les, idx) => {
                          const rec = videoMap[les.id];
                          return (
                            <TableRow key={les.id}>
                              <TableCell className="text-dark-4 dark:text-dark-6">
                                {(page - 1) * PAGE_SIZE + idx + 1}
                              </TableCell>
                              <TableCell className="text-dark-4 dark:text-dark-6">
                                {les.sectionTitle}
                              </TableCell>
                              <TableCell className="font-medium text-dark dark:text-white">
                                {les.title}
                              </TableCell>
                              <TableCell>
                                {videoMap[les.id] === undefined ? (
                                  <span className="text-xs text-dark-4">—</span>
                                ) : (
                                  <StatusBadge status={rec ? rec.status : "no_video"} />
                                )}
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
                                        if (rec?.mp4Url) window.open(rec.mp4Url, '_blank');
                                      }}
                                      disabled={!rec || rec.status !== "ready" || !rec.mp4Url}
                                    >
                                      Xem video
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedLesson(les);
                                        setActiveTab("upload");
                                      }}
                                    >
                                      Cập nhật video
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => setVideoToDelete({ videoId: rec!.videoId, lessonId: les.id })}
                                      disabled={!rec || rec.status !== "ready"}
                                      className="text-red-600 focus:text-red-600"
                                    >
                                      Xóa
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table >

                    {/* Pagination */}
                    < div className="mt-4 flex items-center justify-between text-sm text-dark-4 dark:text-dark-6" >
                      <span>
                        {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, videoLessons.length)} / {videoLessons.length} bài
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setPage(1)}
                          disabled={page === 1}
                          className="rounded px-2 py-1 hover:bg-neutral-100 disabled:opacity-30 dark:hover:bg-dark-3"
                        >
                          «
                        </button>
                        <button
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={page === 1}
                          className="rounded px-2 py-1 hover:bg-neutral-100 disabled:opacity-30 dark:hover:bg-dark-3"
                        >
                          ‹
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                          .reduce<(number | "...")[]>((acc, p, i, arr) => {
                            if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push("...");
                            acc.push(p);
                            return acc;
                          }, [])
                          .map((p, i) =>
                            p === "..." ? (
                              <span key={`ellipsis-${i}`} className="px-1">…</span>
                            ) : (
                              <button
                                key={p}
                                onClick={() => setPage(p as number)}
                                className={`min-w-[2rem] rounded px-2 py-1 ${page === p
                                  ? "bg-primary text-white"
                                  : "hover:bg-neutral-100 dark:hover:bg-dark-3"
                                  }`}
                              >
                                {p}
                              </button>
                            )
                          )}
                        <button
                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                          disabled={page === totalPages}
                          className="rounded px-2 py-1 hover:bg-neutral-100 disabled:opacity-30 dark:hover:bg-dark-3"
                        >
                          ›
                        </button>
                        <button
                          onClick={() => setPage(totalPages)}
                          disabled={page === totalPages}
                          className="rounded px-2 py-1 hover:bg-neutral-100 disabled:opacity-30 dark:hover:bg-dark-3"
                        >
                          »
                        </button>
                      </div>
                    </div>
                  </>
                );
              })()}
            </TabsContent>

            {/* ── Tab 2: Upload ─────────────────────────────────────────── */}
            <TabsContent value="upload" className="p-6">
              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                    Bài học (Video)
                  </label>
                  <Combobox
                    items={videoLessons}
                    value={selectedLesson}
                    onValueChange={(val) => setSelectedLesson(val as VideoLesson | null)}
                    itemToStringLabel={(l: VideoLesson) => `${l.sectionTitle} - ${l.title}`}
                    isItemEqualToValue={(a: VideoLesson, b: VideoLesson) => a.id === b.id}
                    disabled={loadingCurriculum}
                  >
                    <ComboboxInput
                      placeholder={
                        loadingCurriculum
                          ? "Đang tải..."
                          : videoLessons.length === 0
                            ? "Không có bài học Video"
                            : "Tìm bài học Video..."
                      }
                    />
                    <ComboboxContent>
                      <ComboboxEmpty>Không có bài học loại Video.</ComboboxEmpty>
                      <ComboboxList>
                        {(item: VideoLesson) => (
                          <ComboboxItem key={item.id} value={item}>
                            {item.sectionTitle} - {item.title}
                          </ComboboxItem>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                  {!loadingCurriculum && videoLessons.length === 0 && (
                    <p className="mt-1 text-xs text-orange-500">
                      Khóa học này chưa có bài học loại Video.
                    </p>
                  )}
                </div>

                {selectedLesson && (
                  <div className="pt-2">
                    {loadingVideo ? (
                      <p className="text-sm text-dark-4 dark:text-dark-6">
                        Đang tải dữ liệu video...
                      </p>
                    ) : (
                      <VideoUploader
                        key={selectedLesson.id}
                        courseId={selectedCourse.id}
                        lessonId={selectedLesson.id}
                        existingVideo={video}
                        onVideoUpdated={(v) => {
                          setVideo(v);
                          // Sync table map
                          setVideoMap((prev) => ({
                            ...prev,
                            [selectedLesson.id]: v,
                          }));
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </AdminPanel>
      )}

      {!selectedCourse && (
        <AllVideosTable />
      )}

      {/* Delete Video Confirmation Dialog */}
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
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div >
  );
}
