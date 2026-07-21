import type { Metadata } from "next";
import { AdminPageHeader, AdminPanel, StatusPill } from "@/components/Layouts/admin-surface";
import { fetchQuizAttempts } from "../../../actions";
import { QuizAttemptRowActions } from "./quiz-attempt-row-actions";

export const metadata: Metadata = {
  title: "Lượt làm bài Quiz",
};

type PageProps = {
  params: Promise<{ quizId: string }>;
};

const STATUS_LABELS: Record<string, string> = {
  in_progress: "Đang làm",
  submitted: "Đã nộp",
  graded: "Đã chấm",
  expired: "Hết giờ",
};

function statusTone(status: string): "green" | "orange" | "blue" | "slate" {
  if (status === "graded") return "green";
  if (status === "submitted") return "blue";
  if (status === "expired") return "slate";
  return "orange";
}

function formatDate(value: string | null) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("vi-VN", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return value;
  }
}

export default async function QuizAttemptsPage({ params }: PageProps) {
  const { quizId } = await params;
  const { data: attempts } = await fetchQuizAttempts(quizId);

  const submittedOrGraded = attempts.filter(
    (a) => a.status === "submitted" || a.status === "graded",
  );
  const passedCount = attempts.filter((a) => a.passed).length;

  return (
    <div className="space-y-4">
      <AdminPageHeader
        eyebrow="Quiz"
        title="Lượt làm bài"
        description="Theo dõi lượt làm bài của học viên và reset khi cần cho làm lại."
        metrics={[
          { label: "Tổng lượt", value: attempts.length, tone: "blue" },
          {
            label: "Đã nộp/chấm",
            value: submittedOrGraded.length,
            tone: "slate",
          },
          { label: "Đạt", value: passedCount, tone: "green" },
        ]}
      />

      <AdminPanel title="Danh sách lượt làm bài" bodyClassName="p-0 overflow-x-auto">
        {attempts.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">Chưa có lượt làm bài nào.</p>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-900/50">
              <tr>
                <th className="px-4 py-3">Học viên</th>
                <th className="px-4 py-3">Lần</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Điểm</th>
                <th className="px-4 py-3">Đạt</th>
                <th className="px-4 py-3">Bắt đầu</th>
                <th className="px-4 py-3">Nộp bài</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {attempts.map((attempt) => (
                <tr key={attempt.id}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      {attempt.userName ?? `#${attempt.userId}`}
                    </div>
                    <div className="text-xs text-slate-500">
                      {attempt.email ?? "—"}
                    </div>
                  </td>
                  <td className="px-4 py-3">{attempt.attemptNumber}</td>
                  <td className="px-4 py-3">
                    <StatusPill tone={statusTone(attempt.status)}>
                      {STATUS_LABELS[attempt.status] ?? attempt.status}
                    </StatusPill>
                  </td>
                  <td className="px-4 py-3">
                    {attempt.score !== null && attempt.maxScore !== null
                      ? `${attempt.score}/${attempt.maxScore} (${attempt.percentage ?? 0}%)`
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {attempt.passed === null ? "—" : attempt.passed ? "Có" : "Không"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                    {formatDate(attempt.startedAt)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                    {formatDate(attempt.submittedAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <QuizAttemptRowActions
                      quizId={quizId}
                      userId={attempt.userId}
                      userLabel={attempt.userName ?? `#${attempt.userId}`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </AdminPanel>
    </div>
  );
}
