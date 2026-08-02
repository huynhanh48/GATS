import type { Metadata } from "next";
import { LegalPageShell } from "@/components/layout/LegalPageShell";

export const metadata: Metadata = {
  title: "Chính sách thanh toán | GATS Academy",
  description: "Quy trình đặt hàng, chuyển khoản và đối soát GATS Academy.",
};

const sections = [
  { id: "prices", title: "Giá và đơn vị tiền tệ" },
  { id: "orders", title: "Tạo đơn hàng" },
  { id: "bank-transfer", title: "Chuyển khoản ngân hàng" },
  { id: "matching", title: "Đối soát thanh toán" },
  { id: "mismatch", title: "Sai nội dung hoặc số tiền" },
  { id: "duplicate", title: "Thanh toán trùng" },
  { id: "access", title: "Cấp quyền truy cập" },
  { id: "security", title: "An toàn thanh toán" },
  { id: "support", title: "Tra soát và hỗ trợ" },
] as const;

const headingClass = "scroll-mt-28 pt-6 text-2xl font-bold text-foreground";

export default function PaymentPolicyPage() {
  return (
    <LegalPageShell
      title="Chính sách thanh toán"
      summary="Chính sách mô tả cách tạo đơn, chuyển khoản, đối soát qua thông báo giao dịch và cấp quyền truy cập khóa học."
      sections={sections}
    >
      <div className="space-y-5 text-[1.6rem] leading-8">
      <p>
        Chính sách này giúp người dùng hiểu rõ từng bước từ khi chọn khóa học,
        tạo đơn hàng, thực hiện chuyển khoản đến khi hệ thống ghi nhận thanh toán
        và mở quyền học. Người dùng nên đọc kỹ thông tin hiển thị tại trang thanh
        toán và chỉ sử dụng tài khoản nhận tiền chính thức của GATS Academy.
      </p>

      <h2 id="prices" className={headingClass}>1. Giá và đơn vị tiền tệ</h2>
      <p>
        Giá hiển thị tại bước thanh toán là giá áp dụng cho đơn hàng tại thời
        điểm tạo, tính bằng đồng Việt Nam, sau khi áp dụng khuyến mãi hợp lệ.
      </p>

      <h2 id="orders" className={headingClass}>2. Tạo đơn hàng</h2>
      <p>
        Mỗi đơn có mã riêng, số tiền và thời hạn thanh toán. Đơn chờ quá thời
        hạn hiển thị có thể bị hủy tự động; không chuyển tiền theo thông tin của
        đơn đã hết hạn.
      </p>
      <p>
        Việc thêm hoặc loại bỏ khóa học, áp dụng coupon hay thay đổi chương trình
        ưu đãi có thể làm tổng tiền thay đổi. Nếu thông tin đơn không còn đúng với
        nhu cầu, hãy tạo đơn mới thay vì tự điều chỉnh số tiền hoặc nội dung chuyển khoản.
      </p>

      <h2 id="bank-transfer" className={headingClass}>3. Chuyển khoản ngân hàng</h2>
      <p>
        Chuyển đúng số tiền, tài khoản nhận và nội dung được hiển thị. Người dùng
        chịu trách nhiệm kiểm tra thông tin trước khi xác nhận tại ứng dụng ngân hàng.
      </p>

      <h2 id="matching" className={headingClass}>4. Đối soát thanh toán</h2>
      <p>
        Hệ thống có thể nhận thông báo giao dịch từ dịch vụ đối soát như SePay.
        Đơn chỉ chuyển sang thành công khi mã tham chiếu, số tiền và trạng thái
        giao dịch đáp ứng quy tắc đối soát.
      </p>
      <p>
        Thời gian cập nhật thường phụ thuộc tốc độ xử lý của ngân hàng và nhà cung
        cấp đối soát. Trong thời gian chờ, người dùng không nên chuyển khoản lần hai.
        Nếu tài khoản đã bị trừ tiền nhưng trạng thái chưa đổi, hãy lưu lại biên nhận
        và chờ một khoảng thời gian hợp lý trước khi gửi yêu cầu hỗ trợ.
      </p>

      <h2 id="mismatch" className={headingClass}>5. Sai nội dung hoặc số tiền</h2>
      <p>
        Giao dịch sai nội dung, thiếu/thừa tiền hoặc thực hiện sau khi đơn hết
        hạn có thể cần kiểm tra thủ công. Hãy gửi mã đơn, thời điểm, số tiền và
        chứng từ đã che thông tin nhạy cảm qua kênh hỗ trợ.
      </p>

      <h2 id="duplicate" className={headingClass}>6. Thanh toán trùng</h2>
      <p>
        Nếu cùng một đơn hoặc khóa học được thanh toán nhiều lần, GATS Academy
        sẽ xác minh các giao dịch và hướng dẫn hoàn phần trùng về tài khoản phù hợp.
      </p>

      <h2 id="access" className={headingClass}>7. Cấp quyền truy cập</h2>
      <p>
        Quyền học được cấp sau khi thanh toán được xác nhận. Nếu tiền đã trừ
        nhưng đơn chưa cập nhật sau khoảng thời gian hợp lý, không chuyển thêm
        lần nữa; hãy gửi yêu cầu tra soát.
      </p>

      <h2 id="security" className={headingClass}>8. An toàn thanh toán</h2>
      <p>
        GATS Academy không yêu cầu mật khẩu ngân hàng, mã OTP hoặc mã PIN. Không
        chuyển khoản đến tài khoản được gửi qua tin nhắn cá nhân ngoài thông tin
        hiển thị trong quy trình thanh toán chính thức.
      </p>

      <h2 id="support" className={headingClass}>9. Tra soát và hỗ trợ</h2>
      <p>
        Khi cần hỗ trợ, cung cấp email tài khoản và mã đơn hàng. Thời gian tra
        soát phụ thuộc ngân hàng, dịch vụ đối soát và mức độ đầy đủ của chứng từ.
      </p>
      <p>
        Chứng từ nên thể hiện thời gian, số tiền, tài khoản nhận và mã giao dịch;
        người dùng cần che số dư, mã OTP và các thông tin không liên quan. Kết quả
        tra soát sẽ được gửi qua kênh liên hệ gắn với tài khoản nhằm hạn chế giả mạo.
      </p>
      </div>
    </LegalPageShell>
  );
}
