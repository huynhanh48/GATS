"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { EdubostHeader as Header, EdubostFooter as Footer } from "@/components/edubost/EdubostShell";
import { resetPasswordRequest } from "@/services/auth.service";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Link đặt lại không hợp lệ");
      return;
    }
    if (password !== confirm) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }
    setSubmitting(true);
    try {
      await resetPasswordRequest(token, password);
      toast.success("Đã đặt lại mật khẩu. Vui lòng đăng nhập lại.");
      router.push("/");
    } catch (err: any) {
      toast.error(err?.message || "Không đặt lại được mật khẩu");
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
        <p className="text-sm text-muted-foreground">
          Link đặt lại mật khẩu thiếu hoặc không hợp lệ.
        </p>
        <Link href="/forgot-password" className="text-primary font-semibold hover:underline text-sm">
          Yêu cầu link mới
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="form-group"><label className="input_title" htmlFor="new-password">Mật khẩu mới</label>
      <input
        id="new-password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Mật khẩu mới"
        className="form-control"
        autoComplete="new-password"
      />
      </div><div className="form-group"><label className="input_title" htmlFor="confirm-password">Xác nhận mật khẩu</label><input
        id="confirm-password"
        type="password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder="Xác nhận mật khẩu mới"
        className="form-control"
        autoComplete="new-password"
      /></div>
      <p className="text-xs text-muted-foreground">
        Tối thiểu 7 ký tự, có chữ hoa, số và ký tự đặc biệt.
      </p>
      <button
        type="submit"
        disabled={submitting}
        className="thm-btn"
      >
        {submitting ? "Đang cập nhật..." : "Đặt lại mật khẩu"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="body_wrap">
      <Header />
      <section className="breadcrumb bg_img ul_li" style={{ backgroundImage: "url(/edubost-reference/img/bg/breadcrumb_bg.jpg)" }}><div className="container"><div className="breadcrumb__content text-center"><h1 className="breadcrumb__title">Đặt lại mật khẩu</h1><p className="breadcrumb__desc">Tạo thông tin đăng nhập mới cho tài khoản</p></div></div></section>
      <section className="contact_section section_space" style={{ backgroundColor: "#F1F1E9" }}><div className="container"><div className="row justify-content-center"><div className="col-lg-6"><div className="contact_form mb-0">
        <h2 className="title">Tạo mật khẩu mới</h2>
        <p className="content">
          Tạo mật khẩu mới cho tài khoản GATS Academy.
        </p>
        <Suspense fallback={<p className="text-muted-foreground">Đang tải...</p>}>
          <ResetPasswordForm />
        </Suspense>
      </div></div></div></div></section>
      <Footer />
    </main>
  );
}
