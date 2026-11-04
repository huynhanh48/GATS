"use client";

import { useEffect, useState } from "react";
import { FileText, Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import {
  fetchLessonAssignment,
  submitLessonAssignment,
  type AssignmentPayload,
} from "@/services/learning.service";

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
      <div className="flex items-center justify-center gap-2 rounded-2xl bg-muted/20 p-8 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" /> Đang tải bài tập…
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="space-y-3 rounded-2xl bg-muted/20 p-5">
        <p className="text-sm text-destructive">{error || "Không có bài tập"}</p>
        <button
          type="button"
          onClick={() => void load()}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-semibold hover:bg-muted"
        >
          <RotateCcw className="h-4 w-4" /> Thử lại
        </button>
      </div>
    );
  }

  const latest = assignment.latestSubmission;

  return (
    <div className="space-y-5 rounded-2xl bg-muted/20 p-4 sm:p-5">
      <div>
        <p className="mb-1 text-xs font-medium text-primary">Bài tập</p>
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <FileText className="h-5 w-5" />
          {assignment.title || "Bài tập"}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Điểm tối đa {assignment.maxScore}
          {assignment.dueAt
            ? ` · Hạn ${new Date(assignment.dueAt).toLocaleString("vi-VN")}`
            : ""}
          {" · "}Còn {assignment.remainingSubmissions}/{assignment.maxSubmissions}{" "}
          lần nộp
        </p>
      </div>

      {latest ? (
        <div className="space-y-1 rounded-xl bg-background/60 p-4 text-sm">
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
              className="w-full rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
            />
          ) : null}
          {allowUrl ? (
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…"
              className="w-full rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
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
              className="cursor-pointer rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
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
