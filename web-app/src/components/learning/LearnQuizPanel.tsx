"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import {
  fetchLessonQuiz,
  submitLessonQuiz,
  type QuizSubmitResult,
  type QuizTakePayload,
} from "@/services/learning.service";

type Props = {
  courseId: string;
  lessonId: string;
  onPassed?: () => void;
};

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

    const missing = quiz.questions.filter(
      (q) => q.isRequired !== false && !answers[q.id]?.trim(),
    );
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
      <div className="rounded-2xl border border-border bg-card p-8 flex items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" /> Đang tải quiz…
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
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
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">
          Quiz
        </p>
        <h3 className="text-lg font-bold">{quiz.title || "Bài kiểm tra"}</h3>
        {quiz.description ? (
          <p className="text-sm text-muted-foreground mt-1">{quiz.description}</p>
        ) : null}
      </div>

      {result ? (
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
          <button
            type="button"
            onClick={() => void load()}
            className="text-sm font-semibold text-primary hover:underline"
          >
            Làm lại
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-5">
            {quiz.questions.map((q, idx) => (
              <div key={q.id} className="space-y-2">
                <p className="font-semibold text-sm">
                  {idx + 1}. {q.question}
                  <span className="text-muted-foreground font-normal">
                    {" "}
                    ({q.points} điểm)
                  </span>
                </p>
                {q.type === "fill_blank" ? (
                  <input
                    value={answers[q.id] || ""}
                    onChange={(e) =>
                      setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                    }
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                    placeholder="Nhập đáp án"
                  />
                ) : (
                  <div className="space-y-2">
                    {(q.answers ?? []).map((opt) => (
                      <label
                        key={opt.id}
                        className="flex items-start gap-2 rounded-xl border border-border px-3 py-2 text-sm cursor-pointer hover:bg-muted/50"
                      >
                        <input
                          type="radio"
                          name={q.id}
                          checked={answers[q.id] === opt.id}
                          onChange={() =>
                            setAnswers((prev) => ({ ...prev, [q.id]: opt.id }))
                          }
                          className="mt-1"
                        />
                        <span>{opt.answer}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
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
