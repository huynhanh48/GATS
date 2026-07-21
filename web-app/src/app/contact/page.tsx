import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageShell } from "@/components/layout/LegalPageShell";

export const metadata: Metadata = {
  title: "Liên hệ | GATS Academy",
  description: "Liên hệ hỗ trợ GATS Academy.",
};

export default function ContactPage() {
  return (
    <LegalPageShell title="Liên hệ">
      <p>
        Đội ngũ GATS Academy sẵn sàng hỗ trợ về tài khoản, thanh toán và nội dung
        khóa học.
      </p>
      <h2 className="text-foreground text-xl font-bold pt-4">Kênh hỗ trợ</h2>
      <ul className="list-disc pl-5 space-y-2">
        <li>
          Email:{" "}
          <a
            href="mailto:support@gatsacademy.com"
            className="text-primary font-semibold hover:underline"
          >
            support@gatsacademy.com
          </a>
        </li>
        <li>
          Form tư vấn / đăng ký quan tâm:{" "}
          <Link href="/#cta" className="text-primary font-semibold hover:underline">
            để lại thông tin trên trang chủ
          </Link>
        </li>
      </ul>
      <h2 className="text-foreground text-xl font-bold pt-4">Thời gian phản hồi</h2>
      <p>
        Chúng tôi thường phản hồi trong vòng 1–2 ngày làm việc. Với sự cố thanh
        toán đang chờ xác nhận, vui lòng kèm mã đơn hàng và thời điểm chuyển khoản.
      </p>
    </LegalPageShell>
  );
}
