"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, FileText, Save, Video, PlayCircle, BookOpen } from "lucide-react";
import DatePickerDemo from "@/components/shadcn-studio/date-picker/date-picker-08";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type {
  CourseDetailLesson,
  CreateLessonInput,
  LessonType,
  UpdateLessonInput,
  MediaRecord,
} from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { createLesson, updateLesson } from "../actions";
import { LessonAttachments, PendingLessonAttachments } from "./lesson-attachments";
import { lessonAttachmentsClient } from "@/services/lesson-attachments.client";
import { fetchPosts } from "@/app/(dashboard)/post/actions";
import type { PostListItem } from "@/lib/api/types";

const LESSON_TYPE_OPTIONS: { value: LessonType; label: string; hint: string }[] =
  [
    {
      value: "video",
      label: "Video",
      hint: "Bài giảng dạng video, tải file sau khi lưu",
    },
    {
      value: "text",
      label: "Văn bản",
      hint: "Nội dung đọc trong trình soạn thảo",
    },
    {
      value: "quiz",
      label: "Quiz",
      hint: "Câu hỏi trắc nghiệm / tự luận sau khi lưu",
    },
    {
      value: "assignment",
      label: "Bài tập",
      hint: "Nộp bài & chấm điểm sau khi lưu",
    },
  ];

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function parseTime(timeStr: string) {
  if (!timeStr) return 0;
  const parts = timeStr.split(":").map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2) {
    return parts[0] * 3600 + parts[1] * 60;
  }
  return 0;
}

const SimpleEditor = dynamic(
  () =>
    import("@/components/tiptap-templates/simple/simple-editor").then(
      (m) => m.SimpleEditor,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-dashed border-stroke text-sm text-dark-4 dark:border-dark-3 dark:text-dark-6">
        Đang tải trình soạn thảo...
      </div>
    ),
  },
);

export type LessonFormPageProps = {
  mode: "create" | "edit";
  courseId: string;
  courseTitle: string;
  sectionId: string;
  sectionTitle: string;
  lesson?: CourseDetailLesson;
};

export function LessonFormPage({
  mode,
  courseId,
  courseTitle,
  sectionId,
  sectionTitle,
  lesson,
}: LessonFormPageProps) {
  const router = useRouter();
  const backHref = `/course/${courseId}`;
  const [type, setType] = useState<LessonType>(lesson?.type ?? "video");
  const [content, setContent] = useState(lesson?.content ?? "");
  const [isPreview, setIsPreview] = useState(lesson?.isPreview ?? false);
  const [isArticlePreview, setIsArticlePreview] = useState(
    lesson?.isArticlePreview ?? false,
  );
  const [videoPreviewDuration, setVideoPreviewDuration] = useState(
    lesson?.videoPreviewDurationSeconds ?? 180,
  );
  const [linkedPostId, setLinkedPostId] = useState<string>(
    lesson?.linkedPostId ?? lesson?.linkedPost?.id ?? "",
  );
  const [postOptions, setPostOptions] = useState<PostListItem[]>([]);
  const [postQuery, setPostQuery] = useState("");
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<MediaRecord[]>([]);

  useEffect(() => {
    void (async () => {
      setPostsLoading(true);
      setPostsError(null);
      try {
        const res = await fetchPosts(1, 100, { status: "published" });
        setPostOptions(res.data ?? []);
      } catch {
        setPostsError("Không tải được danh sách bài viết");
        setPostOptions([]);
      } finally {
        setPostsLoading(false);
      }
    })();
  }, []);

  const filteredPosts = postOptions.filter((post) => {
    const q = postQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      post.title.toLowerCase().includes(q) ||
      (post.slug?.toLowerCase().includes(q) ?? false)
    );
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const title = form.get("title")?.toString().trim();
    const description = form.get("description")?.toString().trim();
    const orderRaw = form.get("order")?.toString().trim();
    const durationRaw = form.get("duration")?.toString().trim();
    const isPreviewVal = isPreview;
    const isArticlePreviewVal = isArticlePreview;
    const trimmedContent = content.trim();

    if (!title) {
      toast.error("Tiêu đề bài học là bắt buộc");
      return;
    }

    let durationSec: number | undefined;
    if (durationRaw) {
      durationSec = durationRaw.includes(":")
        ? parseTime(durationRaw)
        : Number(durationRaw);
    }

    const input: CreateLessonInput | UpdateLessonInput = {
      title,
      type,
      is_preview: isPreviewVal,
      is_article_preview: isArticlePreviewVal,
      video_preview_duration_seconds: videoPreviewDuration,
      linked_post_id: linkedPostId ? linkedPostId : null,
      ...(description ? { description } : {}),
      ...(orderRaw ? { order: Number(orderRaw) } : {}),
      ...(durationSec !== undefined && !Number.isNaN(durationSec)
        ? { duration: durationSec }
        : {}),
      ...(trimmedContent ? { content: trimmedContent } : {}),
    };

    setLoading(true);
    const result =
      mode === "edit" && lesson
        ? await updateLesson(courseId, lesson.id, input)
        : await createLesson(courseId, sectionId, input as CreateLessonInput);
    if (!result.ok) {
      setLoading(false);
      toast.error(result.message);
      return;
    }

    const newLessonId =
      "lessonId" in result && typeof result.lessonId === "string"
        ? result.lessonId
        : null;
    if (mode === "create" && newLessonId) {
      const attachResults = await Promise.all(
        pendingAttachments.map((media) =>
          lessonAttachmentsClient.attach(courseId, newLessonId, {
            mediaId: media.id,
            title: media.originalName,
          }),
        ),
      );
      const failedCount = attachResults.filter((item) => !item.data).length;
      setLoading(false);
      if (failedCount > 0) {
        toast.warning(`Đã tạo bài học nhưng có ${failedCount} tài liệu chưa gắn được`);
      } else {
        toast.success(result.message);
      }
      router.push(`/course/${courseId}/lessons/${newLessonId}/edit`);
      router.refresh();
      return;
    }

    setLoading(false);
    toast.success(result.message);
    router.push(backHref);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="min-w-0 max-w-full space-y-6 overflow-x-hidden ">
      {/* Sticky page header — stay inside main padding, no negative margins */}
      <div className="sticky top-0 z-20 rounded-[10px] border border-stroke bg-white/95 px-4 py-4 shadow-1 backdrop-blur sm:px-6 dark:border-dark-3 dark:bg-gray-dark/95 dark:shadow-card">
        <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 space-y-1">
            <Link
              href={backHref}
              className="inline-flex items-center gap-1.5 text-sm text-dark-4 transition hover:text-primary dark:text-dark-6"
            >
              <ArrowLeft className="size-4 shrink-0" />
              Quay lại chương trình học
            </Link>
            <h1 className="truncate text-xl font-bold text-dark dark:text-white">
              {mode === "create" ? "Thêm bài học" : "Sửa bài học"}
            </h1>
            <p className="truncate text-sm text-dark-4 dark:text-dark-6">
              {courseTitle}
              <span className="mx-1.5 text-dark-5">·</span>
              {sectionTitle}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={backHref}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-stroke px-4 text-sm font-medium text-dark transition hover:bg-gray-2 dark:border-dark-3 dark:text-white dark:hover:bg-dark-3"
            >
              Hủy
            </Link>
            <Button type="submit" disabled={loading} className="gap-1.5">
              <Save className="size-4" />
              {loading
                ? "Đang lưu..."
                : mode === "create"
                  ? "Tạo bài học"
                  : "Lưu thay đổi"}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex min-w-0 max-w-full flex-col gap-6">
        {/* Settings Section (Top) */}
        <section className="min-w-0 rounded-[10px] border border-stroke bg-white p-5 shadow-1 sm:p-7 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-dark dark:text-white">
              Thông tin bài học
            </h2>
          </div>

          <div className="grid min-w-0 gap-4 md:grid-cols-12">
            <div className="min-w-0 space-y-2 md:col-span-8">
              <Label htmlFor="title">Tiêu đề *</Label>
              <Input
                id="title"
                name="title"
                required
                placeholder="Ví dụ: Giới thiệu khóa học"
                defaultValue={lesson?.title ?? ""}
              />
            </div>

            <div className="min-w-0 space-y-2 md:col-span-4">
              <Label htmlFor="duration">Thời lượng (giờ:phút:giây)</Label>
              <DatePickerDemo
                name="duration"
                label=""
                defaultValue={
                  lesson?.duration ? formatTime(lesson.duration) : "00:00:00"
                }
                className="bg-input/50 border-transparent"
              />
            </div>

            <div className="min-w-0 space-y-2 md:col-span-12">
              <Label htmlFor="description">Mô tả ngắn</Label>
              <Textarea
                id="description"
                name="description"
                rows={2}
                placeholder="Tóm tắt nội dung học viên sẽ học trong bài này..."
                defaultValue={lesson?.description ?? ""}
              />
            </div>
          </div>

          <div className="mt-6 grid min-w-0 gap-4 border-t border-stroke pt-6 dark:border-dark-3 md:grid-cols-12">
            <div className="min-w-0 space-y-3 md:col-span-8">
              <Label>Loại bài học</Label>
              <div className="flex flex-wrap gap-3">
                {LESSON_TYPE_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={cn(
                      "flex min-w-[100px] cursor-pointer items-center justify-center rounded-lg border px-4 py-2 transition",
                      type === opt.value
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-stroke hover:border-primary/40 dark:border-dark-3",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="type_radio"
                        className="m-0 size-4 accent-primary"
                        checked={type === opt.value}
                        onChange={() => setType(opt.value)}
                      />
                      <span className="mt-[2px] text-sm leading-none font-medium text-dark dark:text-white">
                        {opt.label}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
              <input type="hidden" name="type" value={type} />
            </div>

            <div className="min-w-0 space-y-4 md:col-span-4">
              <div className="space-y-2">
                <Label htmlFor="order">Thứ tự trong chương</Label>
                <Input
                  id="order"
                  name="order"
                  type="number"
                  min={0}
                  placeholder="Tự động nếu để trống"
                  defaultValue={lesson?.order ?? ""}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Tiptap Editor Section */}
        <section className="min-w-0 max-w-full overflow-hidden rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
          <div className="flex items-center gap-2 border-b border-stroke px-5 py-4 sm:px-7 sm:py-5 dark:border-dark-3">
            <FileText className="size-5 shrink-0 text-primary" />
            <h2 className="text-lg font-semibold text-dark dark:text-white">
              Nội dung chi tiết
            </h2>
          </div>

          <div className="min-w-0">
            <div className="min-w-0 max-w-full overflow-x-auto">
              <SimpleEditor
                value={content}
                onChange={setContent}
                className="simple-editor-embedded !border-0 !rounded-none min-h-[800px]"
              />
            </div>
          </div>
        </section>

        {/* Attachments Section */}
        <section className="min-w-0 max-w-full rounded-[10px] border border-stroke bg-white p-5 shadow-1 sm:p-7 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
          <h2 className="mb-4 text-lg font-semibold text-dark dark:text-white">
            Tài liệu đính kèm
          </h2>
          {mode === "edit" && lesson ? (
            <LessonAttachments
              courseId={courseId}
              lessonId={lesson.id}
              initialAttachments={lesson.attachments}
            />
          ) : (
            <PendingLessonAttachments
              files={pendingAttachments}
              onChange={setPendingAttachments}
              disabled={loading}
            />
          )}
        </section>

        {/* Advanced Settings Section */}
        <section className="min-w-0 max-w-full rounded-[10px] border border-stroke bg-white p-5 shadow-1 sm:p-7 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
          <h2 className="mb-4 text-lg font-semibold text-dark dark:text-white">
            Cài đặt khác
          </h2>

          <div className="space-y-3">
            <span className="block text-sm font-semibold text-dark dark:text-white">
              Cấu hình cho xem trước (Preview)
            </span>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Video Preview Option */}
              <div
                onClick={() => setIsPreview(!isPreview)}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors",
                  isPreview
                    ? "border-primary/60 bg-primary/5 dark:border-primary/40 dark:bg-primary/10"
                    : "border-stroke hover:border-stroke/80 dark:border-dark-3",
                )}
              >
                <Checkbox
                  id="is_preview"
                  checked={isPreview}
                  onCheckedChange={(checked) => setIsPreview(checked === true)}
                  className="mt-0.5"
                  onClick={(e) => e.stopPropagation()}
                />
                <input
                  type="hidden"
                  name="is_preview"
                  value={isPreview ? "on" : "off"}
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-md bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 shrink-0">
                      <PlayCircle className="size-3.5" />
                    </span>
                    <Label
                      htmlFor="is_preview"
                      className="cursor-pointer font-medium text-dark dark:text-white"
                    >
                      Xem trước Video
                    </Label>
                  </div>
                  <span className="block text-xs font-normal text-dark-4 dark:text-dark-6">
                    Học viên chưa ghi danh vẫn xem được video bài giảng này.
                  </span>
                </div>
              </div>

              {/* Article Preview Option */}
              <div
                onClick={() => setIsArticlePreview(!isArticlePreview)}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors",
                  isArticlePreview
                    ? "border-emerald-500/60 bg-emerald-50/50 dark:border-emerald-500/40 dark:bg-emerald-950/20"
                    : "border-stroke hover:border-stroke/80 dark:border-dark-3",
                )}
              >
                <Checkbox
                  id="is_article_preview"
                  checked={isArticlePreview}
                  onCheckedChange={(checked) =>
                    setIsArticlePreview(checked === true)
                  }
                  className="mt-0.5"
                  onClick={(e) => e.stopPropagation()}
                />
                <input
                  type="hidden"
                  name="is_article_preview"
                  value={isArticlePreview ? "on" : "off"}
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-md bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 shrink-0">
                      <BookOpen className="size-3.5" />
                    </span>
                    <Label
                      htmlFor="is_article_preview"
                      className="cursor-pointer font-medium text-dark dark:text-white"
                    >
                      Xem trước Bài viết
                    </Label>
                  </div>
                  <span className="block text-xs font-normal text-dark-4 dark:text-dark-6">
                    Học viên chưa ghi danh vẫn đọc được bài viết gắn kèm hoặc nội dung bài học.
                  </span>
                </div>
              </div>
            </div>

            {isArticlePreview && !linkedPostId && !content.trim() && (
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                💡 Lưu ý: Bạn đang bật xem trước bài viết, hãy chọn một bài viết gắn kèm bên dưới hoặc soạn thảo nội dung để học viên có thể đọc thử.
              </p>
            )}
            {isPreview ? (
              <div className="max-w-xs space-y-2">
                <Label htmlFor="video_preview_duration">Thời lượng video xem thử (giây)</Label>
                <Input id="video_preview_duration" type="number" min={30} max={600} step={30} value={videoPreviewDuration} onChange={(event) => setVideoPreviewDuration(Math.min(600, Math.max(30, Number(event.target.value) || 180)))} />
                <p className="text-xs text-dark-4">Mặc định 180 giây (3 phút), cho phép từ 30 giây đến 10 phút.</p>
              </div>
            ) : null}
          </div>

          <div className="mt-5 space-y-2">
            <Label htmlFor="linked_post_id">Bài viết gắn với bài học</Label>
            <Input
              value={postQuery}
              onChange={(e) => setPostQuery(e.target.value)}
              placeholder="Tìm theo tiêu đề hoặc slug…"
              disabled={postsLoading}
            />
            <select
              id="linked_post_id"
              value={linkedPostId}
              onChange={(e) => setLinkedPostId(e.target.value)}
              disabled={postsLoading}
              className="flex h-10 w-full rounded-md border border-stroke bg-transparent px-3 py-2 text-sm dark:border-dark-3"
            >
              <option value="">— Không gắn —</option>
              {lesson?.linkedPost &&
              !filteredPosts.some((p) => p.id === lesson.linkedPost?.id) ? (
                <option value={lesson.linkedPost.id}>
                  {lesson.linkedPost.title} (đang chọn)
                </option>
              ) : null}
              {filteredPosts.map((post) => (
                <option key={post.id} value={post.id}>
                  {post.title}
                </option>
              ))}
            </select>
            {postsLoading ? (
              <p className="text-xs text-dark-4 dark:text-dark-6">
                Đang tải bài viết đã publish…
              </p>
            ) : null}
            {postsError ? (
              <p className="text-xs text-red">{postsError}</p>
            ) : null}
            {!postsLoading && !postsError && filteredPosts.length === 0 ? (
              <p className="text-xs text-dark-4 dark:text-dark-6">
                {postQuery.trim()
                  ? "Không có bài viết khớp tìm kiếm."
                  : "Chưa có bài viết đã publish."}
              </p>
            ) : null}
            <p className="text-xs text-dark-4 dark:text-dark-6">
              Khi học viên xem bài học này trên web, sẽ hiện card bài viết liên
              quan (chỉ post đã publish). Chọn “Không gắn” để bỏ liên kết.
            </p>
          </div>
        </section>
      </div>
    </form>
  );
}
