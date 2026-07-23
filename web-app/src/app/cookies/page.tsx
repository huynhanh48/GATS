import type { Metadata } from "next";
import { LegalPageShell } from "@/components/layout/LegalPageShell";

export const metadata: Metadata = {
  title: "Chính sách Cookie | GATS Academy",
  description: "Cách GATS Academy sử dụng cookie và lưu trữ cục bộ.",
};

const sections = [
  { id: "definition", title: "Cookie là gì" },
  { id: "essential", title: "Cookie thiết yếu" },
  { id: "preferences", title: "Tùy chọn và lưu trữ cục bộ" },
  { id: "analytics", title: "Đo lường và chẩn đoán" },
  { id: "third-party", title: "Dịch vụ bên thứ ba" },
  { id: "duration", title: "Thời hạn" },
  { id: "controls", title: "Cách kiểm soát" },
  { id: "updates", title: "Thay đổi chính sách" },
] as const;

const headingClass = "scroll-mt-28 pt-5 text-xl font-bold text-foreground";

export default function CookiesPage() {
  return (
    <LegalPageShell
      title="Chính sách Cookie"
      summary="Cookie và lưu trữ cục bộ giúp duy trì phiên đăng nhập, ghi nhớ lựa chọn và vận hành ổn định website GATS Academy."
      sections={sections}
    >
      <h2 id="definition" className={headingClass}>1. Cookie là gì</h2>
      <p>
        Cookie là tệp dữ liệu nhỏ được trình duyệt lưu khi bạn truy cập website.
        Lưu trữ cục bộ có chức năng tương tự nhưng được quản lý trực tiếp trong
        trình duyệt hoặc ứng dụng.
      </p>

      <h2 id="essential" className={headingClass}>2. Cookie thiết yếu</h2>
      <p>
        Cookie phiên được dùng để đăng nhập, bảo vệ yêu cầu, duy trì giỏ hàng và
        phân quyền truy cập. Nếu chặn nhóm này, một số tính năng quan trọng có
        thể không hoạt động.
      </p>

      <h2 id="preferences" className={headingClass}>3. Tùy chọn và lưu trữ cục bộ</h2>
      <p>
        GATS Academy có thể lưu ngôn ngữ, giao diện, lựa chọn hiển thị và trạng
        thái tạm thời nhằm giảm thao tác lặp lại. Không nên lưu mật khẩu hoặc dữ
        liệu ngân hàng trong các vùng lưu trữ này.
      </p>

      <h2 id="analytics" className={headingClass}>4. Đo lường và chẩn đoán</h2>
      <p>
        Nhật ký kỹ thuật và dữ liệu hiệu năng có thể được dùng để phát hiện lỗi,
        ngăn lạm dụng và hiểu cách tính năng được sử dụng. Nếu bổ sung công cụ
        phân tích không thiết yếu, cơ chế thông báo/đồng ý sẽ được cập nhật phù hợp.
      </p>

      <h2 id="third-party" className={headingClass}>5. Dịch vụ bên thứ ba</h2>
      <p>
        Đăng nhập Google, phát video hoặc dịch vụ tích hợp khác có thể đặt cookie
        theo chính sách riêng của họ. GATS Academy chỉ tích hợp trong phạm vi
        cần thiết cho chức năng được người dùng lựa chọn.
      </p>

      <h2 id="duration" className={headingClass}>6. Thời hạn</h2>
      <p>
        Cookie phiên thường hết hạn khi đăng xuất hoặc sau thời hạn bảo mật.
        Cookie tùy chọn có thể tồn tại lâu hơn để ghi nhớ thiết lập và được xóa
        khi hết mục đích hoặc khi bạn xóa dữ liệu trình duyệt.
      </p>

      <h2 id="controls" className={headingClass}>7. Cách kiểm soát</h2>
      <p>
        Bạn có thể xem, chặn hoặc xóa cookie trong cài đặt trình duyệt. Việc xóa
        cookie đăng nhập sẽ đăng xuất tài khoản; chặn cookie thiết yếu có thể
        khiến thanh toán, học tập hoặc quản trị không hoạt động đúng.
      </p>

      <h2 id="updates" className={headingClass}>8. Thay đổi chính sách</h2>
      <p>
        Danh mục cookie sẽ được cập nhật khi nền tảng bổ sung nhà cung cấp hoặc
        mục đích xử lý mới.
      </p>
    </LegalPageShell>
  );
}
