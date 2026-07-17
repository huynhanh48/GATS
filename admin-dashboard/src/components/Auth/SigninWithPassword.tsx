"use client";

import { EmailIcon, PasswordIcon } from "@/assets/icons";
import { defaultPostLoginPath, hasAdminAccess } from "@/lib/auth/access";
import { getSession, login } from "@/services/auth.client";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import InputGroup from "../FormElements/InputGroup";

export default function SigninWithPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState({
    email: process.env.NEXT_PUBLIC_DEMO_USER_MAIL || "",
    password: process.env.NEXT_PUBLIC_DEMO_USER_PASS || "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (searchParams.get("error") === "unauthorized") {
      setError("Bạn không có quyền truy cập khu vực quản trị.");
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const callbackURL = searchParams.get("callbackUrl");

      const result = await login({
        email: data.email,
        password: data.password,
      });

      if (!result.data) {
        throw new Error(result.error?.message || "Failed to sign in");
      }

      const session = await getSession();
      if (!session.data?.user) {
        throw new Error("Không lấy được thông tin phiên đăng nhập.");
      }

      const roles = session.data.user.roles;
      let nextPath = defaultPostLoginPath(roles);

      if (callbackURL?.startsWith("/") && !callbackURL.startsWith("//")) {
        const wantsAdmin =
          callbackURL === "/admin" || callbackURL.startsWith("/admin/");
        if (!wantsAdmin || hasAdminAccess(roles)) {
          nextPath = callbackURL;
        }
      }

      router.push(nextPath);
      router.refresh();
      toast.success("Đăng nhập thành công");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : ((err as { error?: { message?: string } }).error?.message ??
            "Đăng nhập thất bại");
      setError(message);
      toast.error(`Lỗi: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="font-sans">
      <InputGroup
        type="email"
        label="Email"
        className="mb-5 [&_input]:py-3 [&_input]:text-base [&_input]:bg-white dark:[&_input]:bg-slate-900"
        placeholder="Nhập email hoặc username"
        name="email"
        handleChange={handleChange}
        value={data.email}
        iconPosition="left"
        icon={<Mail className="size-5 text-slate-400" />}
      />

      <div className="relative mb-6">
        <InputGroup
          type={showPassword ? "text" : "password"}
          label="Mật khẩu"
          className="[&_input]:py-3 [&_input]:text-base [&_input]:bg-white dark:[&_input]:bg-slate-900 [&_input]:pr-12"
          placeholder="Nhập mật khẩu"
          name="password"
          handleChange={handleChange}
          value={data.password}
          iconPosition="left"
          icon={<Lock className="size-5 text-slate-400" />}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-10 flex h-10 w-10 items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        >
          {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
        </button>
      </div>

      <div className="mb-5">
        <button
          type="submit"
          disabled={loading}
          className="hover:bg-opacity-90 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#0070EB] p-3.5 text-base font-bold text-white shadow-lg shadow-blue-500/30 transition disabled:cursor-not-allowed disabled:opacity-70"
        >
          Đăng nhập
          {loading && (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent" />
          )}
        </button>
      </div>
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600 dark:bg-red-900/30 dark:text-red-400 text-center">
          {error}
        </div>
      )}
    </form>
  );
}
