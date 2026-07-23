import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageShell } from "@/components/layout/LegalPageShell";

export const metadata: Metadata = {
  title: "Chính sách hoàn tiền | GATS Academy",
  description:
    "Điều kiện, ngoại lệ và quy trình yêu cầu hoàn tiền khóa học GATS Academy.",
};

const sections = [
  { id: "scope", title: "Phạm vi áp dụng" },
  { id: "eligibility", title: "Điều kiện hoàn tiền" },
  { id: "progress", title: "Cách xác định tiến độ" },
  { id: "exceptions", title: "Trường hợp không áp dụng" },
  { id: "payment-errors", title: "Thanh toán trùng hoặc sai" },
  { id: "promotions", title: "Coupon, combo và ưu đãi" },
  { id: "request", title: "Cách gửi yêu cầu" },
  { id: "review", title: "Thẩm định và thời gian xử lý" },
  { id: "access", title: "Quyền truy cập sau hoàn tiền" },
  { id: "appeal", title: "Khiếu nại quyết định" },
] as const;

const headingClass = "scroll-mt-28 pt-5 text-xl font-bold text-foreground";

export default function RefundPage() {
  return (
    <LegalPageShell
      title="Chính sách hoàn tiền"
      summary="Khóa học trả phí có thể đủ điều kiện hoàn tiền trong 7 ngày kể từ khi thanh toán thành công nếu hệ thống ghi nhận bạn chưa hoàn thành quá 20% nội dung."
      sections={sections}
    >
      <p>
        Chính sách này nhằm cân bằng quyền lợi học viên với việc bảo vệ nội dung
        số khỏi sử dụng và sao chép sau khi mua.
      </p>

      <h2 id="scope" className={headingClass}>1. Phạm vi áp dụng</h2>
      <p>
        Áp dụng cho khóa học trả phí mua trực tiếp trên GATS Academy. Khóa học
        miễn phí, dịch vụ tư vấn riêng, sản phẩm của bên thứ ba hoặc chương trình
        doanh nghiệp có thể có điều kiện khác được thông báo trước khi mua.
      </p>

      <h2 id="eligibility" className={headingClass}>2. Điều kiện hoàn tiền</h2>
      <p>Yêu cầu cần đồng thời đáp ứng:</p>
      <ul className="list-disc space-y-2 pl-5">
        <li>Gửi trong vòng 7 ngày tính từ thời điểm thanh toán được xác nhận.</li>
        <li>Tiến độ không vượt quá 20% tổng nội dung được hệ thống ghi nhận.</li>
        <li>Tài khoản không vi phạm Điều khoản dịch vụ hoặc có dấu hiệu lạm dụng.</li>
        <li>Cung cấp đúng mã đơn hàng và thông tin cần thiết để đối soát.</li>
      </ul>

      <h2 id="progress" className={headingClass}>3. Cách xác định tiến độ</h2>
      <p>
        Tiến độ được tính theo bài học, video, bài đọc, bài kiểm tra và hoạt động
        đã hoàn thành trong hệ thống. Nhật ký truy cập có thể được sử dụng để
        kiểm tra trường hợp tải, xem hoặc hoàn thành nội dung bất thường.
      </p>

      <h2 id="exceptions" className={headingClass}>4. Trường hợp không áp dụng</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>Đơn chưa thanh toán, đã hết hạn hoặc đã bị hủy.</li>
        <li>Yêu cầu quá 7 ngày hoặc tiến độ vượt 20%.</li>
        <li>Khóa học miễn phí, quà tặng hoặc quyền truy cập được cấp thủ công.</li>
        <li>Tài khoản đã chia sẻ, phân phối nội dung hoặc vi phạm bảo mật.</li>
        <li>Yêu cầu lặp lại có dấu hiệu lợi dụng chính sách.</li>
      </ul>

      <h2 id="payment-errors" className={headingClass}>5. Thanh toán trùng hoặc sai</h2>
      <p>
        Khoản chuyển trùng, chuyển sai số tiền, sai nội dung hoặc chuyển sau khi
        đơn hết hạn được xử lý theo đối soát thực tế. Đây có thể được xem là
        hoàn trả giao dịch thay vì hoàn tiền khóa học và không áp dụng ngưỡng
        tiến độ nếu quyền học chưa được sử dụng.
      </p>

      <h2 id="promotions" className={headingClass}>6. Coupon, combo và ưu đãi</h2>
      <p>
        Số tiền hoàn không vượt quá số tiền thực tế đã thanh toán. Coupon không
        được hoàn thành tiền. Với combo hoặc chương trình nhiều khóa học, việc
        hoàn một phần chỉ được thực hiện khi hệ thống và điều kiện ưu đãi cho phép.
      </p>

      <h2 id="request" className={headingClass}>7. Cách gửi yêu cầu</h2>
      <p>
        Gửi yêu cầu qua <Link href="/contact">trang Liên hệ</Link> với email tài
        khoản, mã đơn hàng, tên khóa học, lý do và thông tin tài khoản nhận tiền
        khi cần. Không gửi mật khẩu, mã OTP hoặc thông tin bảo mật ngân hàng.
      </p>

      <h2 id="review" className={headingClass}>8. Thẩm định và thời gian xử lý</h2>
      <p>
        GATS Academy thường phản hồi bước đầu trong 1–2 ngày làm việc. Sau khi
        yêu cầu được duyệt và có đủ dữ liệu đối soát, khoản hoàn dự kiến được xử
        lý trong 7–14 ngày làm việc. Thời gian tiền về phụ thuộc ngân hàng và
        phương thức thanh toán.
      </p>

      <h2 id="access" className={headingClass}>9. Quyền truy cập sau hoàn tiền</h2>
      <p>
        Khi hoàn tiền được phê duyệt, quyền truy cập khóa học, tiến độ liên quan
        và các quyền lợi đi kèm có thể bị thu hồi. Chứng chỉ đã cấp từ giao dịch
        được hoàn có thể bị hủy hiệu lực.
      </p>

      <h2 id="appeal" className={headingClass}>10. Khiếu nại quyết định</h2>
      <p>
        Nếu không đồng ý với kết quả, bạn có thể phản hồi trong vòng 7 ngày kể
        từ khi nhận thông báo và cung cấp bằng chứng bổ sung. GATS Academy sẽ
        xem xét lại trên cơ sở dữ liệu giao dịch và tiến độ hệ thống.
      </p>
    </LegalPageShell>
  );
}
