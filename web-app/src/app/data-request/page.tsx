import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageShell } from "@/components/layout/LegalPageShell";

export const metadata: Metadata = {
  title: "Yêu cầu dữ liệu cá nhân | GATS Academy",
  description: "Hướng dẫn yêu cầu truy cập, chỉnh sửa hoặc xóa dữ liệu.",
};

const sections = [
  { id: "requests", title: "Các yêu cầu được hỗ trợ" },
  { id: "submission", title: "Cách gửi yêu cầu" },
  { id: "verification", title: "Xác minh danh tính" },
  { id: "processing", title: "Quy trình xử lý" },
  { id: "deletion", title: "Xóa tài khoản" },
  { id: "retention", title: "Dữ liệu cần tiếp tục lưu" },
  { id: "withdrawal", title: "Rút lại sự đồng ý" },
  { id: "complaints", title: "Khiếu nại" },
] as const;

const headingClass = "scroll-mt-28 pt-5 text-xl font-bold text-foreground";

export default function DataRequestPage() {
  return (
    <LegalPageShell
      title="Yêu cầu dữ liệu cá nhân"
      summary="Bạn có thể yêu cầu truy cập, chỉnh sửa, hạn chế hoặc xóa dữ liệu liên quan đến tài khoản GATS Academy, tùy giới hạn pháp luật và vận hành."
      sections={sections}
    >
      <h2 id="requests" className={headingClass}>1. Các yêu cầu được hỗ trợ</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>Xác nhận GATS Academy có đang xử lý dữ liệu của bạn.</li>
        <li>Nhận bản sao hoặc bản tóm tắt dữ liệu có thể cung cấp.</li>
        <li>Sửa thông tin tài khoản không chính xác.</li>
        <li>Rút lại sự đồng ý, hạn chế xử lý hoặc xóa tài khoản/dữ liệu.</li>
      </ul>

      <h2 id="submission" className={headingClass}>2. Cách gửi yêu cầu</h2>
      <p>
        Gửi qua <Link href="/contact">trang Liên hệ</Link> bằng email đang gắn
        với tài khoản. Nêu loại yêu cầu, phạm vi dữ liệu và thông tin giúp xác
        định tài khoản. Không gửi mật khẩu hoặc mã OTP.
      </p>

      <h2 id="verification" className={headingClass}>3. Xác minh danh tính</h2>
      <p>
        Để tránh tiết lộ hoặc xóa nhầm dữ liệu, GATS Academy có thể yêu cầu xác
        minh quyền kiểm soát email/tài khoản và thông tin giao dịch liên quan.
        Chỉ cung cấp giấy tờ khi thật sự cần thiết và qua kênh được hướng dẫn.
      </p>

      <h2 id="processing" className={headingClass}>4. Quy trình xử lý</h2>
      <p>
        Yêu cầu sẽ được ghi nhận, xác minh, đánh giá phạm vi và phản hồi trong
        thời hạn hợp lý theo quy định áp dụng. Yêu cầu phức tạp hoặc ảnh hưởng
        quyền của người khác có thể cần thêm thời gian và sẽ được thông báo.
      </p>

      <h2 id="deletion" className={headingClass}>5. Xóa tài khoản</h2>
      <p>
        Xóa tài khoản có thể làm mất quyền truy cập khóa học, tiến độ, chứng chỉ,
        nội dung và lịch sử hoạt động. Trước khi thực hiện, bạn nên tải hoặc lưu
        thông tin cần thiết. Một số thao tác không thể hoàn tác.
      </p>

      <h2 id="retention" className={headingClass}>6. Dữ liệu cần tiếp tục lưu</h2>
      <p>
        Một số dữ liệu đơn hàng, thanh toán, bảo mật, khiếu nại hoặc phòng chống
        gian lận có thể được giữ lại theo nghĩa vụ pháp lý và lợi ích hợp pháp,
        kể cả sau khi tài khoản bị xóa. Dữ liệu sẽ bị giới hạn mục đích sử dụng.
      </p>

      <h2 id="withdrawal" className={headingClass}>7. Rút lại sự đồng ý</h2>
      <p>
        Việc rút lại sự đồng ý không làm mất tính hợp pháp của hoạt động xử lý
        đã thực hiện trước đó. Một số chức năng không thể tiếp tục nếu dữ liệu
        cần thiết cho xác thực hoặc cung cấp dịch vụ không còn được xử lý.
      </p>

      <h2 id="complaints" className={headingClass}>8. Khiếu nại</h2>
      <p>
        Nếu cho rằng yêu cầu chưa được xử lý phù hợp, bạn có thể gửi phản hồi
        kèm mã yêu cầu qua trang Liên hệ hoặc thực hiện quyền khiếu nại đến cơ
        quan có thẩm quyền theo pháp luật Việt Nam.
      </p>
    </LegalPageShell>
  );
}
