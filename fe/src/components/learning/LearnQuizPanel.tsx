"use client";

import { useEffect, useState } from "react";
import {
  BookOpenCheck,
  CheckCircle2,
  CircleHelp,
  Lightbulb,
  Loader2,
  Send,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  fetchLessonQuiz,
  submitLessonQuiz,
  type QuizSubmitResult,
  type QuizTakePayload,
  type QuizTakeQuestion,
} from "@/services/learning.service";

type Props = {
  courseId: string;
  lessonId: string;
  onPassed?: () => void;
};

/**
 * Matches plain blanks (`___`) and numbered blanks (`___1___`).
 * A numbered marker is one blank, not two underscore groups.
 */
const BLANK_PATTERN = /_{3,}\s*\d+\s*_{3,}|_{3,}/g;
export const FILL_BLANK_JOIN = "|";

export function countFillBlanks(questionText: string): number {
  return (questionText.match(BLANK_PATTERN) ?? []).length;
}

export function splitFillBlankParts(value: string, blankCount: number): string[] {
  const raw = value ?? "";
  if (blankCount <= 1) return [raw];
  const parts = raw.includes(FILL_BLANK_JOIN)
    ? raw.split(FILL_BLANK_JOIN)
    : raw.includes(";")
      ? raw.split(";")
      : raw.split(",");
  const normalized = parts.map((p) => p.trim());
  while (normalized.length < blankCount) normalized.push("");
  return normalized.slice(0, blankCount);
}

export function joinFillBlankParts(parts: string[]): string {
  return parts.map((p) => p.trim()).join(FILL_BLANK_JOIN);
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

const softInputClass =
  "rounded-xl border border-border bg-background px-4 py-3 text-[15px] text-foreground outline-none transition placeholder:text-muted-foreground/65 focus:border-primary/60 focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60";

function FillBlankAnswer({
  question,
  value,
  onChange,
  disabled,
}: {
  question: QuizTakeQuestion;
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
}) {
  const blankCount = countFillBlanks(question.question);
  const parts =
    blankCount > 1
      ? splitFillBlankParts(value, blankCount)
      : [value ?? ""];

  const updatePart = (index: number, next: string) => {
    if (blankCount <= 1) {
      onChange(next);
      return;
    }
    const copy = [...parts];
    copy[index] = next;
    onChange(joinFillBlankParts(copy));
  };

  if (blankCount === 0) {
    return (
      <div className="space-y-2">
        <label
          htmlFor={`essay-${question.id}`}
          className="text-sm font-semibold text-foreground"
        >
          Bài làm của bạn
        </label>
        <textarea
          id={`essay-${question.id}`}
          value={parts[0] || ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`min-h-36 w-full resize-y leading-6 ${softInputClass}`}
          placeholder="Trình bày câu trả lời đầy đủ, rõ ràng và có dẫn chứng nếu cần…"
          aria-describedby={`essay-help-${question.id}`}
        />
        <div
          id={`essay-help-${question.id}`}
          className="flex items-center justify-between gap-3 text-xs text-muted-foreground"
        >
          <span>Câu trả lời được lưu trong lúc bạn nhập.</span>
          <span className="shrink-0 tabular-nums">
            {(parts[0] || "").length} ký tự
          </span>
        </div>
      </div>
    );
  }

  if (blankCount === 1) {
    return (
      <label className="block space-y-2">
        <span className="text-sm font-semibold text-foreground">
          Câu trả lời
        </span>
        <input
          value={parts[0] || ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`w-full ${softInputClass}`}
          placeholder="Nhập đáp án…"
          aria-label="Ô trống 1"
          autoComplete="off"
        />
      </label>
    );
  }

  const displayQuestion = question.question
    .split(BLANK_PATTERN)
    .map((segment, index) =>
      index === 0 ? segment : `____${index}____${segment}`,
    )
    .join("");

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-border/60 bg-muted/35 px-4 py-3 font-medium text-[15px] leading-8 text-foreground">
        {displayQuestion}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {parts.map((part, index) => (
          <label
            key={index}
            className="rounded-xl border border-border/60 bg-card p-3 transition focus-within:border-primary/40 focus-within:bg-primary/[0.025]"
          >
            <span className="mb-2 flex items-center justify-between gap-3 text-sm font-semibold text-foreground">
              <span>Đáp án {index + 1}</span>
              <span className="font-mono text-xs font-bold tracking-wide text-primary">
                ____{index + 1}____
              </span>
            </span>
            <input
              value={part || ""}
              onChange={(e) => updatePart(index, e.target.value)}
              disabled={disabled}
              className={`w-full min-w-0 ${softInputClass}`}
              placeholder={`Nhập đáp án cho ô ${index + 1}`}
              aria-label={`Đáp án cho ô trống ${index + 1}`}
              autoComplete="off"
            />
          </label>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Điền đáp án tương ứng với số được đánh dấu trong câu hỏi.
      </p>
    </div>
  );
}

export function LearnQuizPanel({ courseId, lessonId, onPassed }: Props) {
  const [quiz, setQuiz] = useState<QuizTakePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizSubmitResult | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await fetchLessonQuiz(courseId, lessonId);
      setQuiz(data);
      setAnswers({});
    } catch (err: unknown) {
      setQuiz(null);
      setError(getErrorMessage(err, "Không tải được bài quiz"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, lessonId]);

  const onSubmit = async () => {
    if (!quiz) return;

    type AnswerPayload = {
      questionId: string;
      selectedAnswerId?: string;
      textAnswer?: string;
    };

    const payload: AnswerPayload[] = [];
    for (const q of quiz.questions) {
      const value = answers[q.id]?.trim();
      if (!value) continue;
      if (q.type === "fill_blank") {
        payload.push({ questionId: q.id, textAnswer: value });
      } else {
        payload.push({ questionId: q.id, selectedAnswerId: value });
      }
    }

    const missing = quiz.questions.filter((q) => {
      if (q.isRequired === false) return false;
      const value = answers[q.id]?.trim();
      if (!value) return true;
      if (q.type === "fill_blank") {
        const blanks = countFillBlanks(q.question);
        if (blanks > 1) {
          return splitFillBlankParts(value, blanks).some((p) => !p.trim());
        }
      }
      return false;
    });
    if (missing.length > 0) {
      toast.error("Vui lòng trả lời hết các câu bắt buộc");
      return;
    }

    setSubmitting(true);
    try {
      const data = await submitLessonQuiz(quiz.id, payload);
      setResult(data);
      if (data.passed !== false) {
        onPassed?.();
      }
      toast.success(
        data.passed === false
          ? "Đã nộp bài — chưa đạt điểm qua"
          : "Đã nộp bài quiz",
      );
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Nộp bài thất bại"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-muted/20 p-8 flex items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" /> Đang tải quiz…
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="space-y-3 rounded-2xl bg-muted/20 p-5">
        <p className="text-sm text-destructive">{error || "Không có quiz"}</p>
        <button
          type="button"
          onClick={() => void load()}
          className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-semibold hover:bg-muted"
        >
          <RotateCcw className="w-4 h-4" /> Thử lại
        </button>
      </div>
    );
  }

  const answeredCount = quiz.questions.filter(
    (question) => Boolean(answers[question.id]?.trim()),
  ).length;
  const completionPercent =
    quiz.questions.length > 0
      ? Math.round((answeredCount / quiz.questions.length) * 100)
      : 0;

  return (
    <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
      <header className="border-b border-border/70 bg-gradient-to-br from-primary/[0.07] via-background to-background p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <BookOpenCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
                Bài kiểm tra kiến thức
              </p>
              <h3 className="mt-1 text-xl font-bold">
                {quiz.title || "Bài kiểm tra"}
              </h3>
            </div>
          </div>
          {!result ? (
            <div className="min-w-40 rounded-xl border border-border/70 bg-background/80 px-3 py-2.5">
              <div className="flex justify-between text-xs font-medium text-muted-foreground">
                <span>Tiến độ</span>
                <span className="tabular-nums">
                  {answeredCount}/{quiz.questions.length} câu
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-300"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
            </div>
          ) : null}
        </div>
        {quiz.description ? (
          <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">
            {quiz.description}
          </p>
        ) : null}
      </header>

      <div className="p-4 sm:p-6">
      {result ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Kết quả: {result.correctCount}/{result.totalQuestions} đúng ·{" "}
              {Math.round(result.percentage)}%
              {typeof result.passed === "boolean"
                ? result.passed
                  ? " · Đạt"
                  : " · Chưa đạt"
                : null}
            </div>
            <p className="text-sm text-muted-foreground">
              Điểm: {result.score}/{result.maxScore}
            </p>
          </div>

          <div className="space-y-3" aria-label="Chi tiết kết quả bài kiểm tra">
            {result.results.map((item, index) => (
              <article
                key={item.questionId}
                className={`rounded-xl border p-4 ${
                  item.isCorrect
                    ? "border-emerald-500/25 bg-emerald-500/[0.06]"
                    : "border-destructive/25 bg-destructive/[0.04]"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {item.isCorrect ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                  )}
                  <div className="min-w-0 flex-1 space-y-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Câu {index + 1} · {item.score}/{item.maxScore} điểm
                      </p>
                      <p className="mt-1 text-sm font-semibold leading-6">
                        {item.question}
                      </p>
                    </div>

                    <dl className="grid gap-2 text-sm">
                      <div>
                        <dt className="font-medium text-muted-foreground">
                          Câu trả lời của bạn
                        </dt>
                        <dd
                          className={
                            item.isCorrect
                              ? "mt-0.5 text-emerald-700 dark:text-emerald-300"
                              : "mt-0.5 text-destructive"
                          }
                        >
                          {item.selectedAnswer || "Chưa trả lời"}
                        </dd>
                      </div>
                      {!item.isCorrect && item.correctAnswers.length > 0 ? (
                        <div>
                          <dt className="font-medium text-muted-foreground">
                            Đáp án đúng
                          </dt>
                          <dd className="mt-0.5 text-emerald-700 dark:text-emerald-300">
                            {item.correctAnswers.join(" · ")}
                          </dd>
                        </div>
                      ) : null}
                    </dl>

                    {item.explanation ? (
                      <div className="flex items-start gap-2 rounded-lg bg-background/70 p-3 text-sm leading-6">
                        <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                        <div>
                          <p className="font-semibold">Giải thích từ VIAVA</p>
                          <p className="mt-0.5 text-muted-foreground">
                            {item.explanation}
                          </p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>

          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-primary transition hover:bg-muted"
          >
            <RotateCcw className="h-4 w-4" />
            Làm lại bài
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {quiz.questions.map((q, idx) => {
              const blanks = countFillBlanks(q.question);
              const showTitleSeparately =
                q.type !== "fill_blank" || blanks <= 1;
              const isEssay = q.type === "fill_blank" && blanks === 0;

              return (
                <article
                  key={q.id}
                  className="scroll-mt-24 rounded-2xl border border-border/70 bg-background p-4 transition-shadow focus-within:border-primary/30 focus-within:shadow-[0_8px_30px_-18px_hsl(var(--primary)/0.35)] sm:p-5"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="grid h-7 min-w-7 place-items-center rounded-lg bg-primary/10 px-2 text-xs font-bold text-primary">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-semibold text-muted-foreground">
                        {isEssay
                          ? "Tự luận"
                          : q.type === "fill_blank"
                            ? "Điền khuyết"
                            : "Chọn một đáp án"}
                      </span>
                    </div>
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                      {q.points} điểm
                    </span>
                  </div>
                  {showTitleSeparately ? (
                    <p className="mb-4 text-[15px] font-semibold leading-7 sm:text-base">
                      {q.question}
                    </p>
                  ) : null}
                  {q.description ? (
                    <div className="mb-4 flex items-start gap-2 rounded-xl bg-muted/50 px-3 py-2.5 text-sm text-muted-foreground">
                      <CircleHelp className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{q.description}</span>
                    </div>
                  ) : null}
                  {q.type === "fill_blank" ? (
                    <FillBlankAnswer
                      question={q}
                      value={answers[q.id] || ""}
                      onChange={(next) =>
                        setAnswers((prev) => ({ ...prev, [q.id]: next }))
                      }
                      disabled={submitting}
                    />
                  ) : (
                    <div className="grid gap-2.5">
                      {(q.answers ?? []).map((opt, optionIndex) => {
                        const selected = answers[q.id] === opt.id;
                        return (
                        <label
                          key={opt.id}
                          className={`group flex min-h-14 cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-sm leading-6 transition ${
                            selected
                              ? "border-primary/60 bg-primary/[0.07] text-foreground ring-2 ring-primary/10"
                              : "border-border/70 bg-card hover:border-primary/30 hover:bg-muted/35"
                          }`}
                        >
                          <input
                            type="radio"
                            name={q.id}
                            checked={answers[q.id] === opt.id}
                            onChange={() =>
                              setAnswers((prev) => ({
                                ...prev,
                                [q.id]: opt.id,
                              }))
                            }
                            className="sr-only"
                          />
                          <span
                            aria-hidden="true"
                            className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs font-bold transition ${
                              selected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-background text-muted-foreground group-hover:border-primary/40"
                            }`}
                          >
                            {String.fromCharCode(65 + optionIndex)}
                          </span>
                          <span className="flex-1">{opt.answer}</span>
                          {selected ? (
                            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                          ) : null}
                        </label>
                        );
                      })}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
          <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-border/70 bg-muted/25 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {answeredCount === quiz.questions.length
                ? "Bạn đã trả lời tất cả câu hỏi."
                : `Còn ${quiz.questions.length - answeredCount} câu chưa trả lời.`}
            </p>
            <button
              type="button"
              disabled={submitting}
              onClick={() => void onSubmit()}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {submitting ? "Đang nộp bài..." : "Nộp bài kiểm tra"}
            </button>
          </div>
        </>
      )}
      </div>
    </section>
  );
}
