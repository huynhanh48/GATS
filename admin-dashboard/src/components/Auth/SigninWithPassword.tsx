"use client";

import { EmailIcon, PasswordIcon } from "@/assets/icons";
import {
  canAccessDashboardPath,
  defaultPostLoginPath,
  hasAdminAccess,
} from "@/lib/auth/access";
import {
  getSession,
  login,
  loginWithGoogle,
  logout,
} from "@/services/auth.client";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import InputGroup from "../FormElements/InputGroup";
import { GoogleLogin } from "@react-oauth/google";
import { GoogleIcon } from "@/assets/icons";

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
      if (!hasAdminAccess(roles)) {
        await logout();
        setError("Bạn không có quyền truy cập khu vực quản trị.");
        return;
      }

      let nextPath = defaultPostLoginPath(roles);

      if (
        callbackURL?.startsWith("/") &&
        !callbackURL.startsWith("//") &&
        !callbackURL.startsWith("/auth")
      ) {
        // Legacy bookmarks: /admin/course → /course
        nextPath =
          callbackURL === "/admin" || callbackURL.startsWith("/admin/")
            ? callbackURL.replace(/^\/admin/, "") || "/"
            : callbackURL;
      }

      if (!canAccessDashboardPath(roles, nextPath.split("?")[0])) {
        nextPath = defaultPostLoginPath(roles);
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

  const handleGoogleSuccess = async (credential?: string) => {
    if (!credential) {
      setError("Không nhận được token Google.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const result = await loginWithGoogle(credential);
      if (!result.data) {
        throw new Error(result.error?.message || "Đăng nhập Google thất bại");
      }
      const session = await getSession();
      if (!session.data?.user || !hasAdminAccess(session.data.user.roles)) {
        await logout();
        setError(
          "Tài khoản Google này chưa được phân công làm admin hoặc mentor.",
        );
        return;
      }
      router.push(defaultPostLoginPath(session.data.user.roles));
      router.refresh();
      toast.success("Đăng nhập Google thành công");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Đăng nhập Google thất bại";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="font-sans">
      <InputGroup
        type="email"
        label="Email"
        className="mb-5 [&_input]:bg-white [&_input]:py-3 [&_input]:text-base dark:[&_input]:bg-slate-900"
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
          className="[&_input]:bg-white [&_input]:py-3 [&_input]:pr-12 [&_input]:text-base dark:[&_input]:bg-slate-900"
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
          className="absolute top-10 right-3 flex h-10 w-10 items-center justify-center text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200"
          aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        >
          {showPassword ? (
            <EyeOff className="size-5" />
          ) : (
            <Eye className="size-5" />
          )}
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
        <div className="rounded-lg bg-red-50 p-3 text-center text-sm font-medium text-red-600 dark:bg-red-900/30 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="my-5 flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
          Hoặc
        </span>
        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
      </div>

      {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
        <div className="relative flex min-h-12 w-full items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800">
          <span className="pointer-events-none flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <GoogleIcon /> Đăng nhập với Google
          </span>
          <div className="absolute inset-0 flex scale-x-[1.8] items-center justify-center opacity-[0.02]">
            <GoogleLogin
              width="320"
              text="signin_with"
              shape="rectangular"
              onSuccess={(response) =>
                void handleGoogleSuccess(response.credential)
              }
              onError={() =>
                setError(
                  "Google từ chối đăng nhập. Kiểm tra Authorized JavaScript origins.",
                )
              }
            />
          </div>
        </div>
      ) : (
        <p className="rounded-lg bg-amber-50 p-3 text-center text-sm text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
          Chưa cấu hình Google Client ID cho Admin.
        </p>
      )}
    </form>
  );
}
