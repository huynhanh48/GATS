import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageShell } from "@/components/layout/LegalPageShell";

export const metadata: Metadata = {
  title: "Điều khoản dịch vụ | GATS Academy",
  description:
    "Điều kiện sử dụng tài khoản, khóa học, cộng đồng và tính năng AI trên GATS Academy.",
};

const sections = [
  { id: "acceptance", title: "Chấp thuận điều khoản" },
  { id: "eligibility", title: "Điều kiện sử dụng" },
  { id: "accounts", title: "Tài khoản và bảo mật" },
  { id: "license", title: "Quyền truy cập khóa học" },
  { id: "user-content", title: "Nội dung người dùng" },
  { id: "ai", title: "Tính năng AI" },
  { id: "conduct", title: "Hành vi bị cấm" },
  { id: "payments", title: "Thanh toán và khuyến mãi" },
  { id: "intellectual-property", title: "Sở hữu trí tuệ" },
  { id: "availability", title: "Tính sẵn sàng của dịch vụ" },
  { id: "suspension", title: "Đình chỉ và chấm dứt" },
  { id: "liability", title: "Giới hạn trách nhiệm" },
  { id: "disputes", title: "Khiếu nại và tranh chấp" },
  { id: "changes", title: "Thay đổi điều khoản" },
] as const;

const headingClass = "scroll-mt-28 pt-5 text-xl font-bold text-foreground";

export default function TermsPage() {
  return (
    <LegalPageShell
      title="Điều khoản dịch vụ"
      summary="Các điều khoản điều chỉnh việc tạo tài khoản, mua và học khóa học, sử dụng tính năng cộng đồng, nội dung và công cụ AI của GATS Academy."
      sections={sections}
    >
      <p>
        Vui lòng đọc kỹ trước khi sử dụng dịch vụ. Điều khoản này được áp dụng
        cùng <Link href="/privacy">Chính sách quyền riêng tư</Link>,{" "}
        <Link href="/payment-policy">Chính sách thanh toán</Link>,{" "}
        <Link href="/refund">Chính sách hoàn tiền</Link> và các quy tắc liên quan.
      </p>

      <h2 id="acceptance" className={headingClass}>1. Chấp thuận điều khoản</h2>
      <p>
        Khi tạo tài khoản, chọn đồng ý hoặc tiếp tục sử dụng GATS Academy, bạn
        xác nhận đã đọc và chấp thuận các điều khoản đang có hiệu lực.
      </p>

      <h2 id="eligibility" className={headingClass}>2. Điều kiện sử dụng</h2>
      <p>
        Bạn phải có năng lực giao kết phù hợp theo pháp luật Việt Nam. Người chưa
        đủ tuổi cần sự đồng ý và giám sát của cha mẹ hoặc người giám hộ. Thông
        tin cung cấp phải chính xác và không mạo danh người khác.
      </p>

      <h2 id="accounts" className={headingClass}>3. Tài khoản và bảo mật</h2>
      <p>
        Mỗi tài khoản dành cho một người dùng, trừ khi gói dịch vụ quy định
        khác. Bạn chịu trách nhiệm bảo mật thông tin đăng nhập, thiết bị và mọi
        hoạt động hợp lệ phát sinh từ tài khoản. Hãy báo ngay khi nghi ngờ truy
        cập trái phép.
      </p>

      <h2 id="license" className={headingClass}>4. Quyền truy cập khóa học</h2>
      <p>
        Sau khi thanh toán thành công, bạn nhận quyền truy cập cá nhân, có giới
        hạn, không độc quyền và không được chuyển nhượng đối với khóa học đã
        mua. “Truy cập trọn đời”, nếu được hiển thị, nghĩa là trong thời gian
        khóa học và nền tảng còn được GATS Academy duy trì hợp lý.
      </p>

      <h2 id="user-content" className={headingClass}>5. Nội dung người dùng</h2>
      <p>
        Bạn giữ quyền đối với nội dung hợp pháp do mình tạo. Khi đăng bài, bình
        luận, bài tập hoặc tin nhắn, bạn cho phép GATS Academy lưu trữ, hiển thị
        và xử lý nội dung đó trong phạm vi cung cấp, kiểm duyệt và cải thiện dịch
        vụ. Bạn chịu trách nhiệm về quyền sử dụng nội dung đã đăng.
      </p>

      <h2 id="ai" className={headingClass}>6. Tính năng AI</h2>
      <p>
        Kết quả do AI tạo có thể thiếu chính xác, không đầy đủ hoặc không phù
        hợp với mọi tình huống. Nội dung AI chỉ nhằm hỗ trợ học tập, không thay
        thế tư vấn chuyên môn, pháp lý, y tế, tài chính hoặc quyết định của con
        người. Không nhập bí mật, dữ liệu nhạy cảm hoặc nội dung bạn không có
        quyền xử lý vào công cụ AI.
      </p>

      <h2 id="conduct" className={headingClass}>7. Hành vi bị cấm</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>Chia sẻ, bán, cho thuê tài khoản hoặc vượt qua cơ chế kiểm soát truy cập.</li>
        <li>Sao chép, ghi lại, tải hàng loạt hoặc phân phối trái phép nội dung khóa học.</li>
        <li>Đăng nội dung lừa đảo, quấy rối, vi phạm pháp luật hoặc quyền của người khác.</li>
        <li>Dò quét, tấn công, gây quá tải, tự động thu thập hoặc can thiệp hệ thống.</li>
        <li>Lạm dụng ưu đãi, hoàn tiền, thanh toán hoặc tính năng AI.</li>
      </ul>

      <h2 id="payments" className={headingClass}>8. Thanh toán và khuyến mãi</h2>
      <p>
        Giá, giảm giá và thời hạn thanh toán được hiển thị tại thời điểm đặt
        hàng. Đơn chuyển khoản chỉ được xác nhận sau khi đối soát thành công.
        Mã giảm giá không có giá trị quy đổi thành tiền và có thể kèm điều kiện
        riêng. Xem thêm <Link href="/payment-policy">Chính sách thanh toán</Link>.
      </p>

      <h2 id="intellectual-property" className={headingClass}>9. Sở hữu trí tuệ</h2>
      <p>
        Nền tảng, nhãn hiệu, giao diện, mã nguồn, video, tài liệu, bài tập và nội
        dung do GATS Academy hoặc đối tác cung cấp được bảo vệ theo quyền sở hữu
        trí tuệ áp dụng. Không nội dung nào được xem là chuyển giao quyền sở hữu
        nếu không có thỏa thuận bằng văn bản.
      </p>

      <h2 id="availability" className={headingClass}>10. Tính sẵn sàng của dịch vụ</h2>
      <p>
        Dịch vụ có thể tạm ngừng để bảo trì, nâng cấp, xử lý sự cố hoặc do yếu
        tố ngoài khả năng kiểm soát hợp lý. Chúng tôi cố gắng hạn chế gián đoạn
        nhưng không cam kết hệ thống luôn không có lỗi hoặc luôn hoạt động liên tục.
      </p>

      <h2 id="suspension" className={headingClass}>11. Đình chỉ và chấm dứt</h2>
      <p>
        GATS Academy có thể hạn chế hoặc đình chỉ tài khoản khi có dấu hiệu gian
        lận, rủi ro bảo mật, vi phạm điều khoản hoặc yêu cầu hợp pháp. Khi phù
        hợp, người dùng sẽ được thông báo và có cơ hội giải trình.
      </p>

      <h2 id="liability" className={headingClass}>12. Giới hạn trách nhiệm</h2>
      <p>
        Trong phạm vi pháp luật cho phép, GATS Academy không chịu trách nhiệm
        cho thiệt hại gián tiếp phát sinh từ việc sử dụng sai nội dung, quyết
        định dựa hoàn toàn vào kết quả AI hoặc sự cố từ dịch vụ bên thứ ba.
        Không điều khoản nào loại trừ quyền bắt buộc của người tiêu dùng.
      </p>

      <h2 id="disputes" className={headingClass}>13. Khiếu nại và tranh chấp</h2>
      <p>
        Các bên ưu tiên thương lượng thiện chí. Bạn có thể gửi khiếu nại qua
        trang Liên hệ kèm thông tin tài khoản, mã đơn và bằng chứng liên quan.
        Nếu không giải quyết được, tranh chấp được xử lý theo pháp luật Việt Nam
        tại cơ quan có thẩm quyền.
      </p>

      <h2 id="changes" className={headingClass}>14. Thay đổi điều khoản</h2>
      <p>
        Điều khoản có thể được cập nhật để phản ánh thay đổi sản phẩm hoặc pháp
        luật. Phiên bản mới có hiệu lực từ ngày được ghi trên trang; thay đổi
        quan trọng có thể được thông báo qua email hoặc trong ứng dụng.
      </p>
    </LegalPageShell>
  );
}
