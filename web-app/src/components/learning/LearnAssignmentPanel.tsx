"use client";

import { useEffect, useState } from "react";
import { FileText, Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import {
  fetchLessonAssignment,
  submitLessonAssignment,
  type AssignmentPayload,
} from "@/lib/learning/api";

type Props = {
  courseId: string;
  lessonId: string;
  onSubmitted?: () => void;
};

export function LearnAssignmentPanel({
  courseId,
  lessonId,
  onSubmitted,
}: Props) {
  const [assignment, setAssignment] = useState<AssignmentPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLessonAssignment(courseId, lessonId);
      setAssignment(data);
      setText(data.latestSubmission?.textContent || "");
      setUrl(data.latestSubmission?.url || "");
    } catch (err: any) {
      setAssignment(null);
      setError(err?.message || "Không tải được bài tập");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, lessonId]);

  const allowText = assignment?.allowedSubmissionTypes.includes("text");
  const allowUrl = assignment?.allowedSubmissionTypes.includes("url");
  const canSubmit =
    Boolean(assignment) && (assignment?.remainingSubmissions ?? 0) > 0;

  const onSubmit = async () => {
    if (!assignment) return;
    if (!text.trim() && !url.trim()) {
      toast.error("Nhập nội dung hoặc URL để nộp bài");
      return;
    }
    setSubmitting(true);
    try {
      await submitLessonAssignment(assignment.id, {
        ...(allowText && text.trim() ? { text_content: text.trim() } : {}),
        ...(allowUrl && url.trim() ? { url: url.trim() } : {}),
      });
      toast.success("Đã nộp bài tập");
      onSubmitted?.();
      await load();
    } catch (err: any) {
      toast.error(err?.message || "Nộp bài thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 flex items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" /> Đang tải bài tập…
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
        <p className="text-sm text-destructive">{error || "Không có bài tập"}</p>
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

  const latest = assignment.latestSubmission;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">
          Assignment
        </p>
        <h3 className="text-lg font-bold flex items-center gap-2">
          <FileText className="w-5 h-5" />
          {assignment.title || "Bài tập"}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Điểm tối đa {assignment.maxScore}
          {assignment.dueAt
            ? ` · Hạn ${new Date(assignment.dueAt).toLocaleString("vi-VN")}`
            : ""}
          {" · "}Còn {assignment.remainingSubmissions}/{assignment.maxSubmissions}{" "}
          lần nộp
        </p>
      </div>

      {latest ? (
        <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm space-y-1">
          <p className="font-semibold">
            Lần nộp gần nhất:{" "}
            <span className="capitalize">{latest.status}</span>
          </p>
          {latest.submittedAt ? (
            <p className="text-muted-foreground">
              {new Date(latest.submittedAt).toLocaleString("vi-VN")}
            </p>
          ) : null}
          {latest.score != null ? (
            <p>
              Điểm: {latest.score}/{assignment.maxScore}
            </p>
          ) : null}
          {latest.feedback ? (
            <p className="text-muted-foreground">Nhận xét: {latest.feedback}</p>
          ) : null}
        </div>
      ) : null}

      {canSubmit ? (
        <div className="space-y-3">
          {allowText ? (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              placeholder="Nội dung bài làm…"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
          ) : null}
          {allowUrl ? (
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
          ) : null}
          {!allowText && !allowUrl ? (
            <p className="text-sm text-muted-foreground">
              Bài tập này chỉ nhận file — vui lòng nộp qua kênh được giảng viên hướng dẫn (upload file sẽ bổ sung sau).
            </p>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={() => void onSubmit()}
              className="rounded-xl bg-primary text-primary-foreground px-5 py-2.5 text-sm font-bold hover:bg-primary/90 disabled:opacity-50"
            >
              {submitting ? "Đang nộp..." : "Nộp bài"}
            </button>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Bạn đã hết lượt nộp cho bài tập này.
        </p>
      )}
    </div>
  );
}
