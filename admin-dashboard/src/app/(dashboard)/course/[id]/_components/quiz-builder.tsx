"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type {
  Quiz,
  QuizQuestion,
  QuizQuestionType,
  QuizOption,
  AcceptedAnswer,
  CreateQuizInput,
  CreateQuizQuestionInput,
  UpdateQuizQuestionInput,
} from "@/lib/api/types";
import { quizClient } from "@/services/quiz.client";
import { QuizAiGeneratePanel } from "./quiz-ai-generate-panel";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const inputClass =
  "w-full rounded-lg border border-stroke bg-white px-4 py-2.5 text-dark outline-none transition focus:border-primary disabled:cursor-default disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white";
const labelClass = "mb-1.5 block text-sm font-medium text-dark dark:text-white";

const QUESTION_TYPE_LABELS: Record<
  Exclude<QuizQuestionType, "true_false">,
  string
> = {
  single_choice: "Một đáp án",
  multiple_choice: "Nhiều đáp án",
  fill_blank: "Điền vào chỗ trống",
};

const QUESTION_TYPE_DISPLAY: Record<string, string> = {
  ...QUESTION_TYPE_LABELS,
  true_false: "Đúng / Sai",
};

function emptyOption(order: number): QuizOption {
  return { content: "", is_correct: false, order };
}

// ─── QuizSettingsForm ─────────────────────────────────────────────────────────

type QuizSettingsFormProps = {
  quizId: string;
  initial: Partial<Quiz>;
};

function QuizSettingsForm({ quizId, initial }: QuizSettingsFormProps) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    passing_score: initial.passingScore ?? 70,
    time_limit: initial.timeLimit?.toString() ?? "",
    max_attempts: initial.maxAttempts ?? 1,
    shuffle_questions: initial.shuffleQuestions ?? false,
    shuffle_options: initial.shuffleOptions ?? false,
    show_result: initial.showResult ?? true,
    show_correct_answer: initial.showCorrectAnswer ?? false,
    show_explanation: initial.showExplanation ?? true,
  });

  async function handleSave() {
    setSaving(true);
    const input: CreateQuizInput = {
      passing_score: form.passing_score,
      ...(form.time_limit ? { time_limit: Number(form.time_limit) } : {}),
      max_attempts: form.max_attempts,
      shuffle_questions: form.shuffle_questions,
      shuffle_options: form.shuffle_options,
      show_result: form.show_result,
      show_correct_answer: form.show_correct_answer,
      show_explanation: form.show_explanation,
    };
    const res = await quizClient.updateQuiz(quizId, input);
    setSaving(false);
    if (res.error) {
      toast.error(res.error.message);
    } else {
      toast.success("Đã cập nhật cài đặt quiz");
    }
  }

  return (
    <div className="mb-4 rounded-lg border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-dark-2">
      <h6 className="mb-3 text-xs font-semibold uppercase tracking-wider text-dark-4 dark:text-dark-6">
        Cài đặt Quiz
      </h6>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div>
          <label className={labelClass}>Điểm đạt (%)</label>
          <input
            type="number" min={0} max={100}
            value={form.passing_score}
            onChange={(e) => setForm((f) => ({ ...f, passing_score: Number(e.target.value) }))}
            className={inputClass} disabled={saving}
          />
        </div>
        <div>
          <label className={labelClass}>Thời gian (phút)</label>
          <input
            type="number" min={1}
            value={form.time_limit}
            onChange={(e) => setForm((f) => ({ ...f, time_limit: e.target.value }))}
            placeholder="Không giới hạn"
            className={inputClass} disabled={saving}
          />
        </div>
        <div>
          <label className={labelClass}>Số lần làm tối đa</label>
          <input
            type="number" min={1}
            value={form.max_attempts}
            onChange={(e) => setForm((f) => ({ ...f, max_attempts: Number(e.target.value) }))}
            className={inputClass} disabled={saving}
          />
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-4">
        {(
          [
            ["shuffle_questions", "Xáo thứ tự câu hỏi"],
            ["shuffle_options", "Xáo thứ tự đáp án"],
            ["show_result", "Hiển thị kết quả"],
            ["show_correct_answer", "Hiển thị đáp án đúng"],
            ["show_explanation", "Hiển thị giải thích"],
          ] as [keyof typeof form, string][]
        ).map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 text-sm text-dark dark:text-white">
            <input
              type="checkbox"
              checked={form[key] as boolean}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))}
              disabled={saving}
              className="size-4 rounded border-stroke"
            />
            {label}
          </label>
        ))}
      </div>
      <div className="mt-3 flex justify-end">
        <button
          type="button" onClick={handleSave} disabled={saving}
          className="hover:bg-opacity-90 rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-white transition disabled:opacity-70"
        >
          {saving ? "Đang lưu..." : "Lưu cài đặt"}
        </button>
      </div>
    </div>
  );
}

// ─── QuestionForm ─────────────────────────────────────────────────────────────

type QuestionFormProps = {
  quizId: string;
  initial?: QuizQuestion;
  order: number;
  onSaved: (q: QuizQuestion) => void;
  onCancel: () => void;
};

function QuestionForm({ quizId, initial, order, onSaved, onCancel }: QuestionFormProps) {
  const [saving, setSaving] = useState(false);
  const [type, setType] = useState<QuizQuestionType>(initial?.type ?? "single_choice");
  const [title, setTitle] = useState(initial?.title ?? initial?.question ?? "");
  const [explanation, setExplanation] = useState(initial?.explanation ?? "");
  const [points, setPoints] = useState(initial?.points ?? 1);
  const [options, setOptions] = useState<QuizOption[]>(
    initial?.options?.map((o) => ({ ...o })) ??
    initial?.answers?.map((a) => ({ content: a.answer, is_correct: a.isCorrect, order: a.order })) ??
      [emptyOption(0), emptyOption(1)]
  );
  const [acceptedAnswers, setAcceptedAnswers] = useState<AcceptedAnswer[]>(
    initial?.acceptedAnswers?.map((a) => ({ ...a })) ??
    initial?.answers?.map((a) => ({ content: a.answer, is_exact: true })) ??
    [{ content: "", is_exact: true }]
  );

  // When type changes, reset answers
  useEffect(() => {
    if (initial) return; // don't reset when editing
    if (type === "single_choice" || type === "multiple_choice") {
      setOptions([emptyOption(0), emptyOption(1)]);
    }
    if (type === "fill_blank") {
      setAcceptedAnswers([{ content: "", is_exact: true }]);
    }
  }, [type, initial]);

  function updateOption(idx: number, patch: Partial<QuizOption>) {
    setOptions((opts) => opts.map((o, i) => (i === idx ? { ...o, ...patch } : o)));
  }

  function setCorrect(idx: number) {
    setOptions((opts) =>
      opts.map((o, i) => ({
        ...o,
        is_correct: type === "multiple_choice" ? (i === idx ? !o.is_correct : o.is_correct) : i === idx,
      }))
    );
  }

  function validate(): string | null {
    if (!title.trim()) return "Tiêu đề câu hỏi là bắt buộc";
    const correct = options.filter((o) => o.is_correct);
    if (type === "single_choice" || type === "multiple_choice") {
      const filled = options.map((o) => o.content.trim()).filter(Boolean);
      if (filled.length < 2) return "Cần ít nhất 2 lựa chọn";
      const unique = new Set(filled.map((c) => c.toLowerCase()));
      if (unique.size !== filled.length) {
        return "Các lựa chọn không được trùng nội dung";
      }
    }
    if (type === "single_choice") {
      if (correct.length !== 1) return "Phải chọn đúng 1 đáp án đúng";
    }
    if (type === "multiple_choice") {
      if (correct.length < 2) return "Phải có ít nhất 2 đáp án đúng";
    }
    if (type === "fill_blank") {
      const filled = acceptedAnswers.map((a) => a.content.trim()).filter(Boolean);
      if (!filled.length) return "Cần ít nhất 1 đáp án được chấp nhận";
      const unique = new Set(filled.map((c) => c.toLowerCase()));
      if (unique.size !== filled.length) {
        return "Các đáp án chấp nhận không được trùng nội dung";
      }
    }
    return null;
  }

  async function handleSave() {
    const err = validate();
    if (err) { toast.error(err); return; }

    const payload: CreateQuizQuestionInput | UpdateQuizQuestionInput = {
      type,
      title: title.trim(),
      ...(explanation.trim() ? { explanation: explanation.trim() } : {}),
      points,
      order,
      ...(["single_choice", "multiple_choice"].includes(type)
        ? {
            options: options
              .filter((o) => o.content.trim())
              .map((o, i) => ({ content: o.content.trim(), is_correct: o.is_correct, order: i })),
          }
        : {}),
      ...(type === "fill_blank"
        ? {
            accepted_answers: acceptedAnswers
              .filter((a) => a.content.trim())
              .map((a) => ({ content: a.content.trim(), is_exact: a.is_exact })),
          }
        : {}),
    };

    setSaving(true);
    let res;
    if (initial) {
      res = await quizClient.updateQuestion(initial.id, payload as UpdateQuizQuestionInput);
    } else {
      res = await quizClient.createQuestion(quizId, payload as CreateQuizQuestionInput);
    }
    setSaving(false);

    if (res.error) { toast.error(res.error.message); return; }
    toast.success(initial ? "Đã cập nhật câu hỏi" : "Đã thêm câu hỏi");
    if (res.data) onSaved(res.data.data);
  }

  const showOptions = ["single_choice", "multiple_choice"].includes(type);
  const showAccepted = type === "fill_blank";

  return (
    <div className="rounded-lg border border-primary/30 bg-white p-4 dark:bg-dark-2">
      <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label className={labelClass}>Câu hỏi *</label>
          <input
            type="text" value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nội dung câu hỏi"
            disabled={saving} className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Loại câu hỏi</label>
          <select
            value={
              type === "true_false" && !initial
                ? "single_choice"
                : type
            }
            onChange={(e) => setType(e.target.value as QuizQuestionType)}
            disabled={saving || !!initial}
            className={inputClass}
          >
            {(Object.keys(QUESTION_TYPE_LABELS) as Array<keyof typeof QUESTION_TYPE_LABELS>).map((t) => (
              <option key={t} value={t}>{QUESTION_TYPE_LABELS[t]}</option>
            ))}
            {initial?.type === "true_false" ? (
              <option value="true_false">Đúng / Sai (legacy — chỉ xem)</option>
            ) : null}
          </select>
        </div>
      </div>

      {showOptions && (
        <div className="mb-3">
          <label className={labelClass}>
            Các lựa chọn {type === "multiple_choice" ? "(tick vào tất cả đáp án đúng)" : "(tick vào đáp án đúng)"}
          </label>
          <div className="space-y-2">
            {options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type={type === "multiple_choice" ? "checkbox" : "radio"}
                  name={`correct-${quizId}`}
                  checked={opt.is_correct}
                  onChange={() => setCorrect(idx)}
                  disabled={saving}
                  className="size-4 shrink-0"
                />
                <input
                  type="text" value={opt.content}
                  onChange={(e) => updateOption(idx, { content: e.target.value })}
                  disabled={saving}
                  placeholder={`Lựa chọn ${idx + 1}`}
                  className={inputClass}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => setOptions((o) => o.filter((_, i) => i !== idx))}
                    disabled={saving}
                    className="shrink-0 text-red hover:text-red/80"
                  >✕</button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setOptions((o) => [...o, emptyOption(o.length)])}
            disabled={saving}
            className="mt-2 text-sm text-primary hover:underline"
          >
            + Thêm lựa chọn
          </button>
        </div>
      )}

      {showAccepted && (
        <div className="mb-3">
          <label className={labelClass}>Đáp án được chấp nhận</label>
          <div className="space-y-2">
            {acceptedAnswers.map((ans, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text" value={ans.content}
                  onChange={(e) =>
                    setAcceptedAnswers((a) =>
                      a.map((x, i) => (i === idx ? { ...x, content: e.target.value } : x))
                    )
                  }
                  placeholder="Đáp án"
                  disabled={saving} className={inputClass}
                />
                <label className="flex shrink-0 items-center gap-1 text-sm text-dark dark:text-white">
                  <input
                    type="checkbox"
                    checked={ans.is_exact}
                    onChange={(e) =>
                      setAcceptedAnswers((a) =>
                        a.map((x, i) => (i === idx ? { ...x, is_exact: e.target.checked } : x))
                      )
                    }
                    disabled={saving}
                    className="size-4"
                  />
                  Chính xác
                </label>
                {acceptedAnswers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setAcceptedAnswers((a) => a.filter((_, i) => i !== idx))}
                    disabled={saving}
                    className="shrink-0 text-red hover:text-red/80"
                  >✕</button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setAcceptedAnswers((a) => [...a, { content: "", is_exact: false }])}
            disabled={saving}
            className="mt-2 text-sm text-primary hover:underline"
          >
            + Thêm đáp án khác
          </button>
        </div>
      )}


      <div className="mb-3">
        <label className={labelClass}>Giải thích đáp án (tuỳ chọn)</label>
        <input
          type="text" value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          placeholder="Hiển thị sau khi học viên nộp bài"
          disabled={saving} className={inputClass}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className={labelClass + " !mb-0"}>Điểm:</label>
          <input
            type="number" min={0} step={0.5}
            value={points}
            onChange={(e) => setPoints(Number(e.target.value))}
            disabled={saving}
            className="w-20 rounded-lg border border-stroke bg-white px-3 py-2 text-sm text-dark outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button" onClick={onCancel} disabled={saving}
            className="rounded-lg border border-stroke px-3 py-1.5 text-sm font-medium text-dark transition hover:bg-gray-2 dark:border-dark-3 dark:text-white dark:hover:bg-dark-3"
          >
            Hủy
          </button>
          <button
            type="button" onClick={handleSave} disabled={saving}
            className="hover:bg-opacity-90 rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-white transition disabled:opacity-70"
          >
            {saving ? "Đang lưu..." : initial ? "Cập nhật" : "Thêm câu hỏi"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── QuizBuilder ──────────────────────────────────────────────────────────────

type QuizBuilderProps = {
  courseId: string;
  lessonId: string;
  existingQuiz?: Quiz | null;
  onCreated?: (quiz: Quiz) => void;
  /** When true, open the add-question form once quiz exists */
  autoOpenAddQuestion?: boolean;
};

export function QuizBuilder({
  courseId,
  lessonId,
  existingQuiz,
  onCreated,
  autoOpenAddQuestion = false,
}: QuizBuilderProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(existingQuiz ?? null);
  const [questions, setQuestions] = useState<QuizQuestion[]>(existingQuiz?.questions ?? []);
  const [creating, setCreating] = useState(!existingQuiz); // show settings form if no quiz yet
  const [editingQId, setEditingQId] = useState<string | null>(null);

  useEffect(() => {
    if (existingQuiz) {
      setQuiz(existingQuiz);
      setQuestions(existingQuiz.questions ?? []);
      setCreating(false);
    }
  }, [existingQuiz]);
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);
  const [initSaving, setInitSaving] = useState(false);

  useEffect(() => {
    if (autoOpenAddQuestion && quiz && !creating) {
      setAddingQuestion(true);
    }
  }, [autoOpenAddQuestion, quiz, creating]);

  // Init form state
  const [initForm, setInitForm] = useState<CreateQuizInput>({
    passing_score: 70,
    max_attempts: 1,
    show_result: true,
    show_explanation: true,
  });

  async function handleInitQuiz() {
    setInitSaving(true);
    const res = await quizClient.createQuiz(courseId, lessonId, initForm);
    setInitSaving(false);
    if (res.error) { toast.error(res.error.message); return; }
    const created = res.data?.data;
    if (created) {
      const fullQuiz: Quiz = {
        id: created.id,
        lessonId,
        title: null,
        description: null,
        passingScore: initForm.passing_score ?? 70,
        timeLimit: initForm.time_limit ?? null,
        maxAttempts: initForm.max_attempts ?? 1,
        shuffleQuestions: false,
        shuffleOptions: false,
        showResult: true,
        showCorrectAnswer: false,
        showExplanation: true,
        availableFrom: null,
        availableUntil: null,
        questions: [],
      };
      setQuiz(fullQuiz);
      setCreating(false);
      setAddingQuestion(true);
      toast.success("Đã tạo quiz");
      if (onCreated) onCreated(fullQuiz);
    }
  }

  async function handleDeleteQuestion(questionId: string) {
    const res = await quizClient.deleteQuestion(questionId);
    if (res.error) { toast.error(res.error.message); return; }
    setQuestions((qs) => qs.filter((q) => q.id !== questionId));
    toast.success("Đã xóa câu hỏi");
  }

  async function move(idx: number, dir: -1 | 1) {
    const newQs = [...questions];
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= newQs.length) return;
    [newQs[idx], newQs[targetIdx]] = [newQs[targetIdx], newQs[idx]];
    setQuestions(newQs);
    if (!quiz) return;
    setReordering(true);
    await quizClient.reorderQuestions(quiz.id, newQs.map((q) => q.id));
    setReordering(false);
  }

  async function duplicateQuestion(q: QuizQuestion) {
    if (!quiz) return;
    const input: CreateQuizQuestionInput = {
      type: q.type,
      title: (q.title ?? q.question ?? "") + " (bản sao)",
      ...(q.explanation ? { explanation: q.explanation } : {}),
      points: q.points,
      order: questions.length,
      is_required: q.is_required,
      options: (q.options || q.answers?.map(a => ({ content: a.answer, is_correct: a.isCorrect, order: a.order })))?.map((o) => ({ content: o.content, is_correct: o.is_correct, order: o.order })) ?? [],
      accepted_answers: (q.acceptedAnswers || q.answers?.map(a => ({ content: a.answer, is_exact: true })))?.map((a) => ({ content: a.content, is_exact: a.is_exact })) ?? [],
    };
    const res = await quizClient.createQuestion(quiz.id, input);
    if (res.error) { toast.error(res.error.message); return; }
    if (res.data) {
      setQuestions((qs) => [...qs, res.data!.data]);
      toast.success("Đã nhân bản câu hỏi");
    }
  }

  // ── Create quiz init form ──────────────────────────────────────────────────
  if (creating) {
    return (
      <div className="mt-4 rounded-lg border border-dashed border-blue-400 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-950/20">
        <h5 className="mb-4 text-sm font-semibold text-dark dark:text-white">
          ⚙️ Khởi tạo Quiz
        </h5>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div>
            <label className={labelClass}>Điểm đạt (%)</label>
            <input type="number" min={0} max={100}
              value={initForm.passing_score ?? 70}
              onChange={(e) => setInitForm((f) => ({ ...f, passing_score: Number(e.target.value) }))}
              className={inputClass} disabled={initSaving}
            />
          </div>
          <div>
            <label className={labelClass}>Thời gian (phút)</label>
            <input type="number" min={1}
              value={initForm.time_limit ?? ""}
              onChange={(e) => setInitForm((f) => ({ ...f, time_limit: e.target.value ? Number(e.target.value) : undefined }))}
              placeholder="Không giới hạn"
              className={inputClass} disabled={initSaving}
            />
          </div>
          <div>
            <label className={labelClass}>Số lần làm tối đa</label>
            <input type="number" min={1}
              value={initForm.max_attempts ?? 1}
              onChange={(e) => setInitForm((f) => ({ ...f, max_attempts: Number(e.target.value) }))}
              className={inputClass} disabled={initSaving}
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="button" onClick={handleInitQuiz} disabled={initSaving}
            className="hover:bg-opacity-90 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white transition disabled:opacity-70"
          >
            {initSaving ? "Đang tạo..." : "Tạo Quiz"}
          </button>
        </div>
      </div>
    );
  }

  if (!quiz) return null;

  return (
    <div className="mt-4 rounded-lg border border-dashed border-blue-400 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-950/20">
      <h5 className="mb-4 text-sm font-semibold text-dark dark:text-white">
        🧩 Quản lý Quiz {reordering && <span className="text-xs text-dark-4">(đang lưu thứ tự...)</span>}
      </h5>

      <QuizSettingsForm quizId={quiz.id} initial={quiz} />

      <QuizAiGeneratePanel
        quizId={quiz.id}
        onGenerated={(created) => {
          if (created.length === 0) return;
          setQuestions((qs) => [...qs, ...created]);
        }}
      />

      {/* Question list */}
      <div className="mb-3 space-y-3">
        {questions.map((q, idx) => (
          editingQId === q.id ? (
            <QuestionForm
              key={q.id}
              quizId={quiz.id}
              initial={q}
              order={idx}
              onSaved={(updated) => {
                setQuestions((qs) => qs.map((x) => x.id === updated.id ? updated : x));
                setEditingQId(null);
              }}
              onCancel={() => setEditingQId(null)}
            />
          ) : (
            <div key={q.id} className="flex items-start justify-between gap-2 rounded-lg border border-stroke bg-white px-4 py-3 dark:border-dark-3 dark:bg-dark-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-dark dark:text-white">
                  {idx + 1}. {q.title ?? q.question}
                </p>
                <span className="text-xs text-dark-4 dark:text-dark-6">
                  {QUESTION_TYPE_DISPLAY[q.type] ?? q.type} · {q.points} điểm
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button type="button" onClick={() => move(idx, -1)} disabled={idx === 0 || reordering}
                  title="Lên" className="rounded p-1 text-dark-4 hover:bg-gray-2 dark:text-dark-6 dark:hover:bg-dark-3 disabled:opacity-30">↑</button>
                <button type="button" onClick={() => move(idx, 1)} disabled={idx === questions.length - 1 || reordering}
                  title="Xuống" className="rounded p-1 text-dark-4 hover:bg-gray-2 dark:text-dark-6 dark:hover:bg-dark-3 disabled:opacity-30">↓</button>
                <button type="button" onClick={() => duplicateQuestion(q)}
                  title="Nhân bản" className="rounded p-1 text-sm text-dark-4 hover:bg-gray-2 dark:text-dark-6 dark:hover:bg-dark-3">⧉</button>
                <button type="button" onClick={() => setEditingQId(q.id)}
                  className="rounded px-2 py-1 text-sm text-primary hover:bg-gray-2 dark:hover:bg-dark-3">Sửa</button>
                <button type="button" onClick={() => setDeleteTargetId(q.id)}
                  className="rounded px-2 py-1 text-sm text-red hover:bg-gray-2 dark:hover:bg-dark-3">Xóa</button>
              </div>
            </div>
          )
        ))}
      </div>

      {addingQuestion ? (
        <QuestionForm
          quizId={quiz.id}
          order={questions.length}
          onSaved={(q) => {
            setQuestions((qs) => [...qs, q]);
            setAddingQuestion(false);
          }}
          onCancel={() => setAddingQuestion(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setAddingQuestion(true)}
          className="w-full rounded-lg border border-dashed border-primary/50 py-2 text-sm text-primary transition hover:bg-primary/5"
        >
          + Thêm câu hỏi
        </button>
      )}

      {/* Delete confirm dialog */}
      <AlertDialog open={!!deleteTargetId} onOpenChange={(o) => !o && setDeleteTargetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa câu hỏi</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa câu hỏi này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTargetId) handleDeleteQuestion(deleteTargetId);
                setDeleteTargetId(null);
              }}
              className="bg-red text-white hover:bg-red/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
