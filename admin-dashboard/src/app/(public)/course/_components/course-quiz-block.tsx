"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const QUIZ = {
  title: "Quiz nhanh: Prompt Engineering",
  question: "Cách nào giúp prompt cho kết quả ổn định hơn?",
  options: [
    { id: "a", label: "Viết câu càng ngắn càng tốt, không thêm ngữ cảnh" },
    { id: "b", label: "Nêu vai trò, mục tiêu, ràng buộc và ví dụ đầu ra" },
    { id: "c", label: "Chỉ dùng một từ khóa duy nhất" },
    { id: "d", label: "Luôn yêu cầu model trả lời bằng emoji" },
  ],
  correctId: "b",
};

export function CourseQuizBlock() {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const isCorrect = submitted && selected === QUIZ.correctId;

  return (
    <section
      id="quiz"
      className="border-t border-slate-200 px-6 py-20 dark:border-slate-800 md:px-8 md:py-24"
    >
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold tracking-[0.2em] text-[#f97316] uppercase">
          Quiz
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 dark:text-white md:text-4xl">
          {QUIZ.title}
        </h2>
        <p className="mt-3 text-base leading-relaxed text-slate-600 dark:text-slate-400">
          Thử một câu hỏi mẫu trước khi bắt đầu học.
        </p>

        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111] md:p-8">
          <p className="text-lg leading-relaxed font-medium text-slate-950 dark:text-white">
            {QUIZ.question}
          </p>

          <div className="mt-6 flex flex-col gap-3">
            {QUIZ.options.map((opt) => {
              const isSelected = selected === opt.id;
              const showCorrect = submitted && opt.id === QUIZ.correctId;
              const showWrong =
                submitted && isSelected && opt.id !== QUIZ.correctId;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    if (submitted) return;
                    setSelected(opt.id);
                  }}
                  className={cn(
                    "cursor-pointer rounded-full border px-5 py-3 text-left text-sm transition-all duration-200",
                    isSelected && !submitted
                      ? "border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-black"
                      : "border-slate-200 text-slate-700 hover:border-slate-950 hover:text-slate-950 dark:border-slate-700 dark:text-slate-300 dark:hover:border-white dark:hover:text-white",
                    showCorrect && "border-[#f97316] bg-[#f97316]/15 text-[#ffedd5]",
                    showWrong && "border-red-500/60 bg-red-500/10 text-red-200",
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {!submitted ? (
              <button
                type="button"
                disabled={!selected}
                onClick={() => setSubmitted(true)}
                className="cursor-pointer rounded-full bg-[#f97316] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#ea580c] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Kiểm tra đáp án
              </button>
            ) : (
              <>
                <p
                  className={cn(
                    "text-sm font-medium",
                    isCorrect ? "text-[#f97316]" : "text-red-300",
                  )}
                >
                  {isCorrect
                    ? "Chính xác. Prompt rõ vai trò và ràng buộc sẽ ổn định hơn."
                    : "Chưa đúng. Hãy thử chọn lại."}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelected(null);
                    setSubmitted(false);
                  }}
                  className="cursor-pointer rounded-full border border-slate-300 px-5 py-2 text-sm text-slate-700 transition hover:border-slate-950 hover:text-slate-950 dark:border-slate-700 dark:text-slate-300 dark:hover:border-white dark:hover:text-white"
                >
                  Làm lại
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
