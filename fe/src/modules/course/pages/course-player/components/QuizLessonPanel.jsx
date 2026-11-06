import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircle2, XCircle, Loader2, ListChecks, RotateCcw, AlertCircle } from 'lucide-react';
import { courseService } from '@/modules/course/services/courseService';
import { toast } from '@/shared/utils/toast';

/**
 * QuizLessonPanel — Bài tập trắc nghiệm của một bài học.
 *
 * Hỗ trợ 5 dạng câu hỏi (khớp BE `quiz_question_type`):
 *  - single_choice : chọn 1 đáp án (radio)
 *  - multiple_choice: chọn nhiều đáp án (checkbox)
 *  - true_false    : Đúng / Sai (radio)
 *  - fill_blank    : điền vào chỗ trống (text)
 *  - short_answer  : trả lời ngắn (text)
 *
 * Học viên phải đạt `passingScore` (%) thì BE mới đánh dấu bài học hoàn thành
 * và mở khoá bài tiếp theo (chặn khoá học ở BE).
 */

const CHOICE_TYPES = ['single_choice', 'multiple_choice', 'true_false'];
const TEXT_TYPES = ['fill_blank', 'short_answer'];

function createEmptyAnswer() {
  return { selectedAnswerId: undefined, selectedAnswerIds: [], textAnswer: '' };
}

function isAnswered(question, answer) {
  if (!answer) return false;
  if (question.type === 'multiple_choice') {
    return Array.isArray(answer.selectedAnswerIds) && answer.selectedAnswerIds.length > 0;
  }
  if (CHOICE_TYPES.includes(question.type)) return Boolean(answer.selectedAnswerId);
  return Boolean(String(answer.textAnswer || '').trim());
}

export default function QuizLessonPanel({ lesson, course, isCompleted, onPassed }) {
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!course?.id || !lesson?.id) return;
      setResult(null);
      setAnswers({});
      setLoading(true);
      const data = await courseService.getLessonQuiz(course.id, lesson.id);
      if (mounted) {
        setQuiz(data);
        // Nếu có bài làm lần trước của học viên, khôi phục lại câu trả lời và kết quả
        if (data?.lastAttempt) {
          const prevAnswers = {};
          (data.lastAttempt.answers ?? []).forEach((item) => {
            prevAnswers[item.questionId] = {
              selectedAnswerId: item.selectedOptionIds?.[0],
              selectedAnswerIds: item.selectedOptionIds ?? [],
              textAnswer: item.textAnswer ?? '',
            };
          });
          setAnswers(prevAnswers);

          // Nếu lượt làm trước đã hoàn thành / nộp xong, khôi phục bảng kết quả
          if (data.lastAttempt.status === 'submitted' || data.lastAttempt.status === 'graded') {
            const mappedResults = (data.questions ?? []).map((q) => {
              const prevAns = (data.lastAttempt.answers ?? []).find((a) => a.questionId === q.id);
              return {
                questionId: q.id,
                question: q.question,
                isCorrect: prevAns?.isCorrect ?? false,
                score: prevAns?.score ?? 0,
                maxScore: q.points ?? 1,
              };
            });

            setResult({
              passed: data.lastAttempt.passed,
              score: data.lastAttempt.score,
              maxScore: data.lastAttempt.maxScore,
              percentage: data.lastAttempt.percentage,
              totalQuestions: data.questions?.length ?? 0,
              correctCount: mappedResults.filter((r) => r.isCorrect).length,
              results: mappedResults,
            });
          }
        }
        setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [course?.id, lesson?.id]);

  // BE đã trả đúng thứ tự (hoặc đã trộn nếu quiz bật shuffleQuestions) → giữ nguyên.
  const questions = useMemo(
    () => (Array.isArray(quiz?.questions) ? quiz.questions : []),
    [quiz],
  );

  const setAnswer = (questionId, patch) =>
    setAnswers((prev) => ({ ...prev, [questionId]: { ...createEmptyAnswer(), ...prev[questionId], ...patch } }));

  const toggleMultiple = (questionId, optionId) =>
    setAnswers((prev) => {
      const current = prev[questionId] ?? createEmptyAnswer();
      const selected = current.selectedAnswerIds ?? [];
      const next = selected.includes(optionId)
        ? selected.filter((id) => id !== optionId)
        : [...selected, optionId];
      return { ...prev, [questionId]: { ...current, selectedAnswerIds: next } };
    });

  const handleSubmit = async () => {
    if (!quiz) return;

    const missing = questions.find((q) => q.isRequired && !isAnswered(q, answers[q.id]));
    if (missing) {
      toast.error('Vui lòng trả lời hết các câu hỏi bắt buộc trước khi nộp bài.');
      return;
    }

    const payload = questions.map((q) => {
      const a = answers[q.id] ?? createEmptyAnswer();
      if (q.type === 'multiple_choice') {
        return { questionId: q.id, selectedAnswerIds: a.selectedAnswerIds ?? [] };
      }
      if (CHOICE_TYPES.includes(q.type)) {
        return { questionId: q.id, selectedAnswerId: a.selectedAnswerId ?? undefined };
      }
      return { questionId: q.id, textAnswer: String(a.textAnswer || '').trim() };
    });

    setSubmitting(true);
    try {
      const data = await courseService.submitQuiz(quiz.id, payload);
      setResult(data);
      if (data?.passed) {
        toast.success(`Chúc mừng! Bạn đã đạt ${Math.round(data.percentage)}% và mở khoá bài tiếp theo.`);
        if (onPassed) onPassed(data);
      } else {
        toast.error(`Chưa đạt (${Math.round(data?.percentage ?? 0)}%). Cần tối thiểu ${quiz.passingScore ?? 70}% để qua bài.`);
      }
    } catch (err) {
      toast.error(err?.message || 'Không nộp được bài. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setResult(null);
    setAnswers({});
  };

  if (loading) {
    return (
      <div className="aspect-video flex flex-col items-center justify-center bg-white rounded-[10px] border border-slate-200">
        <Loader2 size={28} className="animate-spin text-[#1a56db]" />
        <p className="mt-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">Đang tải bài tập...</p>
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="rounded-[10px] border border-slate-200 bg-white p-8 text-center">
        <AlertCircle size={32} className="mx-auto text-amber-400 mb-3" />
        <h3 className="text-base font-bold text-[#273044] mb-1">Bài học này chưa có câu hỏi</h3>
        <p className="text-xs text-slate-500">
          Giảng viên chưa tạo bài tập cho bài học này. Bạn có thể bấm “Hoàn thành và Học bài tiếp”.
        </p>
      </div>
    );
  }

  const resultByQuestion = new Map((result?.results ?? []).map((item) => [item.questionId, item]));

  return (
    <div className="space-y-5">
      {/* Trạng thái đã đạt trước đó */}
      {!result && isCompleted && (
        <div className="flex items-center gap-3 rounded-[10px] border border-emerald-200 bg-emerald-50 p-4">
          <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
          <p className="text-sm font-semibold text-emerald-800">
            Bạn đã hoàn thành bài tập này. Có thể làm lại để cải thiện điểm, hoặc bấm “Học bài tiếp”.
          </p>
        </div>
      )}

      {/* Kết quả sau khi nộp */}
      {result && (
        <div
          className={`rounded-[10px] border p-5 ${
            result.passed ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {result.passed ? (
                <CheckCircle2 size={28} className="text-emerald-600" />
              ) : (
                <XCircle size={28} className="text-amber-600" />
              )}
              <div>
                <p className={`text-base font-bold ${result.passed ? 'text-emerald-800' : 'text-amber-800'}`}>
                  {result.passed ? 'Đạt bài tập' : 'Chưa đạt'}
                </p>
                <p className="text-xs font-medium text-slate-600">
                  {result.correctCount}/{result.totalQuestions} câu đúng · {Math.round(result.percentage)}% ·
                  điểm {result.score}/{result.maxScore} · cần {quiz.passingScore ?? 70}%
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center gap-2 rounded-[8px] border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              <RotateCcw size={14} />
              Làm lại
            </button>
          </div>
        </div>
      )}

      {/* Danh sách câu hỏi */}
      <div className="space-y-4">
        {questions.map((question, index) => {
          const answer = answers[question.id] ?? createEmptyAnswer();
          const graded = resultByQuestion.get(question.id);
          const resultClass =
            graded && (graded.isCorrect ? 'border-emerald-300 bg-emerald-50/40' : 'border-red-200 bg-red-50/40');

          return (
            <div
              key={question.id}
              className={`rounded-[10px] border bg-white p-5 ${resultClass || 'border-slate-200'}`}
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#eaf2fd] text-xs font-bold text-[#1a56db]">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-bold leading-relaxed text-[#273044]">
                      {question.question}
                      {question.isRequired ? <span className="ml-1 text-red-500">*</span> : null}
                    </p>
                    {question.description ? (
                      <p className="mt-1 text-xs text-slate-500">{question.description}</p>
                    ) : null}
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  {question.points} điểm
                </span>
              </div>

              {/* Lựa chọn (radio / checkbox) */}
              {CHOICE_TYPES.includes(question.type) && (
                <div className="space-y-2 pl-9">
                  {(question.answers ?? []).map((option) => {
                    const checked =
                      question.type === 'multiple_choice'
                        ? (answer.selectedAnswerIds ?? []).includes(option.id)
                        : answer.selectedAnswerId === option.id;
                    return (
                      <label
                        key={option.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-[8px] border px-3 py-2 text-sm transition-colors ${
                          checked ? 'border-[#1a56db] bg-[#eaf2fd]/60' : 'border-slate-200 hover:bg-slate-50'
                        } ${result ? 'pointer-events-none' : ''}`}
                      >
                        <input
                          type={question.type === 'multiple_choice' ? 'checkbox' : 'radio'}
                          name={`quiz-${question.id}`}
                          checked={checked}
                          disabled={Boolean(result)}
                          onChange={() =>
                            question.type === 'multiple_choice'
                              ? toggleMultiple(question.id, option.id)
                              : setAnswer(question.id, { selectedAnswerId: option.id })
                          }
                          className="size-4 shrink-0 accent-[#1a56db]"
                        />
                        <span className="text-slate-700">{option.answer}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Điền chỗ trống / trả lời ngắn */}
              {TEXT_TYPES.includes(question.type) && (
                <div className="pl-9">
                  <input
                    type="text"
                    value={answer.textAnswer ?? ''}
                    disabled={Boolean(result)}
                    onChange={(e) => setAnswer(question.id, { textAnswer: e.target.value })}
                    placeholder={
                      question.type === 'fill_blank'
                        ? 'Nhập nội dung còn thiếu...'
                        : 'Nhập câu trả lời ngắn...'
                    }
                    className="w-full rounded-[8px] border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#1a56db] focus:ring-1 focus:ring-[#1a56db] disabled:bg-slate-50"
                  />
                  {question.type === 'fill_blank' && (question.question.match(/_{3,}/g) ?? []).length > 1 ? (
                    <p className="mt-1.5 text-[11px] text-slate-500">
                      Câu này có nhiều chỗ trống — ngăn cách các đáp án bằng dấu <b>|</b> (ví dụ: abc | xyz).
                    </p>
                  ) : null}
                </div>
              )}

              {/* Kết quả từng câu */}
              {graded && (
                <div className="mt-3 space-y-1 pl-9 text-xs">
                  <p className={`flex items-center gap-1.5 font-bold ${graded.isCorrect ? 'text-emerald-700' : 'text-red-600'}`}>
                    {graded.isCorrect ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    {graded.isCorrect ? 'Chính xác' : 'Chưa chính xác'} · {graded.score}/{graded.maxScore} điểm
                  </p>
                  {!graded.isCorrect && Array.isArray(graded.correctAnswers) && graded.correctAnswers.length > 0 ? (
                    <p className="text-slate-600">
                      Đáp án đúng: <b>{graded.correctAnswers.join(' | ')}</b>
                    </p>
                  ) : null}
                  {graded.explanation ? (
                    <p className="text-slate-500">Giải thích: {graded.explanation}</p>
                  ) : null}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Nút nộp bài */}
      {!result && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <ListChecks size={16} className="text-[#1a56db]" />
            <span>
              {questions.length} câu hỏi · cần đạt {quiz.passingScore ?? 70}% để qua bài
            </span>
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-[8px] bg-[#1a56db] px-6 py-2.5 text-xs font-bold text-white transition-all hover:bg-[#1545b3] disabled:opacity-60 sm:text-sm cursor-pointer"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            {submitting ? 'Đang chấm điểm...' : 'Nộp bài'}
          </button>
        </div>
      )}
    </div>
  );
}
