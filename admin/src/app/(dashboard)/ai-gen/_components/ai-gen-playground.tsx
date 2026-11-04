"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  coursesClient,
  type AiQuizSourceItem,
  type AiQuizTargetItem,
} from "@/services/courses.client";
import { quizClient } from "@/services/quiz.client";

type SourceMode = "course_flac" | "s3_flac_url" | "text";

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100";
const labelClass =
  "mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400";

type CourseOption = { id: string; title: string };

function isDroppedConnection(message: string, status?: number): boolean {
  if (status === 504 || status === 502 || status === 524) return true;
  const m = message.toLowerCase();
  return (
    m.includes("network error") ||
    m.includes("504") ||
    m.includes("502") ||
    m.includes("timeout") ||
    m.includes("timed out") ||
    m.includes("econnaborted") ||
    m.includes("failed to fetch")
  );
}

export function AiGenPlayground() {
  const [pending, startTransition] = useTransition();

  const [courses, setCourses] = useState<CourseOption[]>([]);

  // Target quiz (where questions are applied) — independent of source
  const [targetCourseId, setTargetCourseId] = useState("");
  const [targets, setTargets] = useState<AiQuizTargetItem[]>([]);
  const [targetsLoading, setTargetsLoading] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState("");

  // Content source — independent of quiz
  const [sourceMode, setSourceMode] = useState<SourceMode>("course_flac");
  const [sourceCourseId, setSourceCourseId] = useState("");
  const [sources, setSources] = useState<AiQuizSourceItem[]>([]);
  const [sourcesLoading, setSourcesLoading] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState("");
  const [s3FlacUrl, setS3FlacUrl] = useState("");
  const [text, setText] = useState(
    "Lập trình hướng đối tượng (OOP) là một phương pháp luận lập trình dựa trên khái niệm 'đối tượng', có thể chứa dữ liệu dưới dạng các trường và mã dưới dạng các thủ tục. 4 trụ cột: Đóng gói, Kế thừa, Đa hình, Trừu tượng.",
  );

  const [language, setLanguage] = useState("vi");
  const [targetLevel, setTargetLevel] = useState("intermediate");
  const [questionCount, setQuestionCount] = useState(5);
  const [detailLevel, setDetailLevel] = useState("standard");
  const [exerciseTypes, setExerciseTypes] = useState(
    "mcq,true_false,fill_in_blank,short_answer",
  );

  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  const [skippedCount, setSkippedCount] = useState<number | null>(null);

  const selectedTarget = targets.find((t) => t.lessonId === selectedLessonId);
  const selectedSource = sources.find((s) => s.videoId === selectedVideoId);

  useEffect(() => {
    void coursesClient.list({ page: 1, limit: 100 }).then((res) => {
      if (res.error || !res.data?.data) return;
      setCourses(
        res.data.data.map((c: { id: string; title: string }) => ({
          id: c.id,
          title: c.title,
        })),
      );
    });
  }, []);

  useEffect(() => {
    if (!targetCourseId) {
      setTargets([]);
      setSelectedLessonId("");
      return;
    }
    let cancelled = false;
    setTargetsLoading(true);
    void coursesClient.listAiQuizTargets(targetCourseId).then((res) => {
      if (cancelled) return;
      setTargetsLoading(false);
      if (res.error) {
        toast.error(res.error.message);
        setTargets([]);
        return;
      }
      const items = res.data?.data ?? [];
      setTargets(items);
      setSelectedLessonId(items[0]?.lessonId ?? "");
    });
    return () => {
      cancelled = true;
    };
  }, [targetCourseId]);

  useEffect(() => {
    if (!sourceCourseId || sourceMode !== "course_flac") {
      setSources([]);
      setSelectedVideoId("");
      return;
    }
    let cancelled = false;
    setSourcesLoading(true);
    void coursesClient.listAiQuizSources(sourceCourseId).then((res) => {
      if (cancelled) return;
      setSourcesLoading(false);
      if (res.error) {
        toast.error(res.error.message);
        setSources([]);
        return;
      }
      const items = res.data?.data ?? [];
      setSources(items);
      setSelectedVideoId(items[0]?.videoId ?? "");
    });
    return () => {
      cancelled = true;
    };
  }, [sourceCourseId, sourceMode]);

  async function ensureQuizId(
    courseId: string,
    target: AiQuizTargetItem,
  ): Promise<string | null> {
    if (target.quizId) return target.quizId;

    const created = await quizClient.createQuiz(courseId, target.lessonId, {
      passing_score: 70,
      max_attempts: 1,
      show_result: true,
      show_explanation: true,
    });
    if (created.error || !created.data?.data?.id) {
      toast.error(
        created.error?.message ?? "Không khởi tạo được quiz cho bài học",
      );
      return null;
    }
    const quizId = created.data.data.id;
    setTargets((prev) =>
      prev.map((t) =>
        t.lessonId === target.lessonId
          ? { ...t, quizId, hasQuiz: true }
          : t,
      ),
    );
    return quizId;
  }

  function handleGenerateQuiz() {
    startTransition(async () => {
      if (!targetCourseId || !selectedTarget) {
        toast.error("Chọn khóa học và bài quiz đích");
        return;
      }

      let fileUrlToSend: string | undefined;
      let textToSend: string | undefined;

      if (sourceMode === "course_flac") {
        if (!selectedSource?.audioFlacUrl) {
          toast.error("Chọn video có audio FLAC làm nguồn");
          return;
        }
        fileUrlToSend = selectedSource.audioFlacUrl;
      } else if (sourceMode === "s3_flac_url") {
        if (!s3FlacUrl.trim()) {
          toast.error("Nhập URL S3 FLAC (https://…/audio.flac)");
          return;
        }
        fileUrlToSend = s3FlacUrl.trim();
      } else {
        if (!text.trim()) {
          toast.error("Nhập nội dung text");
          return;
        }
        textToSend = text.trim();
      }

      const targetQuizId = await ensureQuizId(targetCourseId, selectedTarget);
      if (!targetQuizId) return;

      const beforeRes = await quizClient.getAdmin(targetQuizId);
      const previousCount = beforeRes.data?.data?.questions?.length ?? 0;

      const form = new FormData();
      form.append("language", language);
      form.append("target_level", targetLevel);
      form.append("question_count", String(questionCount));
      form.append("detail_level", detailLevel);
      form.append("exercise_types", exerciseTypes);
      form.append("apply", "true");
      form.append("shuffle_options", "true");
      form.append("max_options_per_mcq", "4");
      if (fileUrlToSend) form.append("file_url", fileUrlToSend);
      if (textToSend) form.append("text", textToSend);

      try {
        const enqueue = await quizClient.aiGenerate(targetQuizId, form);
        if (enqueue.error) {
          if (isDroppedConnection(enqueue.error.message, enqueue.error.status)) {
            toast.message("Mất kết nối — đang tải lại câu hỏi từ quiz…");
            const recovered = await quizClient.recoverQuestionsAfterDrop(
              targetQuizId,
              previousCount,
            );
            if (recovered.length > 0) {
              setGeneratedQuestions(recovered);
              setSkippedCount(null);
              toast.success(
                `Đã có ${recovered.length} câu hỏi trong quiz (fallback)`,
              );
              return;
            }
          }
          toast.error(`Lỗi: ${enqueue.error.message}`);
          return;
        }

        const jobId = enqueue.data?.data?.jobId;
        if (!jobId) {
          toast.error("Không nhận được jobId từ server");
          return;
        }

        toast.message("Đang gen trên server… (poll job)");
        const res = await quizClient.waitForAiGenerateJob(targetQuizId, jobId);

        if (res.error) {
          const recovered = await quizClient.recoverQuestionsAfterDrop(
            targetQuizId,
            previousCount,
          );
          if (recovered.length > 0) {
            setGeneratedQuestions(recovered);
            setSkippedCount(null);
            toast.success(
              `Job lỗi/poll fail, nhưng đã có ${recovered.length} câu hỏi trong quiz`,
            );
            return;
          }
          toast.error(`Lỗi: ${res.error.message}`);
          return;
        }

        const questions = res.data?.data?.questions ?? [];
        const skipped = res.data?.data?.skipped_count ?? 0;
        setGeneratedQuestions(questions);
        setSkippedCount(skipped);
        toast.success(
          res.data?.message ??
            `Sinh thành công ${questions.length} câu hỏi!${skipped ? ` (Bỏ qua ${skipped})` : ""}`,
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Đã xảy ra lỗi khi gọi API";
        toast.message("Đang thử tải lại câu hỏi từ quiz…");
        const recovered = await quizClient.recoverQuestionsAfterDrop(
          targetQuizId,
          previousCount,
        );
        if (recovered.length > 0) {
          setGeneratedQuestions(recovered);
          toast.success(
            `Đã có ${recovered.length} câu hỏi trong quiz (fallback)`,
          );
          return;
        }
        toast.error(msg);
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 p-5 dark:border-blue-900/50 dark:from-blue-950/30 dark:to-indigo-950/30">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-md bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">
            Viava API v2.0
          </span>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Sinh Quiz AI
          </h2>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          Chọn bài quiz đích và nguồn nội dung độc lập (video FLAC / URL S3 /
          text). Không cần dán UUID.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-6 dark:border-slate-800 dark:bg-slate-950">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              1. Quiz đích (gắn câu hỏi vào đâu)
            </h3>

            <div>
              <label className={labelClass}>Khóa học</label>
              <select
                className={inputClass}
                value={targetCourseId}
                onChange={(e) => {
                  const id = e.target.value;
                  setTargetCourseId(id);
                  if (!sourceCourseId && id) setSourceCourseId(id);
                }}
                disabled={pending}
              >
                <option value="">— Chọn khóa học —</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>
                Bài quiz {targetsLoading ? "(đang tải…)" : ""}
              </label>
              <select
                className={inputClass}
                value={selectedLessonId}
                onChange={(e) => setSelectedLessonId(e.target.value)}
                disabled={pending || !targetCourseId || targetsLoading}
              >
                {targets.length === 0 ? (
                  <option value="">
                    {targetCourseId
                      ? "Khóa chưa có bài loại Quiz — thêm lesson Quiz trong Curriculum"
                      : "Chọn khóa học trước"}
                  </option>
                ) : (
                  targets.map((t) => (
                    <option key={t.lessonId} value={t.lessonId}>
                      {t.label}
                      {t.hasQuiz ? "" : " (sẽ tự khởi tạo)"}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
              <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
                2. Nguồn nội dung (sinh từ đâu)
              </h3>
              <div className="mb-3 flex flex-wrap gap-2">
                {(
                  [
                    ["course_flac", "Course video FLAC"],
                    ["s3_flac_url", "URL S3 FLAC"],
                    ["text", "Đoạn văn bản"],
                  ] as const
                ).map(([mode, label]) => (
                  <button
                    key={mode}
                    type="button"
                    disabled={pending}
                    onClick={() => setSourceMode(mode)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                      sourceMode === mode
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {sourceMode === "course_flac" && (
                <>
                  <div className="mb-3">
                    <label className={labelClass}>Khóa học nguồn (video)</label>
                    <select
                      className={inputClass}
                      value={sourceCourseId}
                      onChange={(e) => setSourceCourseId(e.target.value)}
                      disabled={pending}
                    >
                      <option value="">— Chọn khóa học —</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>
                      Video có FLAC {sourcesLoading ? "(đang tải…)" : ""}
                    </label>
                    <select
                      className={inputClass}
                      value={selectedVideoId}
                      onChange={(e) => setSelectedVideoId(e.target.value)}
                      disabled={pending || !sourceCourseId || sourcesLoading}
                    >
                      {sources.length === 0 ? (
                        <option value="">
                          {sourceCourseId
                            ? "Không có video ready + FLAC"
                            : "Chọn khóa học nguồn"}
                        </option>
                      ) : (
                        sources.map((s) => (
                          <option key={s.videoId} value={s.videoId}>
                            {(s.title || s.videoId).slice(0, 80)}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </>
              )}

              {sourceMode === "s3_flac_url" && (
                <div>
                  <label className={labelClass}>URL S3 FLAC</label>
                  <input
                    className={inputClass}
                    value={s3FlacUrl}
                    onChange={(e) => setS3FlacUrl(e.target.value)}
                    placeholder="https://…/audio.flac"
                    disabled={pending}
                  />
                </div>
              )}

              {sourceMode === "text" && (
                <div>
                  <label className={labelClass}>Nội dung văn bản</label>
                  <textarea
                    className={`${inputClass} min-h-[140px]`}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={pending}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-4 dark:border-slate-800">
              <div>
                <label className={labelClass}>Ngôn ngữ</label>
                <input
                  className={inputClass}
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  disabled={pending}
                />
              </div>
              <div>
                <label className={labelClass}>Trình độ</label>
                <select
                  className={inputClass}
                  value={targetLevel}
                  onChange={(e) => setTargetLevel(e.target.value)}
                  disabled={pending}
                >
                  <option value="beginner">beginner</option>
                  <option value="intermediate">intermediate</option>
                  <option value="advanced">advanced</option>
                  <option value="expert">expert</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Số câu hỏi</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  className={inputClass}
                  value={questionCount}
                  onChange={(e) =>
                    setQuestionCount(Number(e.target.value) || 5)
                  }
                  disabled={pending}
                />
              </div>
              <div>
                <label className={labelClass}>Chi tiết</label>
                <select
                  className={inputClass}
                  value={detailLevel}
                  onChange={(e) => setDetailLevel(e.target.value)}
                  disabled={pending}
                >
                  <option value="concise">concise</option>
                  <option value="standard">standard</option>
                  <option value="detailed">detailed</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              disabled={pending}
              onClick={handleGenerateQuiz}
              className="mt-2 w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-50"
            >
              {pending
                ? "Đang gen trên server… (có thể vài phút với FLAC)"
                : "Chạy thử Sinh Quiz AI"}
            </button>
          </div>

          <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-6 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Kết quả Sinh Quiz
              </h3>
              {skippedCount !== null && (
                <span className="rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                  Bỏ qua: {skippedCount}
                </span>
              )}
            </div>
            {generatedQuestions.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center text-center text-slate-400">
                <p className="text-sm">Chưa có dữ liệu quiz được sinh.</p>
              </div>
            ) : (
              <div className="max-h-[460px] space-y-3 overflow-y-auto pr-1">
                {generatedQuestions.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    className="rounded-lg border border-slate-200 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-900/50"
                  >
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      Câu {idx + 1} [{q.type || "MCQ"}]
                    </span>
                    <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">
                      {q.question || q.content || q.prompt}
                    </p>
                    {Array.isArray(q.answers) && (
                      <div className="mt-2 space-y-1">
                        {q.answers.map((a: any, i: number) => (
                          <div
                            key={i}
                            className={`rounded px-2.5 py-1 text-xs ${
                              a.isCorrect
                                ? "bg-emerald-100 font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                                : "bg-white text-slate-600 dark:bg-slate-800"
                            }`}
                          >
                            {a.answer}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
      </div>
    </div>
  );
}
