import type { Metadata } from "next";
import { LegalPageShell } from "@/components/layout/LegalPageShell";

export const metadata: Metadata = {
  title: "Chính sách hoàn tiền | GATS Academy",
  description: "Điều kiện hoàn tiền khóa học GATS Academy.",
};

export default function RefundPage() {
  return (
    <LegalPageShell title="Chính sách hoàn tiền">
      <p>
        GATS Academy muốn bạn hài lòng với trải nghiệm học tập. Chính sách dưới
        đây áp dụng cho các khóa học trả phí mua trên nền tảng.
      </p>
      <h2 className="text-foreground text-xl font-bold pt-4">1. Điều kiện hoàn</h2>
      <p>
        Bạn có thể gửi yêu cầu hoàn tiền trong vòng 7 ngày kể từ khi thanh toán
        thành công nếu chưa hoàn thành quá 20% nội dung khóa học (theo tiến độ
        hệ thống ghi nhận).
      </p>
      <h2 className="text-foreground text-xl font-bold pt-4">2. Không áp dụng</h2>
      <p>
        Không hoàn tiền cho đơn đã hết hạn thanh toán (chưa chuyển khoản), khóa
        miễn phí, hoặc trường hợp vi phạm điều khoản sử dụng (chia sẻ tài khoản,
        phân phối lại nội dung).
      </p>
      <h2 className="text-foreground text-xl font-bold pt-4">3. Quy trình</h2>
      <p>
        Gửi yêu cầu qua trang Liên hệ kèm mã đơn hàng. Sau khi được duyệt, quyền
        truy cập khóa học sẽ bị thu hồi và hoàn tiền theo phương thức đã thanh
        toán trong vòng 7–14 ngày làm việc.
      </p>
    </LegalPageShell>
  );
}
