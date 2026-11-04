"use client";

import { StatusPill } from "@/components/Layouts/admin-surface";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
  AssignmentSubmissionAdmin,
  AssignmentSubmissionStatus,
} from "@/lib/api/types";
import { formatVnDateTime } from "@/lib/datetime";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { gradeAssignmentSubmission } from "../../../actions";

const STATUS_LABELS: Record<AssignmentSubmissionStatus, string> = {
  draft: "Nháp",
  submitted: "Đã nộp",
  graded: "Đã chấm",
  returned: "Đã trả",
};

function statusTone(
  status: AssignmentSubmissionStatus,
): "green" | "orange" | "blue" | "slate" {
  if (status === "graded" || status === "returned") return "green";
  if (status === "submitted") return "blue";
  return "slate";
}

function formatDate(value: string | null) {
  return formatVnDateTime(value);
}

type AssignmentSubmissionRowProps = {
  assignmentId: string;
  submission: AssignmentSubmissionAdmin;
  maxScore: number;
};

export function AssignmentSubmissionRow({
  assignmentId,
  submission,
  maxScore,
}: AssignmentSubmissionRowProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [score, setScore] = useState(
    submission.score !== null ? String(submission.score) : "",
  );
  const [feedback, setFeedback] = useState(submission.feedback ?? "");
  const [loading, setLoading] = useState(false);

  async function handleGrade() {
    const parsedScore = Number(score);
    if (!Number.isFinite(parsedScore) || parsedScore < 0) {
      toast.error("Điểm không hợp lệ");
      return;
    }

    setLoading(true);
    const result = await gradeAssignmentSubmission(assignmentId, submission.id, {
      score: parsedScore,
      feedback: feedback.trim() || undefined,
    });
    setLoading(false);

    if (result.ok) {
      toast.success(result.message);
      setOpen(false);
      router.refresh();
      return;
    }

    toast.error(result.message);
  }

  return (
    <li className="px-4 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {submission.userName ?? `#${submission.userId}`}
            </span>
            <StatusPill tone={statusTone(submission.status)}>
              {STATUS_LABELS[submission.status]}
            </StatusPill>
          </div>
          <p className="text-xs text-slate-500">
            {submission.email ?? "—"} · Lần {submission.submissionNumber} ·
            Nộp lúc {formatDate(submission.submittedAt)}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span className="text-sm text-slate-700 dark:text-slate-200">
            {submission.score !== null
              ? `${submission.score}/${maxScore} điểm`
              : "Chưa chấm"}
          </span>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-[#0070EB]/40 hover:bg-[#eaf2ff] hover:text-[#0070EB] dark:border-slate-700 dark:text-slate-200"
          >
            {submission.score !== null ? "Sửa điểm" : "Chấm điểm"}
          </button>
        </div>
      </div>

      {submission.textContent ? (
        <p className="mt-2 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-900/50 dark:text-slate-300">
          {submission.textContent}
        </p>
      ) : null}

      {submission.url ? (
        <a
          href={submission.url}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-block text-sm text-[#0070EB] hover:underline"
        >
          {submission.url}
        </a>
      ) : null}

      {submission.attachments.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {submission.attachments.map((attachment) => (
            <a
              key={attachment.id}
              href={attachment.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:border-[#0070EB]/40 hover:text-[#0070EB] dark:border-slate-700 dark:text-slate-300"
            >
              {attachment.fileName}
            </a>
          ))}
        </div>
      ) : null}

      {submission.feedback ? (
        <p className="mt-2 text-xs text-slate-500">
          Phản hồi: {submission.feedback}
        </p>
      ) : null}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chấm điểm bài nộp</DialogTitle>
            <DialogDescription>
              {submission.userName ?? `#${submission.userId}`} · Điểm tối đa{" "}
              {maxScore}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Điểm
              </label>
              <input
                type="number"
                min={0}
                max={maxScore}
                value={score}
                onChange={(e) => setScore(e.target.value)}
                disabled={loading}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#0070EB] dark:border-slate-700 dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Phản hồi (không bắt buộc)
              </label>
              <textarea
                rows={3}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                disabled={loading}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#0070EB] dark:border-slate-700 dark:bg-slate-950"
              />
            </div>
          </div>

          <DialogFooter>
            <button
              type="button"
              disabled={loading}
              onClick={() => setOpen(false)}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-900 disabled:opacity-60"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleGrade}
              className="rounded-md bg-[#0070EB] px-3 py-2 text-sm font-medium text-white hover:bg-[#0060c8] disabled:opacity-60"
            >
              {loading ? "Đang lưu…" : "Lưu điểm"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </li>
  );
}
