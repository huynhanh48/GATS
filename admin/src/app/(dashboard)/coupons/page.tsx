import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/Layouts/admin-surface";
import { fetchCoupons } from "./actions";
import { CouponManager } from "./_components/coupon-manager";
import { fetchMembershipPlans } from "../memberships/actions";

export const metadata: Metadata = {
  title: "Mã giảm giá",
};

export default async function CouponsPage() {
  const [coupons, membershipPlans] = await Promise.all([
    fetchCoupons(),
    fetchMembershipPlans(),
  ]);
  const active = coupons.filter((c) => c.isActive).length;
  const totalRedemptions = coupons.reduce((sum, c) => sum + c.usedCount, 0);

  return (
    <div className="space-y-4">
      <AdminPageHeader
        eyebrow="Marketing"
        title="Mã giảm giá"
        description="Tạo và quản lý mã giảm giá áp dụng khi thanh toán khóa học."
        metrics={[
          { label: "Tổng số mã", value: coupons.length, tone: "slate" },
          { label: "Đang hoạt động", value: active, tone: "green" },
          { label: "Lượt đã dùng", value: totalRedemptions, tone: "blue" },
        ]}
      />
      <CouponManager coupons={coupons} membershipPlans={membershipPlans} />
    </div>
  );
}
