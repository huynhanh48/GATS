import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageShell } from "@/components/layout/LegalPageShell";

export const metadata: Metadata = {
  title: "Chính sách quyền riêng tư | GATS Academy",
  description:
    "Cách GATS Academy thu thập, sử dụng, lưu trữ và bảo vệ dữ liệu cá nhân.",
};

const sections = [
  { id: "scope", title: "Phạm vi áp dụng" },
  { id: "data", title: "Dữ liệu được xử lý" },
  { id: "sources", title: "Nguồn thu thập" },
  { id: "purposes", title: "Mục đích xử lý" },
  { id: "cookies", title: "Cookie và dữ liệu kỹ thuật" },
  { id: "sharing", title: "Chia sẻ với bên thứ ba" },
  { id: "retention", title: "Thời hạn lưu trữ" },
  { id: "security", title: "Bảo mật dữ liệu" },
  { id: "rights", title: "Quyền của người dùng" },
  { id: "children", title: "Dữ liệu trẻ em" },
  { id: "incidents", title: "Sự cố dữ liệu" },
  { id: "updates", title: "Cập nhật chính sách" },
] as const;

const headingClass = "scroll-mt-28 pt-6 text-2xl font-bold text-foreground";

export default function PrivacyPage() {
  return (
    <LegalPageShell
      title="Chính sách quyền riêng tư"
      summary="Tài liệu này giải thích dữ liệu nào được xử lý khi bạn sử dụng GATS Academy, lý do xử lý và cách thực hiện các quyền liên quan đến dữ liệu cá nhân."
      sections={sections}
    >
      <div className="space-y-5 text-[1.6rem] leading-8">
      <p>
        GATS Academy tôn trọng quyền riêng tư và chỉ xử lý dữ liệu trong phạm vi
        cần thiết để cung cấp nền tảng học tập. Chính sách được xây dựng có tham
        chiếu Nghị định 13/2023/NĐ-CP và pháp luật Việt Nam áp dụng.
      </p>
      <p>
        Chúng tôi hướng tới nguyên tắc minh bạch, giới hạn mục đích và giảm thiểu
        dữ liệu: chỉ thu thập thông tin phù hợp với tính năng người dùng lựa chọn,
        hạn chế quyền truy cập nội bộ và không sử dụng dữ liệu cho mục đích không
        tương thích nếu chưa có căn cứ hoặc thông báo cần thiết.
      </p>

      <h2 id="scope" className={headingClass}>1. Phạm vi áp dụng</h2>
      <p>
        Chính sách áp dụng cho website, ứng dụng di động, khu vực quản trị và
        các tính năng học tập, thanh toán, bài viết, bình luận, chat khóa học và
        trợ lý AI do GATS Academy cung cấp. Thông tin pháp nhân/chủ thể chịu
        trách nhiệm xử lý dữ liệu sẽ được bổ sung sau khi được xác minh trước
        khi tài liệu này công bố chính thức.
      </p>

      <h2 id="data" className={headingClass}>2. Dữ liệu được xử lý</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>Thông tin tài khoản: tên hiển thị, email, vai trò và trạng thái xác minh.</li>
        <li>Dữ liệu xác thực: mật khẩu đã băm, phiên đăng nhập và thông tin đăng nhập Google khi bạn lựa chọn.</li>
        <li>Dữ liệu giao dịch: mã đơn, khóa học, số tiền, trạng thái và thông tin đối soát chuyển khoản.</li>
        <li>Dữ liệu học tập: khóa học đã mua, bài học đã xem, bài kiểm tra, bài tập, chứng chỉ và tiến độ.</li>
        <li>Nội dung do người dùng tạo: bài viết, bình luận, tin nhắn, tệp tải lên và phản hồi hỗ trợ.</li>
        <li>Dữ liệu kỹ thuật: địa chỉ IP, loại thiết bị, trình duyệt, nhật ký lỗi và mã yêu cầu.</li>
      </ul>
      <p>
        Tùy cách sử dụng, dữ liệu còn có thể bao gồm ảnh đại diện, ảnh bìa, lựa chọn
        ngôn ngữ, lịch sử hỗ trợ và thông tin thiết bị phục vụ bảo mật phiên đăng nhập.
        GATS Academy không chủ động yêu cầu dữ liệu nhạy cảm không cần thiết cho hoạt
        động đào tạo; người dùng không nên đưa bí mật cá nhân hoặc bí mật kinh doanh
        vào bài đăng, phòng chat hay nội dung gửi tới công cụ AI.
      </p>

      <h2 id="sources" className={headingClass}>3. Nguồn thu thập</h2>
      <p>
        Dữ liệu đến từ thông tin bạn nhập trực tiếp, hoạt động trong nền tảng,
        nhà cung cấp đăng nhập, đơn vị thanh toán/đối soát và các hệ thống kỹ
        thuật cần thiết để vận hành dịch vụ.
      </p>

      <h2 id="purposes" className={headingClass}>4. Mục đích xử lý</h2>
      <p>Dữ liệu có thể được dùng để:</p>
      <ul className="list-disc space-y-2 pl-5">
        <li>Tạo, xác thực, bảo vệ và khôi phục tài khoản.</li>
        <li>Xử lý đơn hàng, đối soát thanh toán và cấp quyền truy cập khóa học.</li>
        <li>Ghi nhận tiến độ, chấm bài, cấp chứng chỉ và cá nhân hóa trải nghiệm.</li>
        <li>Gửi thông báo giao dịch, bảo mật, học tập và hỗ trợ khách hàng.</li>
        <li>Phòng chống gian lận, lạm dụng, chia sẻ tài khoản và tấn công hệ thống.</li>
        <li>Phân tích lỗi, đo hiệu năng và cải thiện sản phẩm.</li>
      </ul>

      <h2 id="cookies" className={headingClass}>5. Cookie và dữ liệu kỹ thuật</h2>
      <p>
        Cookie phiên đăng nhập và lưu trữ cục bộ được dùng để duy trì phiên,
        ngôn ngữ, giao diện và giỏ hàng. Chi tiết được mô tả tại{" "}
        <Link href="/cookies">Chính sách Cookie</Link>.
      </p>

      <h2 id="sharing" className={headingClass}>6. Chia sẻ với bên thứ ba</h2>
      <p>
        GATS Academy không bán dữ liệu cá nhân. Dữ liệu có thể được chia sẻ ở
        mức cần thiết với nhà cung cấp email, đăng nhập, lưu trữ, hạ tầng, phân
        phối video và thanh toán/đối soát. Dữ liệu cũng có thể được cung cấp khi
        có yêu cầu hợp pháp của cơ quan có thẩm quyền.
      </p>

      <h2 id="retention" className={headingClass}>7. Thời hạn lưu trữ</h2>
      <p>
        Dữ liệu được giữ trong thời gian tài khoản hoạt động và khoảng thời gian
        hợp lý sau đó để giải quyết tranh chấp, bảo mật, sao lưu và nghĩa vụ kế
        toán/pháp lý. Dữ liệu không còn cần thiết sẽ được xóa hoặc ẩn danh theo
        quy trình vận hành.
      </p>

      <h2 id="security" className={headingClass}>8. Bảo mật dữ liệu</h2>
      <p>
        Chúng tôi áp dụng kiểm soát truy cập theo vai trò, mật khẩu băm, phiên
        đăng nhập bảo mật, HTTPS trong môi trường production, nhật ký truy cập
        và sao lưu phù hợp. Không hệ thống nào an toàn tuyệt đối; người dùng cần
        bảo mật thiết bị và thông tin đăng nhập của mình.
      </p>
      <p>
        Các biện pháp bảo vệ được xem xét theo mức độ rủi ro và có thể bao gồm giới
        hạn truy cập quản trị, ghi nhận nhật ký, sao lưu, giám sát lỗi và thu hồi phiên
        đăng nhập. Khi sử dụng mạng hoặc thiết bị công cộng, bạn nên đăng xuất sau khi
        hoàn tất và liên hệ hỗ trợ ngay nếu nhận thấy hoạt động không phải do mình thực hiện.
      </p>

      <h2 id="rights" className={headingClass}>9. Quyền của người dùng</h2>
      <p>
        Tùy quy định áp dụng, bạn có thể yêu cầu biết, truy cập, sửa, hạn chế,
        phản đối, rút lại sự đồng ý hoặc xóa dữ liệu. Một số dữ liệu giao dịch
        có thể tiếp tục được lưu khi pháp luật yêu cầu. Gửi yêu cầu tại{" "}
        <Link href="/data-request">trang yêu cầu dữ liệu</Link>.
      </p>
      <p>
        Để bảo vệ chủ tài khoản, chúng tôi có thể yêu cầu xác minh danh tính trước
        khi xử lý. Phản hồi sẽ được thực hiện trong thời gian hợp lý tùy tính chất và
        phạm vi yêu cầu. Nếu chưa thể đáp ứng toàn bộ, GATS Academy sẽ giải thích lý
        do, chẳng hạn nghĩa vụ lưu chứng từ giao dịch, phòng chống gian lận hoặc bảo
        vệ quyền và lợi ích hợp pháp của người khác.
      </p>

      <h2 id="children" className={headingClass}>10. Dữ liệu trẻ em</h2>
      <p>
        Người chưa đủ tuổi tự mình xác lập giao dịch theo pháp luật cần có sự
        đồng ý và giám sát của cha mẹ hoặc người giám hộ. Nếu phát hiện dữ liệu
        trẻ em được cung cấp không phù hợp, vui lòng liên hệ để xử lý.
      </p>

      <h2 id="incidents" className={headingClass}>11. Sự cố dữ liệu</h2>
      <p>
        Khi phát hiện sự cố, GATS Academy sẽ đánh giá phạm vi, hạn chế ảnh
        hưởng, khôi phục hệ thống và thực hiện thông báo cần thiết theo quy định
        áp dụng. Người dùng nên báo ngay các hoạt động đăng nhập bất thường.
      </p>

      <h2 id="updates" className={headingClass}>12. Cập nhật chính sách</h2>
      <p>
        Chính sách có thể được điều chỉnh khi sản phẩm hoặc yêu cầu pháp lý thay
        đổi. Phiên bản và ngày hiệu lực mới sẽ được hiển thị trên trang này;
        thay đổi quan trọng có thể được thông báo trong ứng dụng hoặc qua email.
      </p>
      </div>
    </LegalPageShell>
  );
}
