"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { forgotPasswordRequest } from "@/lib/auth/api";

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
    <main className="min-h-screen bg-background pt-28 pb-20">
      <Header />
      <div className="max-w-md mx-auto px-4">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Quên mật khẩu</h1>
        <p className="text-muted-foreground mb-8">
          Nhập email đã đăng ký để nhận link đặt lại mật khẩu.
        </p>

        {sent ? (
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <p className="text-sm leading-relaxed">
              Nếu địa chỉ email hợp lệ, bạn sẽ nhận được hướng dẫn trong vài phút.
              Hãy kiểm tra cả hộp thư spam.
            </p>
            <Link href="/" className="text-primary font-semibold hover:underline text-sm">
              Về trang chủ
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email của bạn"
              className="w-full h-12 px-4 rounded-xl bg-card border border-border text-foreground"
              autoComplete="email"
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 disabled:opacity-50"
            >
              {submitting ? "Đang gửi..." : "Gửi link đặt lại"}
            </button>
          </form>
        )}
      </div>
      <Footer />
    </main>
  );
}
