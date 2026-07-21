import type { Metadata } from "next";
import { LegalPageShell } from "@/components/layout/LegalPageShell";

export const metadata: Metadata = {
  title: "Điều khoản dịch vụ | GATS Academy",
  description: "Điều khoản sử dụng nền tảng GATS Academy.",
};

export default function TermsPage() {
  return (
    <LegalPageShell title="Điều khoản dịch vụ">
      <p>
        Bằng việc tạo tài khoản hoặc mua khóa học trên GATS Academy, bạn đồng ý
        tuân thủ các điều khoản dưới đây.
      </p>
      <h2 className="text-foreground text-xl font-bold pt-4">1. Tài khoản</h2>
      <p>
        Bạn chịu trách nhiệm bảo mật thông tin đăng nhập và mọi hoạt động diễn
        ra trên tài khoản của mình. Thông tin đăng ký phải chính xác và cập nhật.
      </p>
      <h2 className="text-foreground text-xl font-bold pt-4">2. Nội dung khóa học</h2>
      <p>
        Nội dung khóa học (video, tài liệu, bài tập) chỉ dành cho mục đích học
        tập cá nhân. Nghiêm cấm sao chép, chia sẻ, phân phối lại hoặc bán lại
        nội dung khi chưa có sự đồng ý bằng văn bản của GATS Academy.
      </p>
      <h2 className="text-foreground text-xl font-bold pt-4">3. Thanh toán</h2>
      <p>
        Đơn hàng chuyển khoản ngân hàng có thời hạn thanh toán 30 phút. Sau khi
        hết hạn, đơn chờ sẽ bị hủy tự động. Quyền truy cập khóa học được mở sau
        khi thanh toán thành công.
      </p>
      <h2 className="text-foreground text-xl font-bold pt-4">4. Thay đổi điều khoản</h2>
      <p>
        GATS Academy có thể cập nhật điều khoản theo thời gian. Phiên bản mới
        có hiệu lực khi được đăng trên trang này.
      </p>
    </LegalPageShell>
  );
}
