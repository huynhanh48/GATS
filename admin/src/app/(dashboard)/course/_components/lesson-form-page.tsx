"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, FileText, Save } from "lucide-react";
import DatePickerDemo from "@/components/shadcn-studio/date-picker/date-picker-08";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox"
import type {
  CourseDetailLesson,
  CreateLessonInput,
  LessonType,
  UpdateLessonInput,
} from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { createLesson, updateLesson } from "../actions";
import { LessonAttachments } from "./lesson-attachments";
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
  const [linkedPostId, setLinkedPostId] = useState<string>(
    lesson?.linkedPostId ?? lesson?.linkedPost?.id ?? "",
  );
  const [postOptions, setPostOptions] = useState<PostListItem[]>([]);
  const [postQuery, setPostQuery] = useState("");
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    setLoading(false);

    if (!result.ok) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);

    if (mode === "create" && "lessonId" in result && result.lessonId) {
      router.push(`/course/${courseId}/lessons/${result.lessonId}/edit`);
      router.refresh();
      return;
    }

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
            <p className="rounded-xl border border-dashed border-stroke px-4 py-6 text-center text-sm text-dark-4 dark:border-dark-3 dark:text-dark-6">
              Vui lòng tạo bài học trước khi thêm tài liệu đính kèm (PDF, DOC,
              TXT…).
            </p>
          )}
        </section>

        {/* Advanced Settings Section */}
        <section className="min-w-0 max-w-full rounded-[10px] border border-stroke bg-white p-5 shadow-1 sm:p-7 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
          <h2 className="mb-4 text-lg font-semibold text-dark dark:text-white">
            Cài đặt khác
          </h2>
          <div className="flex items-start gap-3 rounded-lg border border-stroke px-4 py-3 dark:border-dark-3">
            <Checkbox
              id="is_preview"
              checked={isPreview}
              onCheckedChange={(checked) => setIsPreview(checked === true)}
              className="mt-0.5"
            />
            <input
              type="hidden"
              name="is_preview"
              value={isPreview ? "on" : "off"}
            />
            <Label
              htmlFor="is_preview"
              className="cursor-pointer space-y-1"
            >
              <span className="block font-medium text-dark dark:text-white">Cho xem trước</span>
              <span className="block text-xs font-normal text-dark-4 dark:text-dark-6">
                Học viên chưa ghi danh vẫn xem được.
              </span>
            </Label>
          </div>

          <div className="mt-4 space-y-2">
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
