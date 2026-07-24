import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHeader, AdminPanel } from "@/components/Layouts/admin-surface";
import { formatVnDateTime } from "@/lib/datetime";
import { fetchUserDetail } from "../actions";
import { UserSecurityActions } from "../user-security-actions";
import { UserRoleEditor } from "../user-role-editor";
import { getAdminSession } from "@/lib/api/server";
import type { AccountRole } from "../actions";
import { MentorCourseEditor } from "../mentor-course-editor";
import { fetchCourses } from "../../course/actions";

export const metadata: Metadata = {
  title: "Chi tiết người dùng",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

function formatDate(value: string | null) {
  return formatVnDateTime(value);
}

function formatMoney(amount: number) {
  return `${amount.toLocaleString("vi-VN")} đ`;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-slate-100 py-3 last:border-0 sm:grid-cols-[140px_1fr] sm:gap-4 dark:border-slate-800">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="text-sm text-slate-900 dark:text-slate-100">{children}</dd>
    </div>
  );
}

export default async function UserDetailPage({ params }: PageProps) {
  const { id: raw } = await params;
  const id = Number(raw);
  if (!Number.isFinite(id) || id <= 0) notFound();

  const detail = await fetchUserDetail(id);
  if (!detail) notFound();
  const session = await getAdminSession();
  const courseList = await fetchCourses(1, 100);

  const {
    user,
    managedCourses,
    recentOrders,
    enrollmentsSummary,
    enrollments,
    auditLogs,
  } = detail;

  return (
    <div className="space-y-4">
      <div className="text-sm text-slate-500">
        <Link href="/users" className="hover:text-[#0070EB] hover:underline">
          ← Người dùng
        </Link>
      </div>

      <AdminPageHeader
        eyebrow="Hệ thống"
        title={user.userName}
        description={user.email}
        metrics={[
          {
            label: "Trạng thái",
            value: user.isLocked
              ? "Khóa"
              : user.verified
                ? "OK"
                : "Chưa XM",
            tone: user.isLocked ? "slate" : user.verified ? "green" : "blue",
          },
          {
            label: "Enrollment",
            value: enrollmentsSummary.active,
            tone: "green",
          },
          {
            label: "Đơn gần đây",
            value: recentOrders.length,
            tone: "slate",
          },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <AdminPanel title="Hồ sơ" bodyClassName="px-4 py-1">
            <dl>
              <Row label="ID">{user.id}</Row>
              <Row label="Username">{user.userName}</Row>
              <Row label="Email">{user.email}</Row>
              <Row label="Loại">{user.type}</Row>
              <Row label="Roles">{user.roles.join(", ") || "—"}</Row>
              <Row label="Verified">{user.verified ? "Có" : "Không"}</Row>
              <Row label="Khóa">{user.isLocked ? "Có" : "Không"}</Row>
              <Row label="Tạo lúc">{formatDate(user.createdAt)}</Row>
            </dl>
          </AdminPanel>

          <AdminPanel title="Đơn hàng gần đây" bodyClassName="p-0 overflow-x-auto">
            {recentOrders.length === 0 ? (
              <div className="p-6 text-sm text-slate-500">Chưa có đơn.</div>
            ) : (
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Thời gian</th>
                    <th className="px-4 py-3">Số tiền</th>
                    <th className="px-4 py-3">TT</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-4 py-3 text-slate-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        {formatMoney(order.totalAmount)}
                      </td>
                      <td className="px-4 py-3">{order.status}</td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/orders/${order.id}`}
                          className="text-[#0070EB] hover:underline"
                        >
                          Xem
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </AdminPanel>

          <AdminPanel title="Enrollment" bodyClassName="p-0 overflow-x-auto">
            <p className="px-4 pt-4 text-sm text-slate-500">
              Active {enrollmentsSummary.active} · Cancelled{" "}
              {enrollmentsSummary.cancelled} · Expired{" "}
              {enrollmentsSummary.expired} · Tổng {enrollmentsSummary.total}
            </p>
            {enrollments.length === 0 ? (
              <p className="p-4 text-sm text-slate-500">Chưa có enrollment.</p>
            ) : (
              <table className="min-w-full text-left text-sm">
                <thead className="mt-2 border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-900/50">
                  <tr>
                    <th className="px-4 py-3">Khóa học</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Tiến độ</th>
                    <th className="px-4 py-3">Hoạt động gần nhất</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {enrollments.slice(0, 20).map((e) => (
                    <tr key={e.id}>
                      <td className="px-4 py-3">
                        {e.courseSlug ? (
                          <Link
                            href={`/course/${e.courseId}`}
                            className="font-medium text-[#0070EB] hover:underline"
                          >
                            {e.courseTitle ?? e.courseId.slice(0, 8) + "…"}
                          </Link>
                        ) : (
                          <span className="font-mono text-xs">
                            {e.courseId.slice(0, 8)}…
                          </span>
                        )}
                        <div className="text-xs text-slate-500">
                          {e.status} · {e.source}
                        </div>
                      </td>
                      <td className="px-4 py-3">{e.status}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                            <div
                              className="h-full rounded-full bg-[#0070EB]"
                              style={{ width: `${Math.min(100, e.percent)}%` }}
                            />
                          </div>
                          <span className="whitespace-nowrap text-xs text-slate-500">
                            {e.completedLessons}/{e.totalLessons} ({e.percent}%)
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                        {formatDate(e.lastActivityAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </AdminPanel>
        </div>

        <div className="space-y-4">
          <AdminPanel title="Phân quyền" bodyClassName="p-4">
            <UserRoleEditor
              userId={user.id}
              currentRole={
                (["admin", "user"].find((role) =>
                  user.globalRoles.includes(role),
                ) ?? "user") as AccountRole
              }
              isSelf={session?.user.id === user.id}
            />
          </AdminPanel>

          <AdminPanel title="Phân công mentor" bodyClassName="p-4">
            <MentorCourseEditor
              userId={user.id}
              courses={courseList.data.map((course) => ({
                id: course.id,
                title: course.title,
                status: course.status,
              }))}
              managedCourses={managedCourses}
            />
          </AdminPanel>

          <AdminPanel title="Bảo mật" bodyClassName="p-4">
            <UserSecurityActions
              userId={user.id}
              verified={user.verified}
              isLocked={user.isLocked}
              hasPassword={user.hasPassword}
            />
          </AdminPanel>

          <AdminPanel title="Nhật ký" bodyClassName="p-4">
            {auditLogs.length === 0 ? (
              <p className="text-sm text-slate-500">Chưa có audit log.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {auditLogs.map((log) => (
                  <li
                    key={log.id}
                    className="border-b border-slate-100 pb-2 last:border-0 dark:border-slate-800"
                  >
                    <div className="font-medium">{log.action}</div>
                    <div className="text-xs text-slate-500">
                      {formatDate(log.createdAt)}
                      {log.actorUserId ? ` · actor #${log.actorUserId}` : ""}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </AdminPanel>
        </div>
      </div>
    </div>
  );
}
