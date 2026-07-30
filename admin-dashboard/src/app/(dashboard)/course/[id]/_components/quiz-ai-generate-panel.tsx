"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { QuizQuestion } from "@/lib/api/types";
import { quizClient } from "@/services/quiz.client";

const inputClass =
  "w-full rounded-lg border border-stroke bg-white px-4 py-2.5 text-dark outline-none transition focus:border-primary disabled:cursor-default disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white";
const labelClass = "mb-1.5 block text-sm font-medium text-dark dark:text-white";

type Props = {
  quizId: string;
  onGenerated: (questions: QuizQuestion[]) => void;
};

type SourceMode = "text" | "file_url" | "file";

export function QuizAiGeneratePanel({ quizId, onGenerated }: Props) {
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [sourceMode, setSourceMode] = useState<SourceMode>("text");
  const [text, setText] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState("vi");
  const [targetLevel, setTargetLevel] = useState("intermediate");
  const [questionCount, setQuestionCount] = useState(5);
  const [detailLevel, setDetailLevel] = useState("standard");
  const [exerciseTypes, setExerciseTypes] = useState(
    "mcq,true_false,fill_in_blank,short_answer",
  );

  function handleGenerate() {
    startTransition(async () => {
      const form = new FormData();
      form.append("language", language);
      form.append("target_level", targetLevel);
      form.append("question_count", String(questionCount));
      form.append("detail_level", detailLevel);
      form.append("exercise_types", exerciseTypes);
      form.append("apply", "true");
      form.append("shuffle_options", "true");
      form.append("max_options_per_mcq", "4");

      if (sourceMode === "text") {
        if (!text.trim()) {
          toast.error("Nhập nội dung text để sinh quiz");
          return;
        }
        form.append("text", text.trim());
      } else if (sourceMode === "file_url") {
        if (!fileUrl.trim()) {
          toast.error("Nhập URL S3 FLAC (…/audio.flac) hoặc URL tài liệu");
          return;
        }
        form.append("file_url", fileUrl.trim());
      } else {
        if (!file) {
          toast.error("Chọn file upload");
          return;
        }
        form.append("file", file);
      }

      const res = await quizClient.aiGenerate(quizId, form);
      if (res.error) {
        toast.error(res.error.message);
        return;
      }

      const created = (res.data?.data?.questions ?? []) as QuizQuestion[];
      const skipped = res.data?.data?.skipped_count ?? 0;
      onGenerated(created);
      toast.success(
        res.data?.message ??
          `Đã thêm ${created.length} câu hỏi${skipped ? ` (bỏ qua ${skipped})` : ""}`,
      );
      setOpen(false);
    });
  }

  if (!open) {
    return (
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-lg border border-violet-300 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700 hover:bg-violet-100 dark:border-violet-700 dark:bg-violet-950/40 dark:text-violet-200"
        >
          Sinh câu hỏi bằng AI
        </button>
      </div>
    );
  }

  return (
    <div className="mb-4 rounded-lg border border-violet-300 bg-violet-50/80 p-4 dark:border-violet-700 dark:bg-violet-950/20">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h6 className="text-sm font-semibold text-violet-900 dark:text-violet-100">
          AI sinh câu hỏi quiz
        </h6>
        <button
          type="button"
          className="text-sm text-dark-4 hover:text-dark dark:text-dark-6"
          onClick={() => setOpen(false)}
          disabled={pending}
        >
          Đóng
        </button>
      </div>
      <p className="mb-3 text-xs text-dark-4 dark:text-dark-6">
        Text / upload file / URL (PDF hoặc S3 FLAC{" "}
        <code className="text-[10px]">…/audio.flac</code>). Viava transcribe
        audio FLAC. Chỉ map mcq, đúng-sai, điền khuyết, short answer.
      </p>

      <div className="mb-3 flex flex-wrap gap-2">
        {(
          [
            ["text", "Text"],
            ["file_url", "URL S3 FLAC / file"],
            ["file", "Upload file"],
          ] as const
        ).map(([mode, label]) => (
          <button
            key={mode}
            type="button"
            disabled={pending}
            onClick={() => setSourceMode(mode)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              sourceMode === mode
                ? "bg-violet-600 text-white"
                : "bg-white text-slate-600 dark:bg-dark-2 dark:text-dark-6"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {sourceMode === "text" ? (
        <textarea
          className={`${inputClass} min-h-[120px]`}
          placeholder="Dán nội dung bài giảng / tài liệu…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={pending}
        />
      ) : null}
      {sourceMode === "file_url" ? (
        <input
          className={inputClass}
          placeholder="https://…/audio.flac hoặc URL tài liệu"
          value={fileUrl}
          onChange={(e) => setFileUrl(e.target.value)}
          disabled={pending}
        />
      ) : null}
      {sourceMode === "file" ? (
        <input
          type="file"
          className={inputClass}
          disabled={pending}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      ) : null}

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
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
            onChange={(e) => setQuestionCount(Number(e.target.value) || 5)}
            disabled={pending}
          />
        </div>
        <div>
          <label className={labelClass}>Độ chi tiết</label>
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

      <div className="mt-3">
        <label className={labelClass}>Loại bài tập (phân cách dấu phẩy)</label>
        <input
          className={inputClass}
          value={exerciseTypes}
          onChange={(e) => setExerciseTypes(e.target.value)}
          disabled={pending}
        />
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => setOpen(false)}
          className="rounded-lg border border-stroke px-4 py-2 text-sm dark:border-dark-3"
        >
          Hủy
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={handleGenerate}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-60"
        >
          {pending ? "Đang sinh (1–3 phút)…" : "Sinh & thêm vào quiz"}
        </button>
      </div>
    </div>
  );
}
