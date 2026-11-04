import type { Metadata } from "next";
import { LegalPageShell } from "@/components/layout/LegalPageShell";

export const metadata: Metadata = {
  title: "Chính sách sử dụng chấp nhận được | GATS Academy",
  description: "Giới hạn sử dụng hệ thống, nội dung và tính năng AI.",
};

const sections = [
  { id: "scope", title: "Phạm vi" },
  { id: "system", title: "An toàn hệ thống" },
  { id: "automation", title: "Tự động hóa và thu thập" },
  { id: "content", title: "Nội dung bị hạn chế" },
  { id: "ai", title: "Sử dụng AI có trách nhiệm" },
  { id: "accounts", title: "Tài khoản và thương mại" },
  { id: "enforcement", title: "Biện pháp xử lý" },
  { id: "reporting", title: "Báo cáo lạm dụng" },
] as const;

const headingClass = "scroll-mt-28 pt-5 text-xl font-bold text-foreground";

export default function AcceptableUsePage() {
  return (
    <LegalPageShell
      title="Chính sách sử dụng chấp nhận được"
      summary="Các giới hạn nhằm bảo vệ người học, nội dung, hạ tầng và tính năng AI khỏi hành vi nguy hiểm hoặc lạm dụng."
      sections={sections}
    >
      <h2 id="scope" className={headingClass}>1. Phạm vi</h2>
      <p>
        Chính sách áp dụng cho website, ứng dụng, API, nội dung khóa học, công cụ
        quản trị và mọi tính năng AI của GATS Academy.
      </p>

      <h2 id="system" className={headingClass}>2. An toàn hệ thống</h2>
      <p>
        Không khai thác lỗ hổng, né xác thực, truy cập dữ liệu không được phép,
        phát tán mã độc, gây quá tải hoặc cản trở hoạt động bình thường. Việc
        kiểm thử bảo mật cần có chấp thuận trước bằng văn bản.
      </p>

      <h2 id="automation" className={headingClass}>3. Tự động hóa và thu thập</h2>
      <p>
        Không dùng bot, crawler, script hoặc công cụ tải hàng loạt để sao chép
        nội dung, tạo tài khoản, gửi tin nhắn hoặc gọi API ngoài giao diện và
        giới hạn được cho phép.
      </p>

      <h2 id="content" className={headingClass}>4. Nội dung bị hạn chế</h2>
      <p>
        Không tạo hoặc phân phối nội dung lừa đảo, xâm phạm quyền, quấy rối, bóc
        lột trẻ em, kích động bạo lực, tiết lộ dữ liệu cá nhân hoặc hỗ trợ hành
        vi trái pháp luật.
      </p>

      <h2 id="ai" className={headingClass}>5. Sử dụng AI có trách nhiệm</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>Không nhập bí mật, dữ liệu nhạy cảm hoặc nội dung không có quyền sử dụng.</li>
        <li>Không dùng kết quả AI để mạo danh, lừa đảo hoặc ra quyết định rủi ro cao mà không kiểm chứng.</li>
        <li>Không cố vượt qua bộ lọc an toàn hoặc khai thác mô hình/hệ thống.</li>
        <li>Người dùng chịu trách nhiệm kiểm tra tính chính xác trước khi sử dụng kết quả.</li>
      </ul>

      <h2 id="accounts" className={headingClass}>6. Tài khoản và thương mại</h2>
      <p>
        Không mua bán tài khoản, chia sẻ quyền học, lạm dụng mã giảm giá, tạo
        giao dịch giả, hoàn tiền gian lận hoặc sử dụng nền tảng cho quảng cáo
        hàng loạt khi chưa được phép.
      </p>

      <h2 id="enforcement" className={headingClass}>7. Biện pháp xử lý</h2>
      <p>
        Tùy rủi ro và mức độ, GATS Academy có thể giới hạn tính năng, gỡ nội
        dung, yêu cầu xác minh, đình chỉ tài khoản hoặc bảo toàn nhật ký phục vụ
        điều tra. Biện pháp khẩn cấp có thể được áp dụng trước khi thông báo.
      </p>

      <h2 id="reporting" className={headingClass}>8. Báo cáo lạm dụng</h2>
      <p>
        Báo cáo qua trang Liên hệ, nêu URL, thời điểm và bằng chứng. Không công
        khai dữ liệu nhạy cảm trong báo cáo hoặc tự ý khai thác thêm để chứng minh.
      </p>
    </LegalPageShell>
  );
}
