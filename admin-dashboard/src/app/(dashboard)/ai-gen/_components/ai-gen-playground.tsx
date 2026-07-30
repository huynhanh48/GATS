"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { quizClient } from "@/services/quiz.client";

type TabKey = "quiz_gen" | "learning_path_v2" | "coach_chat" | "json_inspector";

type SourceMode = "text" | "file_url" | "file";

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100";
const labelClass = "mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400";

export function AiGenPlayground() {
  const [activeTab, setActiveTab] = useState<TabKey>("quiz_gen");
  const [pending, startTransition] = useTransition();

  // Tab 1 State - Quiz Gen
  const [quizId, setQuizId] = useState("");
  const [sourceMode, setSourceMode] = useState<SourceMode>("text");
  const [text, setText] = useState(
    "Lập trình hướng đối tượng (OOP) là một phương pháp luận lập trình dựa trên khái niệm 'đối tượng', có thể chứa dữ liệu dưới dạng các trường (hàm hoặc thuộc tính) và mã dưới dạng các thủ tục (phương thức). 4 trụ cột chính của OOP gồm: Đóng gói (Encapsulation), Kế thừa (Inheritance), Đa hình (Polymorphism) và Trừu tượng (Abstraction).",
  );
  const [fileUrl, setFileUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState("vi");
  const [targetLevel, setTargetLevel] = useState("intermediate");
  const [questionCount, setQuestionCount] = useState(5);
  const [detailLevel, setDetailLevel] = useState("standard");
  const [exerciseTypes, setExerciseTypes] = useState("mcq,true_false,fill_in_blank,short_answer");

  // Tab 2 State - Learning Path v2
  const [domain, setDomain] = useState("lap-trinh-web");
  const [lpMaxLessons, setLpMaxLessons] = useState(1);
  const [lpExercisesPerLesson, setLpExercisesPerLesson] = useState(5);

  // Tab 3 State - Coach Chat
  const [chatPrompt, setChatPrompt] = useState(
    "Học viên hay trả lời sai các câu hỏi liên quan đến Đa hình trong OOP. Hãy đưa ra 3 lời khuyên ngắn gọn để học viên nắm vững khái niệm này.",
  );
  const [chatHistory, setChatHistory] = useState(
    "## Kết quả kiểm tra gần đây\n- Quiz 1: 4/10 điểm (Sai câu: Polymorphism, Method Overriding)\n- Quiz 2: 6/10 điểm",
  );

  // General Results & JSON payload inspector state
  const [lastResponse, setLastResponse] = useState<any>(null);
  const [lastRequestPayload, setLastRequestPayload] = useState<any>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  const [skippedCount, setSkippedCount] = useState<number | null>(null);

  // Handler for Quiz Generation Test
  function handleGenerateQuiz() {
    startTransition(async () => {
      const targetQuizId = quizId.trim() || "test-quiz-preview";
      const form = new FormData();
      form.append("language", language);
      form.append("target_level", targetLevel);
      form.append("question_count", String(questionCount));
      form.append("detail_level", detailLevel);
      form.append("exercise_types", exerciseTypes);
      form.append("apply", quizId.trim() ? "true" : "false");
      form.append("shuffle_options", "true");

      const reqPayloadObj: Record<string, any> = {
        quizId: targetQuizId,
        language,
        target_level: targetLevel,
        question_count: questionCount,
        detail_level: detailLevel,
        exercise_types: exerciseTypes,
        apply: Boolean(quizId.trim()),
      };

      if (sourceMode === "text") {
        if (!text.trim()) {
          toast.error("Vui lòng nhập nội dung text!");
          return;
        }
        form.append("text", text.trim());
        reqPayloadObj.text = text.trim();
      } else if (sourceMode === "file_url") {
        if (!fileUrl.trim()) {
          toast.error("Vui lòng nhập URL file!");
          return;
        }
        form.append("file_url", fileUrl.trim());
        reqPayloadObj.file_url = fileUrl.trim();
      } else {
        if (!file) {
          toast.error("Vui lòng chọn file upload!");
          return;
        }
        form.append("file", file);
        reqPayloadObj.file = file.name;
      }

      setLastRequestPayload(reqPayloadObj);

      try {
        const res = await quizClient.aiGenerate(targetQuizId, form);
        setLastResponse(res);

        if (res.error) {
          toast.error(`Lỗi: ${res.error.message}`);
          return;
        }

        const questions = res.data?.data?.questions ?? [];
        const skipped = res.data?.data?.skipped_count ?? 0;
        setGeneratedQuestions(questions);
        setSkippedCount(skipped);

        toast.success(
          res.data?.message ??
            `Sinh thành công ${questions.length} câu hỏi!${skipped ? ` (Bỏ qua ${skipped})` : ""}`,
        );
      } catch (err: any) {
        toast.error(err?.message || "Đã xảy ra lỗi khi gọi API");
      }
    });
  }

  // Handler for Learning Path v2 simulation
  function handleSimulateLearningPathV2() {
    startTransition(async () => {
      const payload = {
        endpoint: "/course/learning-path/generate",
        method: "POST",
        body: {
          domain,
          language,
          target_level: targetLevel,
          detail_level: detailLevel,
          max_lessons: lpMaxLessons,
          exercises_per_lesson: lpExercisesPerLesson,
          source_type: sourceMode,
        },
      };

      setLastRequestPayload(payload);

      // Simulated structured response matching viava v2 contract
      const mockV2Response = {
        status: 200,
        viava_version: "2.0",
        learning_path: {
          course_title: `Khóa học thử nghiệm: ${domain}`,
          target_level: targetLevel,
          milestones: [
            {
              id: "m1",
              title: "Khái niệm cốt lõi & Cấu trúc cơ bản",
              lessons: [
                {
                  id: "l1",
                  title: "Tổng quan bài giảng AI",
                  summary: "Định nghĩa, nguyên lý hoạt động và các ví dụ thực tế.",
                  estimated_duration_minutes: 15,
                },
              ],
            },
          ],
        },
        exercise_pipeline_ready: true,
        exercise_types_supported: ["mcq", "true-false", "fill-in-blank", "short-answer"],
      };

      setLastResponse(mockV2Response);
      toast.success("Mô phỏng sinh Learning Path v2 thành công!");
    });
  }

  // Handler for AI Coach Chat simulation
  function handleSimulateCoachChat() {
    startTransition(async () => {
      const payload = {
        endpoint: "/course/chat",
        method: "POST",
        body: {
          query: `${chatPrompt}\n\nLịch sử học tập:\n${chatHistory}`,
          domains: [domain],
          language: "vi",
        },
      };

      setLastRequestPayload(payload);

      const mockChatResponse = {
        status: 200,
        viava_version: "2.0",
        answer: `## Gợi ý cải thiện (AI Coach)\n\nDựa trên kết quả quiz của bạn về **Khái niệm OOP**:\n\n1. **Phân biệt Overriding vs Overloading**: Overriding xảy ra ở lớp con cùng chữ ký hàm, Overloading xảy ra trong cùng lớp khác tham số.\n2. **Vẽ sơ đồ Kế thừa**: Hãy thực hành vẽ diagram hình học (Shape -> Circle/Rectangle) để hình dung rõ cách gọi hàm virtual.\n3. **Thực hành viết code**: Tạo 1 ví dụ đơn giản triển khai interface/abstract class để thấy tính đa hình ở runtime.`,
        references: ["Tài liệu Lập trình OOP cơ bản", "Chương 4: Polymorphism in Action"],
      };

      setLastResponse(mockChatResponse);
      toast.success("Mô phỏng AI Coach Chat v2 thành công!");
    });
  }

  return (
    <div className="space-y-6">
      {/* Migration Info Banner */}
      <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 p-5 dark:border-blue-900/50 dark:from-blue-950/30 dark:to-indigo-950/30">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-md bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">
                Viava API v2.0
              </span>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Hệ thống Sinh Nội dung Học tập & Quiz bằng AI
              </h2>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              Hỗ trợ quy trình 2 bước: <code>/learning-path/generate</code> &rarr; <code>/exercises/&#123;type&#125;/generate</code>. Map 4 dạng bài tập: <strong>MCQ, Đúng-Sai, Điền từ, Trả lời ngắn</strong>.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              Active v2 Adapter
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-800">
        {[
          ["quiz_gen", "Sinh Quiz AI (GATS)"],
          ["learning_path_v2", "Lộ trình Viava v2"],
          ["coach_chat", "AI Coach & Chat v2"],
          ["json_inspector", "Payload Inspector"],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key as TabKey)}
            className={`border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === key
                ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab 1: Quiz AI Generation Test */}
      {activeTab === "quiz_gen" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Input Controls */}
          <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-6 dark:border-slate-800 dark:bg-slate-950">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Cấu hình thông số sinh Quiz
            </h3>

            <div>
              <label className={labelClass}>Nguồn dữ liệu vào</label>
              <div className="flex gap-2">
                {[
                  ["text", "Đoạn văn bản"],
                  ["file_url", "URL tài liệu"],
                  ["file", "Upload File"],
                ].map(([mode, label]) => (
                  <button
                    key={mode}
                    type="button"
                    disabled={pending}
                    onClick={() => setSourceMode(mode as SourceMode)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                      sourceMode === mode
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {sourceMode === "text" && (
              <div>
                <label className={labelClass}>Nội dung văn bản (Text)</label>
                <textarea
                  className={`${inputClass} min-h-[140px]`}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Dán nội dung kiến thức để AI phân tích..."
                  disabled={pending}
                />
              </div>
            )}

            {sourceMode === "file_url" && (
              <div>
                <label className={labelClass}>Đường dẫn File (URL)</label>
                <input
                  className={inputClass}
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="https://example.com/document.pdf"
                  disabled={pending}
                />
              </div>
            )}

            {sourceMode === "file" && (
              <div>
                <label className={labelClass}>Tệp tin tải lên</label>
                <input
                  type="file"
                  className={inputClass}
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  disabled={pending}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
                <label className={labelClass}>Chi tiết</label>
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

            <div>
              <label className={labelClass}>Mã Quiz (Quiz ID)</label>
              <input
                className={inputClass}
                value={quizId}
                onChange={(e) => setQuizId(e.target.value)}
                placeholder="Nhập Quiz ID để lưu trực tiếp vào DB, hoặc để trống để chạy Test Preview"
                disabled={pending}
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Nếu để trống, hệ thống sử dụng ID xem trước thử nghiệm.
              </p>
            </div>

            <button
              type="button"
              disabled={pending}
              onClick={handleGenerateQuiz}
              className="mt-2 w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-50"
            >
              {pending ? "Đang gửi yêu cầu sinh AI (1-3 phút)..." : "Chạy thử Sinh Quiz AI"}
            </button>
          </div>

          {/* Results Output */}
          <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-6 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Kết quả Sinh Quiz
              </h3>
              {skippedCount !== null && (
                <span className="rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                  Bỏ qua: {skippedCount} câu
                </span>
              )}
            </div>

            {generatedQuestions.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center text-center text-slate-400">
                <p className="text-sm">Chưa có dữ liệu quiz được sinh.</p>
                <p className="text-xs">Bấm "Chạy thử Sinh Quiz AI" để xem kết quả mẫu hoặc thực hiện request thật.</p>
              </div>
            ) : (
              <div className="max-h-[460px] space-y-3 overflow-y-auto pr-1">
                {generatedQuestions.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    className="rounded-lg border border-slate-200 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-900/50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                        Câu {idx + 1} [{q.question_type || q.type || "MCQ"}]
                      </span>
                      <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {q.points || 1} điểm
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">
                      {q.content || q.question || q.prompt}
                    </p>
                    {q.options && Array.isArray(q.options) && (
                      <div className="mt-2 space-y-1">
                        {q.options.map((opt: any, optIdx: number) => {
                          const isCorrect =
                            opt.is_correct ||
                            q.correct_answer === optIdx ||
                            q.correct_answer === opt.text;
                          return (
                            <div
                              key={optIdx}
                              className={`rounded px-2.5 py-1 text-xs ${
                                isCorrect
                                  ? "bg-emerald-100 font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                                  : "bg-white text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                              }`}
                            >
                              {String.fromCharCode(65 + optIdx)}. {typeof opt === "string" ? opt : opt.text}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {q.explanation && (
                      <p className="mt-2 text-xs italic text-slate-500">
                        Giải thích: {q.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Viava v2 Learning Path Simulation */}
      {activeTab === "learning_path_v2" && (
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Kiểm tra Quy trình 2 bước Viava Course API v2.0
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className={labelClass}>Domain (Bắt buộc v2.0)</label>
              <input
                className={inputClass}
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="Ví dụ: lap-trinh-web, ai-machine-learning"
              />
            </div>
            <div>
              <label className={labelClass}>Số bài học tối đa (max_lessons)</label>
              <input
                type="number"
                min={1}
                max={10}
                className={inputClass}
                value={lpMaxLessons}
                onChange={(e) => setLpMaxLessons(Number(e.target.value) || 1)}
              />
            </div>
            <div>
              <label className={labelClass}>Số bài tập / bài học</label>
              <input
                type="number"
                min={1}
                max={20}
                className={inputClass}
                value={lpExercisesPerLesson}
                onChange={(e) => setLpExercisesPerLesson(Number(e.target.value) || 5)}
              />
            </div>
          </div>

          <button
            type="button"
            disabled={pending}
            onClick={handleSimulateLearningPathV2}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {pending ? "Đang xử lý..." : "Mô phỏng sinh Learning Path v2"}
          </button>
        </div>
      )}

      {/* Tab 3: AI Coach & Chat */}
      {activeTab === "coach_chat" && (
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Thử nghiệm AI Coach Chat (/course/chat)
          </h3>

          <div>
            <label className={labelClass}>Prompt / Câu hỏi tư vấn</label>
            <textarea
              className={`${inputClass} min-h-[80px]`}
              value={chatPrompt}
              onChange={(e) => setChatPrompt(e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>Bối cảnh / Lịch sử học tập (Markdown)</label>
            <textarea
              className={`${inputClass} min-h-[90px] font-mono text-xs`}
              value={chatHistory}
              onChange={(e) => setChatHistory(e.target.value)}
            />
          </div>

          <button
            type="button"
            disabled={pending}
            onClick={handleSimulateCoachChat}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {pending ? "Đang gửi..." : "Gửi yêu cầu tới AI Coach (/course/chat)"}
          </button>
        </div>
      )}

      {/* Tab 4: JSON Payload Inspector */}
      {activeTab === "json_inspector" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Request Payload Sent
            </h4>
            <pre className="max-h-96 overflow-auto rounded-lg bg-slate-900 p-3 font-mono text-xs text-green-400">
              {JSON.stringify(lastRequestPayload || { note: "Chưa có request nào được gửi" }, null, 2)}
            </pre>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Response Payload Received
            </h4>
            <pre className="max-h-96 overflow-auto rounded-lg bg-slate-900 p-3 font-mono text-xs text-blue-400">
              {JSON.stringify(lastResponse || { note: "Chưa nhận response" }, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
