import type { Metadata } from "next";
import { LegalPageShell } from "@/components/layout/LegalPageShell";

export const metadata: Metadata = {
  title: "Tiêu chuẩn cộng đồng | GATS Academy",
  description: "Quy tắc dành cho bài viết, bình luận và chat khóa học.",
};

const sections = [
  { id: "purpose", title: "Mục tiêu cộng đồng" },
  { id: "respect", title: "Tôn trọng người khác" },
  { id: "quality", title: "Nội dung hữu ích" },
  { id: "prohibited", title: "Nội dung bị cấm" },
  { id: "copyright", title: "Bản quyền và trích dẫn" },
  { id: "privacy", title: "Quyền riêng tư" },
  { id: "course-chat", title: "Chat khóa học" },
  { id: "moderation", title: "Kiểm duyệt" },
  { id: "reporting", title: "Báo cáo vi phạm" },
] as const;

const headingClass = "scroll-mt-28 pt-5 text-xl font-bold text-foreground";

export default function CommunityGuidelinesPage() {
  return (
    <LegalPageShell
      title="Tiêu chuẩn cộng đồng"
      summary="Các quy tắc giúp bài viết, bình luận và chat khóa học duy trì môi trường học tập an toàn, hữu ích và tôn trọng."
      sections={sections}
    >
      <h2 id="purpose" className={headingClass}>1. Mục tiêu cộng đồng</h2>
      <p>
        Cộng đồng phục vụ trao đổi kiến thức, hỗ trợ học tập, chia sẻ kinh nghiệm
        và phản hồi xây dựng về khóa học.
      </p>

      <h2 id="respect" className={headingClass}>2. Tôn trọng người khác</h2>
      <p>
        Không quấy rối, đe dọa, miệt thị, kỳ thị, xúc phạm hoặc cố ý kích động
        xung đột. Tranh luận ý tưởng, không công kích cá nhân.
      </p>

      <h2 id="quality" className={headingClass}>3. Nội dung hữu ích</h2>
      <p>
        Đăng đúng chủ đề, mô tả rõ câu hỏi, kiểm tra thông tin trước khi chia sẻ
        và tránh lặp bài, spam, tiêu đề gây hiểu nhầm hoặc quảng cáo không liên quan.
      </p>

      <h2 id="prohibited" className={headingClass}>4. Nội dung bị cấm</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>Nội dung trái pháp luật, bạo lực, lừa đảo hoặc hướng dẫn hành vi nguy hiểm.</li>
        <li>Mã độc, liên kết đánh cắp thông tin, spam hoặc thao túng tương tác.</li>
        <li>Đáp án gian lận, mua bán chứng chỉ hoặc nội dung khóa học bị rò rỉ.</li>
        <li>Mạo danh giảng viên, nhân viên, tổ chức hoặc người dùng khác.</li>
      </ul>

      <h2 id="copyright" className={headingClass}>5. Bản quyền và trích dẫn</h2>
      <p>
        Chỉ đăng nội dung bạn có quyền sử dụng. Khi trích dẫn, ghi nguồn phù hợp;
        không tải lại video, tài liệu hoặc nội dung trả phí của GATS Academy.
      </p>

      <h2 id="privacy" className={headingClass}>6. Quyền riêng tư</h2>
      <p>
        Không công khai số điện thoại, địa chỉ, giấy tờ, thông tin tài chính,
        mật khẩu hoặc dữ liệu cá nhân của người khác khi chưa có sự đồng ý.
      </p>

      <h2 id="course-chat" className={headingClass}>7. Chat khóa học</h2>
      <p>
        Chat khóa học dành cho học viên và người hướng dẫn có quyền truy cập.
        Không chuyển tiếp nội dung riêng tư ra ngoài hoặc dùng chat để chào bán,
        tuyển dụng hay liên hệ hàng loạt khi chưa được phép.
      </p>

      <h2 id="moderation" className={headingClass}>8. Kiểm duyệt</h2>
      <p>
        Nội dung có thể bị ẩn, chỉnh trạng thái hoặc xóa; tài khoản có thể bị
        cảnh báo, hạn chế hoặc đình chỉ tùy mức độ, lịch sử và rủi ro. Trường hợp
        nghiêm trọng có thể được chuyển cho cơ quan có thẩm quyền.
      </p>

      <h2 id="reporting" className={headingClass}>9. Báo cáo vi phạm</h2>
      <p>
        Dùng công cụ báo cáo nếu có hoặc gửi liên kết, ảnh chụp và mô tả qua
        trang Liên hệ. Không tổ chức công kích hoặc trả đũa người bị báo cáo.
      </p>
    </LegalPageShell>
  );
}
