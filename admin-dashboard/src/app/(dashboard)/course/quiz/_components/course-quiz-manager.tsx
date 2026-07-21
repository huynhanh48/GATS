"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Eye,
  FileQuestion,
  ListChecks,
  Loader2,
  PlusCircle,
  RefreshCw,
  Search,
  Settings2,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { AdminPanel, StatusPill } from "@/components/Layouts/admin-surface";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type {
  CourseDetailLesson,
  CoursePublic,
  Quiz,
  QuizQuestion,
} from "@/lib/api/types";
import {
  coursesClient,
  type CourseCurriculumSection,
} from "@/services/courses.client";
import { quizClient } from "@/services/quiz.client";
import { QuizBuilder } from "../../[id]/_components/quiz-builder";

type QuizLesson = CourseDetailLesson & { sectionTitle: string };
type QuizView = "overview" | "builder" | "preview";

const QUESTION_TYPE_LABELS: Record<string, string> = {
  single_choice: "Một đáp án",
  multiple_choice: "Nhiều đáp án",
  fill_blank: "Điền khuyết",
  true_false: "Đúng / Sai",
};

function getQuestionText(question: QuizQuestion) {
  return question.title ?? question.question ?? "Câu hỏi chưa có tiêu đề";
}

function getOptionCount(question: QuizQuestion) {
  return question.options?.length ?? question.answers?.length ?? 0;
}

function getCorrectAnswerCount(question: QuizQuestion) {
  if (question.type === "fill_blank") {
    return question.acceptedAnswers?.length ?? question.answers?.length ?? 0;
  }

  if (question.options?.length) {
    return question.options.filter((option) => option.is_correct).length;
  }

  return question.answers?.filter((answer) => answer.isCorrect).length ?? 0;
}

function getQuestionIssue(question: QuizQuestion) {
  const title = getQuestionText(question).trim();
  const correctCount = getCorrectAnswerCount(question);
  const optionCount = getOptionCount(question);

  if (!title || title === "Câu hỏi chưa có tiêu đề") {
    return "Thiếu nội dung câu hỏi";
  }

  if (question.points <= 0) {
    return "Điểm phải lớn hơn 0";
  }

  if (question.type === "single_choice" && (optionCount < 2 || correctCount !== 1)) {
    return "Cần ít nhất 2 lựa chọn và đúng 1 đáp án";
  }

  if (question.type === "multiple_choice" && (optionCount < 2 || correctCount < 2)) {
    return "Cần ít nhất 2 lựa chọn và từ 2 đáp án đúng";
  }

  if (question.type === "fill_blank" && correctCount < 1) {
    return "Cần ít nhất 1 đáp án được chấp nhận";
  }

  return null;
}

function getQuizIssues(quiz: Quiz | null) {
  if (!quiz) return ["Chưa khởi tạo quiz"];
  if (!quiz.questions.length) return ["Quiz chưa có câu hỏi"];

  return quiz.questions
    .map((question, index) => {
      const issue = getQuestionIssue(question);
      return issue ? `Câu ${index + 1}: ${issue}` : null;
    })
    .filter(Boolean) as string[];
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50/60 p-8 text-center dark:border-slate-800 dark:bg-slate-900/30">
      <div className="flex size-12 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm dark:bg-slate-950 dark:text-blue-300">
        <Icon className="size-5" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-950 dark:text-white">
        {title}
      </h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}

function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex min-h-[220px] items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
      <Loader2 className="size-4 animate-spin text-blue-600" />
      {label}
    </div>
  );
}

export function CourseQuizManager() {
  const [courses, setCourses] = useState<CoursePublic[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<CoursePublic | null>(null);

  const [sections, setSections] = useState<CourseCurriculumSection[]>([]);
  const [loadingCurriculum, setLoadingCurriculum] = useState(false);
  const [lessonQuery, setLessonQuery] = useState("");
  const [selectedLesson, setSelectedLesson] = useState<QuizLesson | null>(null);

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [quizNoData, setQuizNoData] = useState(false);
  const [view, setView] = useState<QuizView>("overview");
  const [openAddQuestion, setOpenAddQuestion] = useState(false);

  useEffect(() => {
    async function fetchCourses() {
      try {
        setLoadingCourses(true);
        const res = await coursesClient.list({ take: 100 });
        if (res.data) {
          setCourses(res.data.data);
        } else if (res.error) {
          toast.error(res.error.message);
        }
      } catch {
        toast.error("Lỗi khi tải danh sách khóa học");
      } finally {
        setLoadingCourses(false);
      }
    }

    fetchCourses();
  }, []);

  useEffect(() => {
    async function fetchCurriculum() {
      if (!selectedCourse) {
        setSections([]);
        setSelectedLesson(null);
        setQuiz(null);
        setQuizNoData(false);
        return;
      }

      try {
        setLoadingCurriculum(true);
        setSections([]);
        setSelectedLesson(null);
        setQuiz(null);
        setQuizNoData(false);
        setView("overview");

        const res = await coursesClient.getCurriculum(selectedCourse.id);
        if (res.data) {
          setSections(res.data.data);
        } else if (res.error) {
          toast.error(res.error.message);
        }
      } catch {
        toast.error("Lỗi khi tải chương trình học");
      } finally {
        setLoadingCurriculum(false);
      }
    }

    fetchCurriculum();
  }, [selectedCourse]);

  const quizLessons = useMemo(() => {
    const lessons: QuizLesson[] = [];
    for (const section of sections) {
      for (const lesson of section.lessons) {
        if (lesson.type === "quiz") {
          lessons.push({ ...lesson, sectionTitle: section.title });
        }
      }
    }
    return lessons;
  }, [sections]);

  const visibleSections = useMemo(() => {
    const query = lessonQuery.trim().toLowerCase();

    return sections
      .map((section) => {
        const lessons = section.lessons
          .filter((lesson) => lesson.type === "quiz")
          .map((lesson) => ({ ...lesson, sectionTitle: section.title }) as QuizLesson)
          .filter((lesson) => {
            if (!query) return true;
            return (
              lesson.title.toLowerCase().includes(query) ||
              lesson.sectionTitle.toLowerCase().includes(query)
            );
          });

        return { ...section, lessons };
      })
      .filter((section) => section.lessons.length > 0);
  }, [lessonQuery, sections]);

  const fetchQuiz = useCallback(async () => {
    if (!selectedCourse || !selectedLesson) {
      setQuiz(null);
      setQuizNoData(false);
      return;
    }

    try {
      setLoadingQuiz(true);
      const res = await quizClient.getQuizByLessonAdmin(
        selectedCourse.id,
        selectedLesson.id,
      );
      const nextQuiz = res.data?.data ?? null;
      setQuiz(nextQuiz);
      setQuizNoData(Boolean(res.error || !nextQuiz));
    } catch {
      toast.error("Lỗi khi tải dữ liệu quiz");
      setQuiz(null);
      setQuizNoData(true);
    } finally {
      setLoadingQuiz(false);
    }
  }, [selectedCourse, selectedLesson]);

  useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  const quizIssues = useMemo(() => getQuizIssues(quiz), [quiz]);
  const totalQuestions = quiz?.questions.length ?? 0;
  const totalPoints =
    quiz?.questions.reduce((sum, question) => sum + (question.points || 0), 0) ?? 0;
  const readyQuestions = quiz?.questions.filter((question) => !getQuestionIssue(question)).length ?? 0;

  function handleQuizCreated(newQuiz: Quiz) {
    setQuiz(newQuiz);
    setQuizNoData(false);
    setOpenAddQuestion(true);
    setView("builder");
    toast.success("Quiz đã sẵn sàng");
  }

  function goAddQuestion() {
    setOpenAddQuestion(true);
    setView("builder");
  }

  function selectLesson(lesson: QuizLesson) {
    setSelectedLesson(lesson);
    setQuiz(null);
    setQuizNoData(false);
    setOpenAddQuestion(false);
    setView("overview");
  }

  return (
    <div className="space-y-4">
      <AdminPanel
        title="Chọn phạm vi quản lý"
        description="Chọn khóa học và bài học loại Quiz trước khi tạo hoặc chỉnh bộ câu hỏi."
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Khóa học
            </label>
            <Combobox
              items={courses}
              value={selectedCourse}
              onValueChange={(value) => setSelectedCourse(value as CoursePublic | null)}
              itemToStringLabel={(course: CoursePublic) => course.title}
              isItemEqualToValue={(a: CoursePublic, b: CoursePublic) => a.id === b.id}
              disabled={loadingCourses}
            >
              <ComboboxInput
                placeholder={loadingCourses ? "Đang tải..." : "Tìm khóa học..."}
              />
              <ComboboxContent>
                <ComboboxEmpty>Không tìm thấy khóa học nào.</ComboboxEmpty>
                <ComboboxList>
                  {(course: CoursePublic) => (
                    <ComboboxItem key={course.id} value={course}>
                      {course.title}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Bài học quiz
            </label>
            <Combobox
              items={quizLessons}
              value={selectedLesson}
              onValueChange={(value) => selectLesson(value as QuizLesson)}
              itemToStringLabel={(lesson: QuizLesson) =>
                `${lesson.sectionTitle} - ${lesson.title}`
              }
              isItemEqualToValue={(a: QuizLesson, b: QuizLesson) => a.id === b.id}
              disabled={!selectedCourse || loadingCurriculum || quizLessons.length === 0}
            >
              <ComboboxInput
                placeholder={
                  !selectedCourse
                    ? "Chọn khóa học trước"
                    : loadingCurriculum
                      ? "Đang tải bài học..."
                      : quizLessons.length === 0
                        ? "Chưa có bài học quiz"
                        : "Tìm bài học quiz..."
                }
              />
              <ComboboxContent>
                <ComboboxEmpty>Không có bài học loại Quiz.</ComboboxEmpty>
                <ComboboxList>
                  {(lesson: QuizLesson) => (
                    <ComboboxItem key={lesson.id} value={lesson}>
                      {lesson.sectionTitle} - {lesson.title}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>

          <Button
            type="button"
            variant="outline"
            className="h-10"
            disabled={!selectedCourse || !selectedLesson || loadingQuiz}
            onClick={fetchQuiz}
          >
            <RefreshCw className={cn("size-4", loadingQuiz && "animate-spin")} />
            Làm mới
          </Button>
        </div>
      </AdminPanel>

      <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
        <AdminPanel
          title="Danh sách bài quiz"
          description={
            selectedCourse
              ? `${quizLessons.length} bài học quiz trong khóa đã chọn.`
              : "Chọn khóa học để xem các bài quiz."
          }
          bodyClassName="space-y-4"
        >
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              value={lessonQuery}
              onChange={(event) => setLessonQuery(event.target.value)}
              placeholder="Tìm bài quiz..."
              className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              disabled={!selectedCourse || loadingCurriculum}
            />
          </div>

          {!selectedCourse ? (
            <EmptyState
              icon={ClipboardList}
              title="Chưa chọn khóa học"
              description="Chọn một khóa học ở phía trên để lọc ra các bài học loại Quiz."
            />
          ) : loadingCurriculum ? (
            <LoadingState label="Đang tải chương trình học..." />
          ) : quizLessons.length === 0 ? (
            <EmptyState
              icon={FileQuestion}
              title="Khóa học chưa có bài quiz"
              description="Hãy tạo bài học loại Quiz trong curriculum trước, sau đó quay lại đây để cấu hình câu hỏi."
            />
          ) : visibleSections.length === 0 ? (
            <EmptyState
              icon={Search}
              title="Không có kết quả"
              description="Thử tìm bằng tên bài học hoặc tên chương khác."
            />
          ) : (
            <div className="max-h-[640px] space-y-4 overflow-y-auto pr-1">
              {visibleSections.map((section) => (
                <div key={section.id} className="space-y-2">
                  <p className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                    {section.title}
                  </p>
                  {section.lessons.map((lesson) => {
                    const selected = selectedLesson?.id === lesson.id;
                    return (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => selectLesson(lesson)}
                        className={cn(
                          "w-full rounded-md border px-3 py-3 text-left transition",
                          selected
                            ? "border-blue-200 bg-blue-50 text-blue-800 shadow-sm dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-200"
                            : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-blue-900/60 dark:hover:bg-slate-900",
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="line-clamp-2 text-sm font-semibold">
                              {lesson.title}
                            </p>
                            <p className="mt-1 text-xs opacity-70">
                              Thứ tự #{lesson.order + 1}
                              {lesson.isPreview ? " · Preview" : ""}
                            </p>
                          </div>
                          {selected ? (
                            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </AdminPanel>

        <AdminPanel
          className="min-w-0"
          title={selectedLesson ? selectedLesson.title : "Không gian làm quiz"}
          description={
            selectedLesson
              ? `${selectedLesson.sectionTitle} · Bài học loại Quiz`
              : "Chọn bài quiz ở cột trái để bắt đầu."
          }
          actions={
            selectedLesson ? (
              <StatusPill tone={quiz && quizIssues.length === 0 ? "green" : quiz ? "orange" : "slate"}>
                {loadingQuiz
                  ? "Đang tải"
                  : quiz
                    ? quizIssues.length === 0
                      ? "Sẵn sàng"
                      : "Cần kiểm tra"
                    : "Chưa có quiz"}
              </StatusPill>
            ) : null
          }
          bodyClassName="p-0"
        >
          {!selectedCourse ? (
            <div className="p-5">
              <EmptyState
                icon={ClipboardList}
                title="Chọn khóa học để bắt đầu"
                description="Màn quản lý quiz sẽ hiển thị danh sách bài quiz, trạng thái cấu hình và builder sau khi bạn chọn khóa học."
              />
            </div>
          ) : !selectedLesson ? (
            <div className="p-5">
              <EmptyState
                icon={FileQuestion}
                title="Chọn một bài quiz"
                description="Bạn có thể chọn từ danh sách bên trái hoặc dùng ô tìm kiếm để đi nhanh tới bài cần sửa."
              />
            </div>
          ) : (
            <Tabs value={view} onValueChange={(value) => {
              const next = value as QuizView;
              setView(next);
              if (next !== "builder") {
                setOpenAddQuestion(false);
              }
            }}>
              <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                <TabsList variant="line" className="w-full justify-start overflow-x-auto">
                  <TabsTrigger value="overview">
                    <ListChecks className="size-4" />
                    Tổng quan
                  </TabsTrigger>
                  <TabsTrigger value="builder">
                    <Settings2 className="size-4" />
                    Builder
                  </TabsTrigger>
                  <TabsTrigger value="preview">
                    <Eye className="size-4" />
                    Xem thử
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="overview" className="p-4 sm:p-5">
                {loadingQuiz ? (
                  <LoadingState label="Đang tải dữ liệu quiz..." />
                ) : (
                  <div className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Câu hỏi
                        </p>
                        <p className="mt-1 text-2xl font-semibold text-slate-950 dark:text-white">
                          {totalQuestions}
                        </p>
                      </div>
                      <div className="rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Câu hợp lệ
                        </p>
                        <p className="mt-1 text-2xl font-semibold text-slate-950 dark:text-white">
                          {readyQuestions}
                        </p>
                      </div>
                      <div className="rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Tổng điểm
                        </p>
                        <p className="mt-1 text-2xl font-semibold text-slate-950 dark:text-white">
                          {totalPoints}
                        </p>
                      </div>
                      <div className="rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Điểm đạt
                        </p>
                        <p className="mt-1 text-2xl font-semibold text-slate-950 dark:text-white">
                          {quiz?.passingScore ?? 70}%
                        </p>
                      </div>
                    </div>

                    {quizNoData || !quiz ? (
                      <div className="rounded-lg border border-dashed border-blue-200 bg-blue-50 p-5 dark:border-blue-900/60 dark:bg-blue-950/20">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h3 className="text-base font-semibold text-slate-950 dark:text-white">
                              Bài học này chưa có quiz
                            </h3>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                              Chuyển sang Builder để khởi tạo cấu hình quiz đầu tiên. Sau đó bạn có thể thêm câu hỏi, đáp án và xem thử.
                            </p>
                          </div>
                          <Button type="button" onClick={() => setView("builder")}>
                            <PlusCircle className="size-4" />
                            Tạo quiz
                          </Button>
                        </div>
                      </div>
                    ) : totalQuestions === 0 ? (
                      <div className="rounded-lg border border-dashed border-blue-200 bg-blue-50 p-5 dark:border-blue-900/60 dark:bg-blue-950/20">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h3 className="text-base font-semibold text-slate-950 dark:text-white">
                              Quiz chưa có câu hỏi
                            </h3>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                              Thêm câu hỏi đầu tiên để học viên có thể làm bài kiểm tra.
                            </p>
                          </div>
                          <Button type="button" onClick={goAddQuestion}>
                            <PlusCircle className="size-4" />
                            Thêm câu hỏi
                          </Button>
                        </div>
                      </div>
                    ) : quizIssues.length > 0 ? (
                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/60 dark:bg-amber-950/20">
                        <div className="flex gap-3">
                          <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-300" />
                          <div>
                            <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                              Cần kiểm tra trước khi xuất bản
                            </h3>
                            <ul className="mt-2 space-y-1 text-sm text-amber-800 dark:text-amber-200">
                              {quizIssues.slice(0, 5).map((issue) => (
                                <li key={issue}>- {issue}</li>
                              ))}
                              {quizIssues.length > 5 ? (
                                <li>- Và {quizIssues.length - 5} lỗi khác</li>
                              ) : null}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/20">
                        <div className="flex gap-3">
                          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-300" />
                          <div>
                            <h3 className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                              Quiz đã đủ cấu hình cơ bản
                            </h3>
                            <p className="mt-1 text-sm text-emerald-800 dark:text-emerald-200">
                              Bạn có thể xem thử trải nghiệm học viên hoặc tiếp tục tinh chỉnh trong Builder.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid gap-3 lg:grid-cols-3">
                      <div className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Thời gian
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                          {quiz?.timeLimit ? `${quiz.timeLimit} phút` : "Không giới hạn"}
                        </p>
                      </div>
                      <div className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Số lần làm
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                          {quiz?.maxAttempts ?? 1} lần
                        </p>
                      </div>
                      <div className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Hiển thị kết quả
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                          {quiz?.showResult ? "Có" : "Không"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="builder" className="p-4 sm:p-5">
                {loadingQuiz ? (
                  <LoadingState label="Đang tải builder..." />
                ) : (
                  <QuizBuilder
                    key={selectedLesson.id}
                    courseId={selectedCourse.id}
                    lessonId={selectedLesson.id}
                    existingQuiz={quizNoData ? undefined : quiz}
                    onCreated={handleQuizCreated}
                    autoOpenAddQuestion={openAddQuestion}
                  />
                )}
              </TabsContent>

              <TabsContent value="preview" className="p-4 sm:p-5">
                {loadingQuiz ? (
                  <LoadingState label="Đang tải bản xem thử..." />
                ) : !quiz ? (
                  <EmptyState
                    icon={Eye}
                    title="Chưa có quiz để xem thử"
                    description="Khởi tạo quiz trong Builder trước, sau đó quay lại tab này để kiểm tra nội dung."
                  />
                ) : quiz.questions.length === 0 ? (
                  <EmptyState
                    icon={FileQuestion}
                    title="Quiz chưa có câu hỏi"
                    description="Thêm ít nhất một câu hỏi trong Builder để có bản xem thử."
                  />
                ) : (
                  <div className="space-y-3">
                    {quiz.questions.map((question, index) => (
                      <div
                        key={question.id}
                        className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-300">
                              Câu {index + 1} · {QUESTION_TYPE_LABELS[question.type]}
                            </p>
                            <h3 className="mt-1 text-sm font-semibold leading-6 text-slate-950 dark:text-white">
                              {getQuestionText(question)}
                            </h3>
                          </div>
                          <StatusPill tone={getQuestionIssue(question) ? "orange" : "green"}>
                            {question.points} điểm
                          </StatusPill>
                        </div>

                        {question.type === "fill_blank" ? (
                          <div className="mt-3 rounded-md border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                            Học viên nhập câu trả lời tự do
                          </div>
                        ) : (
                          <div className="mt-3 space-y-2">
                            {(question.options ??
                              question.answers?.map((answer) => ({
                                id: answer.id,
                                content: answer.answer,
                                is_correct: answer.isCorrect,
                                order: answer.order,
                              })) ??
                              []
                            ).map((option) => (
                              <div
                                key={option.id ?? `${question.id}-${option.order}`}
                                className={cn(
                                  "flex items-center gap-2 rounded-md border px-3 py-2 text-sm",
                                  option.is_correct
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/20 dark:text-emerald-200"
                                    : "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300",
                                )}
                              >
                                <span
                                  className={cn(
                                    "size-3 rounded-full border",
                                    option.is_correct
                                      ? "border-emerald-500 bg-emerald-500"
                                      : "border-slate-300 dark:border-slate-600",
                                  )}
                                />
                                {option.content}
                              </div>
                            ))}
                          </div>
                        )}

                        {question.explanation ? (
                          <p className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-500 dark:bg-slate-900/60 dark:text-slate-400">
                            {question.explanation}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </AdminPanel>
      </div>
    </div>
  );
}
