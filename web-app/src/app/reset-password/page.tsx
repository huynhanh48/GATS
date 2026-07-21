"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { resetPasswordRequest } from "@/lib/auth/api";

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
    <form onSubmit={onSubmit} className="space-y-4">
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Mật khẩu mới"
        className="w-full h-12 px-4 rounded-xl bg-card border border-border"
        autoComplete="new-password"
      />
      <input
        type="password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder="Xác nhận mật khẩu mới"
        className="w-full h-12 px-4 rounded-xl bg-card border border-border"
        autoComplete="new-password"
      />
      <p className="text-xs text-muted-foreground">
        Tối thiểu 7 ký tự, có chữ hoa, số và ký tự đặc biệt.
      </p>
      <button
        type="submit"
        disabled={submitting}
        className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 disabled:opacity-50"
      >
        {submitting ? "Đang cập nhật..." : "Đặt lại mật khẩu"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-background pt-28 pb-20">
      <Header />
      <div className="max-w-md mx-auto px-4">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Đặt lại mật khẩu</h1>
        <p className="text-muted-foreground mb-8">
          Tạo mật khẩu mới cho tài khoản GATS Academy.
        </p>
        <Suspense fallback={<p className="text-muted-foreground">Đang tải...</p>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
      <Footer />
    </main>
  );
}
