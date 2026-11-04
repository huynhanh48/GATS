"use client";

import { EmailIcon, PasswordIcon } from "@/assets/icons";
import { register } from "@/services/auth.client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
import InputGroup from "../FormElements/InputGroup";

export default function SignupWithPassword() {
  const router = useRouter();
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      const result = await register({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      if (!result.data) {
        throw new Error(result.error?.message || "Đăng ký thất bại");
      }

      toast.success(
        "Đăng ký thành công. Vui lòng xác thực email trước khi đăng nhập.",
      );
      router.push("/auth/sign-in");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : ((err as { error?: { message?: string } }).error?.message ??
            "Đăng ký thất bại");
      setError(message);
      toast.error(`Lỗi: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <InputGroup
        type="text"
        label="Username"
        className="mb-4 [&_input]:py-3.75"
        placeholder="Nhập username"
        name="name"
        handleChange={handleChange}
        value={data.name}
      />

      <InputGroup
        type="email"
        label="Email"
        className="mb-4 [&_input]:py-3.75"
        placeholder="Nhập email"
        name="email"
        handleChange={handleChange}
        value={data.email}
        icon={<EmailIcon />}
      />

      <InputGroup
        type="password"
        label="Password"
        className="mb-5 [&_input]:py-3.75"
        placeholder="Tạo mật khẩu"
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
          Đăng ký
          {loading && (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent dark:border-primary dark:border-t-transparent" />
          )}
        </button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </form>
  );
}
