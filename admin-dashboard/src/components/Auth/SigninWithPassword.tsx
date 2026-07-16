"use client";

import { EmailIcon, PasswordIcon } from "@/assets/icons";
import { defaultPostLoginPath, hasAdminAccess } from "@/lib/auth/access";
import { getSession, login } from "@/services/auth.client";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
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
    <form onSubmit={handleSubmit}>
      <InputGroup
        type="email"
        label="Email"
        className="mb-4 [&_input]:py-3.75"
        placeholder="Nhập email hoặc username"
        name="email"
        handleChange={handleChange}
        value={data.email}
        icon={<EmailIcon />}
      />

      <InputGroup
        type="password"
        label="Password"
        className="mb-5 [&_input]:py-3.75"
        placeholder="Nhập mật khẩu"
        name="password"
        handleChange={handleChange}
        value={data.password}
        icon={<PasswordIcon />}
      />

      <div className="mb-4.5">
        <button
          type="submit"
          disabled={loading}
          className="hover:bg-opacity-90 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary p-4 font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-70"
        >
          Đăng nhập
          {loading && (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent dark:border-primary dark:border-t-transparent" />
          )}
        </button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </form>
  );
}
