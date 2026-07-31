"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Lightbulb,
  Loader2,
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

const softInputClass =
  "rounded-lg border border-border/50 bg-muted/25 px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-primary/40 focus:bg-background focus:ring-2 focus:ring-primary/10";

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

  if (blankCount <= 1) {
    return (
      <input
        value={parts[0] || ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full ${softInputClass}`}
        placeholder="Nhập đáp án…"
        aria-label="Ô trống 1"
        autoComplete="off"
      />
    );
  }

  let markerIndex = 0;
  const displayQuestion = question.question.replace(BLANK_PATTERN, () => {
    markerIndex += 1;
    return `(${markerIndex})`;
  });

  return (
    <div className="space-y-3">
      <p className="text-sm leading-7 text-foreground">{displayQuestion}</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {parts.map((part, index) => (
          <label key={index} className="space-y-1">
            <span className="block text-xs font-medium text-muted-foreground">
              Ô {index + 1}
            </span>
            <input
              value={part || ""}
              onChange={(e) => updatePart(index, e.target.value)}
              disabled={disabled}
              className={`w-full min-w-0 ${softInputClass}`}
              placeholder={`Nhập ô ${index + 1}`}
              autoComplete="off"
            />
          </label>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Điền lần lượt từng ô trống theo số thứ tự trong câu.
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
    } catch (err: any) {
      setQuiz(null);
      setError(err?.message || "Không tải được bài quiz");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
    } catch (err: any) {
      toast.error(err?.message || "Nộp bài thất bại");
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

  return (
    <div className="space-y-5 rounded-2xl bg-muted/20 p-4 sm:p-5">
      <div>
        <p className="mb-1 text-xs font-medium text-primary">Quiz</p>
        <h3 className="text-lg font-semibold">{quiz.title || "Bài kiểm tra"}</h3>
        {quiz.description ? (
          <p className="text-sm text-muted-foreground mt-1">{quiz.description}</p>
        ) : null}
      </div>

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
          <div className="space-y-5">
            {quiz.questions.map((q, idx) => {
              const blanks = countFillBlanks(q.question);
              const showTitleSeparately =
                q.type !== "fill_blank" || blanks <= 1;

              return (
                <div key={q.id} className="space-y-2">
                  {showTitleSeparately ? (
                    <p className="font-semibold text-sm">
                      {idx + 1}. {q.question}
                      <span className="text-muted-foreground font-normal">
                        {" "}
                        ({q.points} điểm)
                      </span>
                    </p>
                  ) : (
                    <p className="font-semibold text-sm">
                      {idx + 1}.
                      <span className="text-muted-foreground font-normal">
                        {" "}
                        ({q.points} điểm)
                      </span>
                    </p>
                  )}
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
                    <div className="space-y-2">
                      {(q.answers ?? []).map((opt) => (
                        <label
                          key={opt.id}
                          className="flex items-start gap-2 rounded-xl border border-border/60 bg-muted/15 px-3 py-2 text-sm cursor-pointer transition hover:bg-muted/40"
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
                            className="mt-1"
                          />
                          <span>{opt.answer}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <button
            type="button"
            disabled={submitting}
            onClick={() => void onSubmit()}
            className="rounded-xl bg-primary text-primary-foreground px-5 py-2.5 text-sm font-bold hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? "Đang nộp..." : "Nộp bài"}
          </button>
        </>
      )}
    </div>
  );
}
