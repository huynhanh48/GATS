"use client";

import { cn } from "@/lib/utils";
import type {
  Assignment,
  CourseDetail,
  CourseDetailLesson,
  CourseDetailSection,
  LessonType,
  Quiz,
  VideoRecord,
} from "@/lib/api/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { assignmentClient } from "@/services/assignment.client";
import { quizClient } from "@/services/quiz.client";
import { videoClient } from "@/services/video.client";
import { QuizBuilder } from "../[id]/_components/quiz-builder";
import { AssignmentBuilder } from "../[id]/_components/assignment-builder";
import { VideoUploader } from "../[id]/_components/video-uploader";
import {
  createSection,
  deleteLesson,
  deleteSection,
  updateSection,
} from "../actions";

const LESSON_TYPE_LABELS: Record<LessonType, string> = {
  video: "Video",
  text: "Văn bản",
  quiz: "Quiz",
  assignment: "Bài tập",
};

const modalInputClass =
  "w-full rounded-lg border border-stroke px-4 py-2.5 text-dark outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white";
const modalLabelClass =
  "mb-2 block text-sm font-medium text-dark dark:text-white";

type CurriculumManagerProps = {
  course: CourseDetail;
};

type FormMode =
  | { type: "section-create" }
  | { type: "section-edit"; section: CourseDetailSection }
  | null;

type ExpandedLessonData = {
  lessonId: string;
  loading: boolean;
  quiz: Quiz | null;
  assignment: Assignment | null;
  video: VideoRecord | null;
  noData: boolean; // true if 404 (no quiz/assignment/video yet)
};

export function CurriculumManager({ course }: CurriculumManagerProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string[]>(
    course.sections.map((s) => s.id),
  );
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // ── Quiz / Assignment expand state ───────────────────────────────────
  const [expandedLessonData, setExpandedLessonData] =
    useState<Record<string, ExpandedLessonData>>({});

  function toggleSection(id: string) {
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function handleDeleteSection(sectionId: string) {
    if (!confirm("Xóa chương này và tất cả bài học bên trong?")) return;
    setLoading(true);
    const result = await deleteSection(course.id, sectionId);
    setLoading(false);
    if (result.ok) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.message);
    }
  }

  async function handleDeleteLesson(lessonId: string) {
    if (!confirm("Xóa bài học này?")) return;
    setLoading(true);
    const result = await deleteLesson(course.id, lessonId);
    setLoading(false);
    if (result.ok) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.message);
    }
  }

  async function handleSectionSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const title = form.get("title")?.toString().trim();
    const orderRaw = form.get("order")?.toString().trim();

    if (!title) {
      toast.error("Tiêu đề chương là bắt buộc");
      return;
    }

    const input = {
      title,
      ...(orderRaw ? { order: Number(orderRaw) } : {}),
    };

    setLoading(true);
    const result =
      formMode?.type === "section-edit"
        ? await updateSection(course.id, formMode.section.id, input)
        : await createSection(course.id, input);
    setLoading(false);

    if (result.ok) {
      toast.success(result.message, { duration: 2000 });
      setFormMode(null);
      router.refresh();
    } else {
      toast.error(result.message);
    }
  }

  // ── Quiz / Assignment expand logic ─────────────────────────────────────

  const isExpandableLesson = (type: LessonType) =>
    type === "quiz" || type === "assignment" || type === "video";

  /** Toggle expand for a quiz/assignment lesson – fetches data if expanding */
  const toggleLessonExpand = useCallback(
    async (lesson: CourseDetailLesson) => {
      const current = expandedLessonData[lesson.id];
      // If already expanded → collapse
      if (current) {
        setExpandedLessonData((prev) => {
          const next = { ...prev };
          delete next[lesson.id];
          return next;
        });
        return;
      }

      // Placeholder: loading state
      setExpandedLessonData((prev) => ({
        ...prev,
        [lesson.id]: {
          lessonId: lesson.id,
          loading: true,
          quiz: null,
          assignment: null,
          video: null,
          noData: false,
        },
      }));

      if (lesson.type === "quiz") {
        const res = await quizClient.getQuizByLessonAdmin(
          course.id,
          lesson.id,
        );
        setExpandedLessonData((prev) => ({
          ...prev,
          [lesson.id]: {
            lessonId: lesson.id,
            loading: false,
            quiz: res.data?.data ?? null,
            assignment: null,
            video: null,
            noData: !!res.error,
          },
        }));
      } else if (lesson.type === "assignment") {
        const res = await assignmentClient.getAssignment(
          course.id,
          lesson.id,
        );
        setExpandedLessonData((prev) => ({
          ...prev,
          [lesson.id]: {
            lessonId: lesson.id,
            loading: false,
            quiz: null,
            assignment: res.data?.data ?? null,
            video: null,
            noData: !!res.error,
          },
        }));
      } else if (lesson.type === "video") {
        const res = await videoClient.getByLesson(course.id, lesson.id);
        setExpandedLessonData((prev) => ({
          ...prev,
          [lesson.id]: {
            lessonId: lesson.id,
            loading: false,
            quiz: null,
            assignment: null,
            video: res.data?.data ?? null,
            noData: !!res.error,
          },
        }));
      }
    },
    [course.id, expandedLessonData],
  );

  /** After quiz/assignment is created by the builder, update cached data */
  const handleQuizCreated = useCallback(
    (lessonId: string, quiz: Quiz) => {
      setExpandedLessonData((prev) => ({
        ...prev,
        [lessonId]: {
          ...prev[lessonId],
          quiz,
          noData: false,
        },
      }));
      toast.success("Quiz đã sẵn sàng!");
    },
    [],
  );

  const handleAssignmentSaved = useCallback(
    (lessonId: string, assignment: Assignment) => {
      setExpandedLessonData((prev) => ({
        ...prev,
        [lessonId]: {
          ...prev[lessonId],
          assignment,
          noData: false,
        },
      }));
      toast.success("Bài tập đã sẵn sàng!");
    },
    [],
  );

  /** Video record changed (created / status polled / replaced by uploader). */
  const handleVideoUpdated = useCallback(
    (lessonId: string, video: VideoRecord | null) => {
      setExpandedLessonData((prev) => {
        if (!prev[lessonId]) return prev;
        return {
          ...prev,
          [lessonId]: {
            ...prev[lessonId],
            video,
            noData: video === null,
          },
        };
      });
      if (video?.status === "ready") {
        router.refresh();
      }
    },
    [router],
  );

  return (
    <div className="rounded-[10px] border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-dark dark:text-white">
          Chương trình học
        </h3>
        <button
          type="button"
          onClick={() => setFormMode({ type: "section-create" })}
          className="hover:bg-opacity-90 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition"
        >
          Thêm chương
        </button>
      </div>

      {course.sections.length === 0 ? (
        <p className="text-sm text-dark-4 dark:text-dark-6">
          Chưa có chương nào. Hãy thêm chương đầu tiên.
        </p>
      ) : (
        <div className="space-y-3">
          {course.sections.map((section) => (
            <div
              key={section.id}
              className="rounded-lg border border-stroke dark:border-dark-3"
            >
              {/* ── Section header ─────────────────────────────────── */}
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="flex flex-1 items-center gap-2 text-left"
                >
                  <span
                    className={cn(
                      "text-dark-4 transition",
                      expanded.includes(section.id) && "rotate-90",
                    )}
                  >
                    ▶
                  </span>
                  <span className="font-medium text-dark dark:text-white">
                    {section.title}
                  </span>
                  <span className="text-xs text-dark-4 dark:text-dark-6">
                    ({section.lessonCount} bài ·{" "}
                    {Math.floor(section.totalDurationSeconds / 60)} phút)
                  </span>
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger className="flex size-8 items-center justify-center rounded-md hover:bg-gray-200 dark:hover:bg-dark-3 transition-colors">
                    <MoreHorizontal className="size-4 text-dark-4 dark:text-dark-6" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(
                          `/course/${course.id}/sections/${section.id}/lessons/new`,
                        )
                      }
                    >
                      Tạo bài học
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        setFormMode({ type: "section-edit", section })
                      }
                    >
                      Sửa
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => handleDeleteSection(section.id)}
                    >
                      Xóa
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* ── Lessons list ───────────────────────────────────── */}
              {expanded.includes(section.id) && (
                <div className="border-t border-stroke dark:border-dark-3">
                  {section.lessons.length === 0 ? (
                    <div className="flex items-center justify-between gap-3 px-4 py-3">
                      <p className="text-xs text-dark-4 dark:text-dark-6">
                        Chưa có bài học
                      </p>
                      <Link
                        href={`/course/${course.id}/sections/${section.id}/lessons/new`}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        + Thêm bài học
                      </Link>
                    </div>
                  ) : (
                    <ul className="divide-y divide-stroke dark:divide-dark-3">
                      {section.lessons.map((lesson) => (
                        <li key={lesson.id}>
                          {/* Lesson row */}
                          <div className="flex items-center justify-between gap-3 px-4 py-2.5">
                            <div className="min-w-0 flex-1">
                              {isExpandableLesson(lesson.type) ? (
                                <button
                                  type="button"
                                  onClick={() => toggleLessonExpand(lesson)}
                                  className="flex items-center gap-2 text-left"
                                >
                                  <span
                                    className={cn(
                                      "shrink-0 text-xs text-dark-4 transition dark:text-dark-6",
                                      expandedLessonData[lesson.id] &&
                                      "rotate-90",
                                    )}
                                  >
                                    ▶
                                  </span>
                                  <div>
                                    <p className="text-sm font-medium text-dark dark:text-white">
                                      {lesson.title}
                                    </p>
                                    <p className="text-xs text-dark-4 dark:text-dark-6">
                                      {LESSON_TYPE_LABELS[lesson.type]} · Thứ tự{" "}
                                      {lesson.order}
                                      {lesson.isPreview ? " · Preview" : ""}
                                    </p>
                                  </div>
                                </button>
                              ) : (
                                <div>
                                  <p className="text-sm font-medium text-dark dark:text-white">
                                    {lesson.title}
                                  </p>
                                  <p className="text-xs text-dark-4 dark:text-dark-6">
                                    {LESSON_TYPE_LABELS[lesson.type]} · Thứ tự{" "}
                                    {lesson.order}
                                    {lesson.duration
                                      ? ` · ${lesson.duration}s`
                                      : ""}
                                    {lesson.isPreview ? " · Preview" : ""}
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="flex shrink-0 gap-2">
                              <Link
                                href={`/course/${course.id}/lessons/${lesson.id}/edit`}
                                className="text-xs text-dark-4 hover:text-dark dark:text-dark-6"
                              >
                                Sửa
                              </Link>
                              <button
                                type="button"
                                onClick={() => handleDeleteLesson(lesson.id)}
                                className="text-xs text-red hover:underline"
                              >
                                Xóa
                              </button>
                            </div>
                          </div>

                          {/* Expanded quiz/assignment builder */}
                          {expandedLessonData[lesson.id] && (
                            <div className="border-t border-dashed border-stroke bg-gray-50 px-4 py-3 dark:border-dark-3 dark:bg-dark-2">
                              {expandedLessonData[lesson.id].loading ? (
                                <p className="text-sm text-dark-4 dark:text-dark-6">
                                  Đang tải...
                                </p>
                              ) : lesson.type === "quiz" ? (
                                <div className="space-y-3">
                                  {!expandedLessonData[lesson.id].noData &&
                                  expandedLessonData[lesson.id].quiz ? (
                                    <div className="flex justify-end">
                                      <Link
                                        href={`/course/quiz/attempts/${expandedLessonData[lesson.id].quiz!.id}`}
                                        className="text-xs font-medium text-primary hover:underline"
                                      >
                                        Xem lượt làm bài →
                                      </Link>
                                    </div>
                                  ) : null}
                                  {expandedLessonData[lesson.id].noData ? (
                                    <QuizBuilder
                                      courseId={course.id}
                                      lessonId={lesson.id}
                                      onCreated={(quiz) =>
                                        handleQuizCreated(lesson.id, quiz)
                                      }
                                    />
                                  ) : (
                                    <QuizBuilder
                                      courseId={course.id}
                                      lessonId={lesson.id}
                                      existingQuiz={
                                        expandedLessonData[lesson.id].quiz
                                      }
                                      onCreated={(quiz) =>
                                        handleQuizCreated(lesson.id, quiz)
                                      }
                                    />
                                  )}
                                </div>
                              ) : lesson.type === "assignment" ? (
                                <div className="space-y-3">
                                  {!expandedLessonData[lesson.id].noData &&
                                  expandedLessonData[lesson.id].assignment ? (
                                    <div className="flex justify-end">
                                      <Link
                                        href={`/course/assignment/${expandedLessonData[lesson.id].assignment!.id}/submissions`}
                                        className="text-xs font-medium text-primary hover:underline"
                                      >
                                        Chấm bài nộp →
                                      </Link>
                                    </div>
                                  ) : null}
                                  {expandedLessonData[lesson.id].noData ? (
                                    <AssignmentBuilder
                                      courseId={course.id}
                                      lessonId={lesson.id}
                                      onSaved={(assignment) =>
                                        handleAssignmentSaved(
                                          lesson.id,
                                          assignment,
                                        )
                                      }
                                    />
                                  ) : (
                                    <AssignmentBuilder
                                      courseId={course.id}
                                      lessonId={lesson.id}
                                      existingAssignment={
                                        expandedLessonData[lesson.id]
                                          .assignment
                                      }
                                      onSaved={(assignment) =>
                                        handleAssignmentSaved(
                                          lesson.id,
                                          assignment,
                                        )
                                      }
                                    />
                                  )}
                                </div>
                              ) : lesson.type === "video" ? (
                                <VideoUploader
                                  courseId={course.id}
                                  lessonId={lesson.id}
                                  existingVideo={
                                    expandedLessonData[lesson.id].video
                                  }
                                  onVideoUpdated={(video) =>
                                    handleVideoUpdated(lesson.id, video)
                                  }
                                />
                              ) : null}
                            </div>
                          )}
                        </li>
                      ))}
                      <li className="px-4 py-2.5">
                        <Link
                          href={`/course/${course.id}/sections/${section.id}/lessons/new`}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          + Thêm bài học
                        </Link>
                      </li>
                    </ul>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Modal form (section create / edit only) ──────────── */}
      {mounted &&
        formMode &&
        createPortal(
          <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl dark:bg-gray-dark">
              <h4 className="border-b border-stroke px-6 py-4 text-lg font-semibold text-dark dark:border-dark-3 dark:text-white">
                {formMode.type === "section-create"
                  ? "Thêm chương"
                  : "Sửa chương"}
              </h4>

              <div className="p-6">
                <form onSubmit={handleSectionSubmit} className="space-y-4">
                  <div>
                    <label className={modalLabelClass}>Tiêu đề *</label>
                    <input
                      name="title"
                      required
                      defaultValue={
                        formMode.type === "section-edit"
                          ? formMode.section.title
                          : ""
                      }
                      className={modalInputClass}
                    />
                  </div>

                  <div>
                    <label className={modalLabelClass}>Thứ tự</label>
                    <input
                      name="order"
                      type="number"
                      min={0}
                      defaultValue={
                        formMode.type === "section-edit"
                          ? formMode.section.order
                          : ""
                      }
                      className={modalInputClass}
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setFormMode(null)}
                      className="rounded-lg border border-stroke px-4 py-2 text-sm font-medium text-dark dark:border-dark-3 dark:text-white"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="hover:bg-opacity-90 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-70"
                    >
                      {loading ? "Đang lưu..." : "Lưu"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
