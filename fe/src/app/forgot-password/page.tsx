"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { EdubostHeader as Header, EdubostFooter as Footer } from "@/components/edubost/EdubostShell";
import { forgotPasswordRequest } from "@/services/auth.service";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Vui lòng nhập email");
      return;
    }
    setSubmitting(true);
    try {
      await forgotPasswordRequest(email.trim());
      setSent(true);
      toast.success("Nếu email tồn tại, link đặt lại mật khẩu đã được gửi.");
    } catch (err: any) {
      toast.error(err?.message || "Không gửi được yêu cầu");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="body_wrap">
      <Header />
      <section className="breadcrumb bg_img ul_li" style={{ backgroundImage: "url(/edubost-reference/img/bg/breadcrumb_bg.jpg)" }}><div className="container"><div className="breadcrumb__content text-center"><h1 className="breadcrumb__title">Quên mật khẩu</h1><p className="breadcrumb__desc">Khôi phục quyền truy cập tài khoản GATS Academy</p></div></div></section>
      <section className="contact_section section_space" style={{ backgroundColor: "#F1F1E9" }}><div className="container"><div className="row justify-content-center"><div className="col-lg-6"><div className="contact_form mb-0">
        <h2 className="title">Khôi phục mật khẩu</h2>
        <p className="content">
          Nhập email đã đăng ký để nhận link đặt lại mật khẩu.
        </p>

        {sent ? (
          <div className="mission-vission-item">
            <p className="text-sm leading-relaxed">
              Nếu địa chỉ email hợp lệ, bạn sẽ nhận được hướng dẫn trong vài phút.
              Hãy kiểm tra cả hộp thư spam.
            </p>
            <Link href="/" className="thm-btn">
              Về trang chủ
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit}><div className="form-group">
            <label className="input_title" htmlFor="forgot-email">Email</label>
            <input
              id="forgot-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email của bạn"
              className="form-control"
              autoComplete="email"
            />
            </div><button
              type="submit"
              disabled={submitting}
              className="thm-btn"
            >
              {submitting ? "Đang gửi..." : "Gửi link đặt lại"}
            </button>
          </form>
        )}
      </div></div></div></div></section>
      <Footer />
    </main>
  );
}
