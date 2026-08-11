import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHeader, AdminPanel } from "@/components/Layouts/admin-surface";
import { formatVnDateTime } from "@/lib/datetime";
import {
  fetchLearnerExerciseHistory,
  getCourseDetail,
} from "../../../actions";
import { LearnerAiCoachPanel } from "./_components/learner-ai-coach-panel";

export const metadata: Metadata = {
  title: "Lịch sử làm bài học viên",
};

type PageProps = {
  params: Promise<{ id: string; userId: string }>;
};

export default async function LearnerExerciseHistoryPage({ params }: PageProps) {
  const { id, userId: userIdRaw } = await params;
  const userId = Number(userIdRaw);
  if (!Number.isFinite(userId) || userId <= 0) notFound();

  const course = await getCourseDetail(id);
  if (!course) notFound();

  const history = await fetchLearnerExerciseHistory(id, userId);
  if (!history) notFound();

  return (
    <div className="space-y-4">
      <div className="text-sm text-slate-500">
        <Link
          href={`/course/${id}/learners`}
          className="hover:text-[#0070EB] hover:underline"
        >
          ← Học viên · {course.title}
        </Link>
      </div>

      <AdminPageHeader
        eyebrow="Lịch sử làm bài"
        title={history.user.name ?? `User #${history.user.id}`}
        description={history.user.email ?? "—"}
        metrics={[
          {
            label: "Quiz attempts",
            value: history.summary.quizAttempts,
            tone: "blue",
          },
          {
            label: "Assignment",
            value: history.summary.assignmentSubmissions,
            tone: "slate",
          },
          {
            label: "Quiz TB",
            value:
              history.summary.avgQuizPercentage != null
                ? `${history.summary.avgQuizPercentage}%`
                : "—",
            tone: "green",
          },
        ]}
      />

      <LearnerAiCoachPanel courseId={id} userId={userId} />

      {history.summary.weakLessons.length > 0 ? (
        <AdminPanel title="Lesson yếu">
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-200">
            {history.summary.weakLessons.map((lesson) => (
              <li key={lesson}>{lesson}</li>
            ))}
          </ul>
        </AdminPanel>
      ) : null}

      <AdminPanel title="Chi tiết" bodyClassName="p-0 overflow-x-auto">
        {history.items.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">
            Chưa có lần làm quiz / nộp assignment trong khóa này.
          </p>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-900/50">
              <tr>
                <th className="px-4 py-3">Loại</th>
                <th className="px-4 py-3">Lesson</th>
                <th className="px-4 py-3">Lần</th>
                <th className="px-4 py-3">Điểm</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Thời điểm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {history.items.map((item) => {
                const key =
                  item.kind === "quiz" ? item.attemptId : item.submissionId;
                const pct =
                  item.percentage != null
                    ? `${Math.round(item.percentage)}%`
                    : "—";
                const scoreLabel =
                  item.kind === "quiz"
                    ? `${item.score ?? "—"}/${item.maxScore ?? "—"} (${pct})`
                    : `${item.score ?? "—"}/${item.maxScore} (${pct})`;
                const when =
                  item.kind === "quiz"
                    ? item.submittedAt
                    : item.submittedAt ?? item.gradedAt;

                return (
                  <tr key={key}>
                    <td className="px-4 py-3 font-medium capitalize">
                      {item.kind}
                    </td>
                    <td className="px-4 py-3">
                      {item.lessonTitle ?? item.lessonId}
                      {item.kind === "quiz" && item.wrongQuestions.length > 0 ? (
                        <div className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                          {item.wrongQuestions.length} câu sai
                        </div>
                      ) : null}
                      {item.kind === "assignment" && item.feedback ? (
                        <div className="mt-1 line-clamp-2 text-xs text-slate-500">
                          {item.feedback}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      {item.kind === "quiz"
                        ? item.attemptNumber
                        : item.submissionNumber}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{scoreLabel}</td>
                    <td className="px-4 py-3">
                      {item.status}
                      {item.passed == null
                        ? null
                        : item.passed
                          ? " · Đạt"
                          : " · Chưa đạt"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                      {formatVnDateTime(when)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </AdminPanel>
    </div>
  );
}
