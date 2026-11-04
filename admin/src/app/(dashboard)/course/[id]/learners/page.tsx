import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHeader, AdminPanel } from "@/components/Layouts/admin-surface";
import { formatVnDateTime } from "@/lib/datetime";
import { fetchCourseLearners, getCourseDetail } from "../../actions";

export const metadata: Metadata = {
  title: "Học viên khóa học",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

function formatDate(value: string | null) {
  return formatVnDateTime(value);
}

const STATUS_LABELS: Record<string, string> = {
  active: "Đang học",
  cancelled: "Đã hủy",
  expired: "Hết hạn",
};

export default async function CourseLearnersPage({ params }: PageProps) {
  const { id } = await params;
  const course = await getCourseDetail(id);
  if (!course) notFound();

  const { data: learners, totalLessons } = await fetchCourseLearners(id);

  return (
    <div className="space-y-4">
      <div className="text-sm text-slate-500">
        <Link
          href={`/course/${id}`}
          className="hover:text-[#0070EB] hover:underline"
        >
          ← {course.title}
        </Link>
      </div>

      <AdminPageHeader
        eyebrow="Học viên"
        title={course.title}
        description={`${totalLessons} bài học · ${learners.length} học viên đã đăng ký`}
        metrics={[
          {
            label: "Học viên",
            value: learners.length,
            tone: "blue",
          },
          {
            label: "Hoàn thành 100%",
            value: learners.filter((l) => l.percent >= 100).length,
            tone: "green",
          },
          {
            label: "Chưa bắt đầu",
            value: learners.filter((l) => l.completedLessons === 0).length,
            tone: "slate",
          },
        ]}
        actions={
          <a
            href={`/api/be/courses/${id}/enrollments/learners/export.csv`}
            className="inline-flex rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Export CSV
          </a>
        }
      />

      <AdminPanel title="Danh sách học viên" bodyClassName="p-0 overflow-x-auto">
        {learners.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">
            Chưa có học viên đăng ký khóa học này.
          </p>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-900/50">
              <tr>
                <th className="px-4 py-3">Học viên</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Tiến độ</th>
                <th className="px-4 py-3">Hoạt động gần nhất</th>
                <th className="px-4 py-3">Đăng ký lúc</th>
                <th className="px-4 py-3">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {learners.map((learner) => (
                <tr key={learner.enrollmentId}>
                  <td className="px-4 py-3">
                    <Link
                      href={`/users/${learner.userId}`}
                      className="font-medium text-[#0070EB] hover:underline"
                    >
                      {learner.userName ?? `#${learner.userId}`}
                    </Link>
                    <div className="text-xs text-slate-500">
                      {learner.email ?? "—"}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {STATUS_LABELS[learner.status] ?? learner.status}
                    <div className="text-xs text-slate-500">
                      {learner.source}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full bg-[#0070EB]"
                          style={{
                            width: `${Math.min(100, learner.percent)}%`,
                          }}
                        />
                      </div>
                      <span className="whitespace-nowrap text-xs text-slate-500">
                        {learner.completedLessons}/{learner.totalLessons} (
                        {learner.percent}%)
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                    {formatDate(learner.lastActivityAt)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                    {formatDate(learner.enrolledAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <Link
                        href={`/course/${id}/learners/${learner.userId}`}
                        className="text-sm font-medium text-[#0070EB] hover:underline"
                      >
                        Lịch sử & AI coach
                      </Link>
                      {learner.status === "active" ? (
                        <Link
                          href={`/certificates?issueUser=${learner.userId}&issueCourse=${id}`}
                          className="text-sm font-medium text-slate-600 hover:text-[#0070EB] hover:underline dark:text-slate-300"
                        >
                          Cấp chứng chỉ
                        </Link>
                      ) : null}
                    </div>
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
