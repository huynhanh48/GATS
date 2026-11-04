"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { apiClient, normalizeApiError } from "@/lib/api/client";
import type { LearningCoachResponse } from "@/lib/api/types";

type Props = {
  courseId: string;
  userId: number;
};

export function LearnerAiCoachPanel({ courseId, userId }: Props) {
  const [pending, startTransition] = useTransition();
  const [report, setReport] = useState<LearningCoachResponse["data"] | null>(
    null,
  );

  function handleGenerate() {
    startTransition(async () => {
      try {
        const res = await apiClient.post<LearningCoachResponse>(
          `/courses/${courseId}/enrollments/learners/${userId}/ai-coach`,
          null,
          { timeout: 0 },
        );
        setReport(res.data.data);
        toast.success(res.data.message ?? "Đã tạo báo cáo coach");
      } catch (error) {
        toast.error(normalizeApiError(error).message);
      }
    });
  }

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            AI Coach — đánh giá & gợi ý cải thiện
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Tổng hợp lịch sử quiz/assignment → báo cáo Markdown + JSON, lưu
            storage để chèn/tải lại.
          </p>
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={handleGenerate}
          className="inline-flex rounded-lg bg-[#0070EB] px-3 py-2 text-sm font-medium text-white hover:bg-[#005bb5] disabled:opacity-60"
        >
          {pending ? "Đang tạo…" : "Tạo báo cáo & lưu file"}
        </button>
      </div>

      {report ? (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2 text-sm">
            <a
              href={report.files.markdown.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-[#0070EB] hover:bg-slate-50 dark:border-slate-700"
            >
              Tải Markdown ({report.files.markdown.filename})
            </a>
            <a
              href={report.files.historyJson.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
            >
              Tải JSON lịch sử ({report.files.historyJson.filename})
            </a>
            <span className="self-center text-xs text-slate-500">
              {report.usedAi ? "Có lớp AI (Viava)" : "Baseline hệ thống (chưa AI)"}
            </span>
          </div>
          <pre className="max-h-[28rem] overflow-auto rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-800 dark:bg-slate-900 dark:text-slate-200">
            {report.reportMarkdown}
          </pre>
        </div>
      ) : null}
    </div>
  );
}
