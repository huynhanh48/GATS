"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  CheckCircle2,
  Clock3,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { EdubostHeader as Header, EdubostFooter as Footer } from "@/components/edubost/EdubostShell";

type ResultStatus = "paid" | "pending" | "expired" | "failed" | "cancelled";

const STATUS_COPY: Record<
  ResultStatus,
  {
    title: string;
    description: string;
    icon: typeof CheckCircle2;
    tone: string;
  }
> = {
  paid: {
    title: "Thanh toán thành công",
    description:
      "Đơn hàng đã được xác nhận. Khóa học đã được mở trong tài khoản của bạn.",
    icon: CheckCircle2,
    tone: "text-emerald-600",
  },
  pending: {
    title: "Đang chờ thanh toán",
    description:
      "Chúng tôi chưa nhận được chuyển khoản. Vui lòng hoàn tất trong thời hạn QR hoặc kiểm tra lại sau vài phút.",
    icon: Clock3,
    tone: "text-amber-600",
  },
  expired: {
    title: "Mã QR đã hết hạn",
    description:
      "Cửa sổ thanh toán 30 phút đã kết thúc. Đơn chờ đã được hủy — bạn có thể tạo đơn mới từ giỏ hàng.",
    icon: AlertTriangle,
    tone: "text-orange-600",
  },
  failed: {
    title: "Thanh toán không thành công",
    description:
      "Giao dịch chưa hoàn tất. Bạn có thể thử lại hoặc liên hệ hỗ trợ nếu đã chuyển khoản.",
    icon: XCircle,
    tone: "text-destructive",
  },
  cancelled: {
    title: "Đơn hàng đã hủy",
    description: "Đơn hàng này không còn hiệu lực. Bạn có thể đặt lại bất cứ lúc nào.",
    icon: XCircle,
    tone: "text-muted-foreground",
  },
};

function CheckoutResultContent() {
  const searchParams = useSearchParams();
  const raw = (searchParams.get("status") || "pending").toLowerCase();
  const status: ResultStatus = (
    ["paid", "pending", "expired", "failed", "cancelled"] as const
  ).includes(raw as ResultStatus)
    ? (raw as ResultStatus)
    : "pending";
  const orderId = searchParams.get("orderId");
  const copy = STATUS_COPY[status];
  const Icon = copy.icon;

  return (
    <div className="mission-vission-item text-center">
      <div
        className={`mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center ${copy.tone}`}
      >
        <Icon className="w-8 h-8" />
      </div>
      <div className="space-y-2">
        <h1 className="xb-item--title">{copy.title}</h1>
        <p className="text-muted-foreground leading-relaxed">{copy.description}</p>
        {orderId ? (
          <p className="text-xs text-muted-foreground font-mono pt-2">
            Mã đơn: {orderId}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
        {status === "paid" ? (
          <>
            <Link
              href="/profile?tab=courses"
              className="thm-btn"
            >
              Vào học ngay
            </Link>
            <Link
              href="/profile?tab=orders"
              className="thm-btn"
            >
              Xem đơn hàng
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/cart"
              className="thm-btn"
            >
              Quay lại giỏ hàng
            </Link>
            <Link
              href="/contact"
              className="thm-btn"
            >
              Liên hệ hỗ trợ
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function CheckoutResultPage() {
  return (
    <main className="body_wrap">
      <Header />
      <section className="breadcrumb bg_img ul_li" style={{ backgroundImage: "url(/edubost-reference/img/bg/breadcrumb_bg.jpg)" }}><div className="container"><div className="breadcrumb__content text-center"><h1 className="breadcrumb__title">Kết quả thanh toán</h1><p className="breadcrumb__desc">Trạng thái đăng ký chương trình của bạn</p></div></div></section>
      <section className="mission-vission pt-120 pb-120"><div className="container"><div className="row justify-content-center"><div className="col-lg-7">
        <Suspense
          fallback={
            <p className="text-center text-muted-foreground">Đang tải...</p>
          }
        >
          <CheckoutResultContent />
        </Suspense>
      </div></div></div></section>
      <Footer />
    </main>
  );
}
