import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/Layouts/admin-surface";
import { fetchMembershipPlans, fetchMemberships } from "./actions";
import { MembershipManager } from "./membership-manager";

export const metadata: Metadata = { title: "Quản lý Membership" };

export default async function MembershipsPage() {
  const [plans, memberships] = await Promise.all([fetchMembershipPlans(), fetchMemberships()]);
  const active = memberships.filter((item) => item.status === "active").length;
  const expiring = memberships.filter((item) => {
    if (item.status !== "active" || !item.currentPeriodEnd) return false;
    const remaining = new Date(item.currentPeriodEnd).getTime() - Date.now();
    return remaining > 0 && remaining <= 7 * 86400000;
  }).length;

  return (
    <div className="space-y-4">
      <AdminPageHeader
        eyebrow="Doanh thu định kỳ"
        title="Membership"
        description="Quản lý giá, quyền lợi, trạng thái gói và cấp membership trực tiếp cho người dùng."
        metrics={[
          { label: "Gói đang bán", value: plans.filter((p) => p.isActive).length, tone: "blue" },
          { label: "Hội viên hoạt động", value: active, tone: "green" },
          { label: "Sắp hết hạn (7 ngày)", value: expiring, tone: "orange" },
          { label: "Tổng bản ghi", value: memberships.length, tone: "slate" },
        ]}
      />
      <MembershipManager plans={plans} memberships={memberships} />
    </div>
  );
}
