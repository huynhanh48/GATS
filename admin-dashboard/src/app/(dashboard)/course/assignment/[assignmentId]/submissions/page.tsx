import type { Metadata } from "next";
import { AdminPageHeader, AdminPanel } from "@/components/Layouts/admin-surface";
import { fetchAssignmentSubmissions } from "../../../actions";
import { AssignmentSubmissionRow } from "./assignment-submission-row";

export const metadata: Metadata = {
  title: "Chấm bài tập",
};

type PageProps = {
  params: Promise<{ assignmentId: string }>;
};

export default async function AssignmentSubmissionsPage({
  params,
}: PageProps) {
  const { assignmentId } = await params;
  const { data: submissions, maxScore } =
    await fetchAssignmentSubmissions(assignmentId);

  const gradedCount = submissions.filter(
    (s) => s.status === "graded" || s.status === "returned",
  ).length;
  const pendingCount = submissions.filter(
    (s) => s.status === "submitted",
  ).length;

  return (
    <div className="space-y-4">
      <AdminPageHeader
        eyebrow="Bài tập"
        title="Hộp thư chấm bài"
        description="Chấm điểm và phản hồi cho bài nộp của học viên."
        metrics={[
          { label: "Tổng bài nộp", value: submissions.length, tone: "blue" },
          { label: "Chờ chấm", value: pendingCount, tone: "orange" },
          { label: "Đã chấm", value: gradedCount, tone: "green" },
          { label: "Điểm tối đa", value: maxScore, tone: "slate" },
        ]}
      />

      <AdminPanel title="Bài nộp" bodyClassName="p-0">
        {submissions.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">Chưa có bài nộp nào.</p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {submissions.map((submission) => (
              <AssignmentSubmissionRow
                key={submission.id}
                assignmentId={assignmentId}
                submission={submission}
                maxScore={maxScore}
              />
            ))}
          </ul>
        )}
      </AdminPanel>
    </div>
  );
}
