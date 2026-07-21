import type { Metadata } from "next";
import { LegalPageShell } from "@/components/layout/LegalPageShell";

export const metadata: Metadata = {
  title: "Chính sách bảo mật | GATS Academy",
  description: "Cách GATS Academy thu thập và bảo vệ dữ liệu cá nhân.",
};

export default function PrivacyPage() {
  return (
    <LegalPageShell title="Chính sách bảo mật">
      <p>
        GATS Academy tôn trọng quyền riêng tư của học viên và cam kết bảo vệ
        dữ liệu cá nhân theo mục đích vận hành nền tảng học tập.
      </p>
      <h2 className="text-foreground text-xl font-bold pt-4">1. Dữ liệu thu thập</h2>
      <p>
        Chúng tôi thu thập thông tin bạn cung cấp khi đăng ký (họ tên hiển thị,
        email), lịch sử đơn hàng, tiến độ học tập và dữ liệu kỹ thuật cần thiết
        để vận hành dịch vụ (cookie phiên đăng nhập).
      </p>
      <h2 className="text-foreground text-xl font-bold pt-4">2. Mục đích sử dụng</h2>
      <p>
        Dữ liệu dùng để xác thực tài khoản, xử lý thanh toán, cấp quyền truy cập
        khóa học, gửi thông báo liên quan đến đơn hàng/học tập, và cải thiện
        trải nghiệm sản phẩm.
      </p>
      <h2 className="text-foreground text-xl font-bold pt-4">3. Chia sẻ dữ liệu</h2>
      <p>
        Chúng tôi không bán dữ liệu cá nhân. Dữ liệu có thể được xử lý bởi nhà
        cung cấp hạ tầng (email, lưu trữ, thanh toán) trong phạm vi cần thiết để
        cung cấp dịch vụ.
      </p>
      <h2 className="text-foreground text-xl font-bold pt-4">4. Quyền của bạn</h2>
      <p>
        Bạn có thể yêu cầu xem, cập nhật hoặc xóa thông tin tài khoản bằng cách
        liên hệ qua trang Liên hệ. Một số dữ liệu giao dịch có thể được lưu để
        tuân thủ nghĩa vụ pháp lý.
      </p>
    </LegalPageShell>
  );
}
