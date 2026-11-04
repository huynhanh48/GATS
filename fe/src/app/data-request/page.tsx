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

const headingClass = "scroll-mt-28 pt-6 text-2xl font-bold text-foreground";

export default function DataRequestPage() {
  return (
    <LegalPageShell
      title="Yêu cầu dữ liệu cá nhân"
      summary="Bạn có thể yêu cầu truy cập, chỉnh sửa, hạn chế hoặc xóa dữ liệu liên quan đến tài khoản GATS Academy, tùy giới hạn pháp luật và vận hành."
      sections={sections}
    >
      <div className="space-y-5 text-[1.6rem] leading-8">
      <p>
        GATS Academy cung cấp quy trình tiếp nhận yêu cầu dữ liệu nhằm giúp người
        dùng kiểm soát thông tin cá nhân của mình một cách minh bạch và an toàn.
        Mỗi yêu cầu được xử lý dựa trên loại dữ liệu, mục đích sử dụng, nghĩa vụ lưu
        trữ và khả năng ảnh hưởng đến quyền, lợi ích hợp pháp của các bên liên quan.
      </p>

      <h2 id="requests" className={headingClass}>1. Các yêu cầu được hỗ trợ</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>Xác nhận GATS Academy có đang xử lý dữ liệu của bạn.</li>
        <li>Nhận bản sao hoặc bản tóm tắt dữ liệu có thể cung cấp.</li>
        <li>Sửa thông tin tài khoản không chính xác.</li>
        <li>Rút lại sự đồng ý, hạn chế xử lý hoặc xóa tài khoản/dữ liệu.</li>
      </ul>
      <p>
        Người dùng cũng có thể đề nghị giải thích nguồn thu thập, mục đích xử lý,
        nhóm đơn vị nhận dữ liệu và thời hạn lưu trữ dự kiến. Một số thông tin tổng
        hợp, đã ẩn danh hoặc không còn khả năng liên kết với cá nhân có thể không nằm
        trong phạm vi bản sao dữ liệu cung cấp cho tài khoản.
      </p>

      <h2 id="submission" className={headingClass}>2. Cách gửi yêu cầu</h2>
      <p>
        Gửi qua <Link href="/contact">trang Liên hệ</Link> bằng email đang gắn
        với tài khoản. Nêu loại yêu cầu, phạm vi dữ liệu và thông tin giúp xác
        định tài khoản. Không gửi mật khẩu hoặc mã OTP.
      </p>
      <p>
        Yêu cầu nên ghi rõ nội dung mong muốn, khoảng thời gian, khóa học hoặc giao
        dịch liên quan để việc tìm kiếm dữ liệu chính xác hơn. Nếu yêu cầu thay mặt
        người khác, người gửi cần chứng minh quyền đại diện hợp lệ trước khi GATS
        Academy cung cấp hoặc thay đổi bất kỳ dữ liệu nào.
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
      <p>
        Trong quá trình xử lý, chúng tôi có thể liên hệ để làm rõ phạm vi hoặc yêu
        cầu bổ sung thông tin. Thời gian phản hồi được tính từ khi hoàn tất xác minh
        và nhận đủ dữ liệu cần thiết. Yêu cầu lặp lại, quá rộng hoặc có dấu hiệu lạm
        dụng có thể được đề nghị thu hẹp để tránh ảnh hưởng an toàn hệ thống.
      </p>

      <h2 id="deletion" className={headingClass}>5. Xóa tài khoản</h2>
      <p>
        Xóa tài khoản có thể làm mất quyền truy cập khóa học, tiến độ, chứng chỉ,
        nội dung và lịch sử hoạt động. Trước khi thực hiện, bạn nên tải hoặc lưu
        thông tin cần thiết. Một số thao tác không thể hoàn tác.
      </p>
      <p>
        Sau khi yêu cầu xóa được xác nhận, tài khoản có thể bị khóa trước khi dữ liệu
        được xóa hoặc ẩn danh trong các hệ thống vận hành và bản sao lưu. Nội dung đã
        chia sẻ công khai hoặc nằm trong cuộc trao đổi với người dùng khác có thể cần
        được giữ ở dạng giới hạn để bảo toàn ngữ cảnh và quyền của các bên liên quan.
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
      <p>
        Khi khiếu nại, hãy cung cấp mã yêu cầu trước đó, thời điểm gửi và nội dung
        chưa được giải quyết. GATS Academy sẽ rà soát lại lịch sử xử lý, căn cứ từ
        chối hoặc giới hạn đã áp dụng và phản hồi qua kênh liên hệ đã được xác minh.
      </p>
      </div>
    </LegalPageShell>
  );
}
