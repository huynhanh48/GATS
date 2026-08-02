"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import type { AuthModalMode } from "@/types/auth";
import { GoogleLogin } from "@react-oauth/google";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthModalMode;
}

export function AuthModal({
  isOpen,
  onClose,
  initialMode = "register",
}: AuthModalProps) {
  const { login, register, loginWithGoogle } = useAuth();
  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setIsLogin(initialMode === "login");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setUserName("");
      setAcceptedTerms(false);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, initialMode]);

  if (!mounted) return null;

  const handleComingSoon = () => {
    toast.info("Tính năng sắp ra mắt");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!email || !password) {
      toast.error("Vui lòng điền đầy đủ Email và Mật khẩu!");
      return;
    }

    if (!isLogin) {
      if (!userName || userName.trim().length < 3) {
        toast.error("Tên đăng nhập phải có ít nhất 3 ký tự!");
        return;
      }
      if (password !== confirmPassword) {
        toast.error("Mật khẩu xác nhận không trùng khớp!");
        return;
      }
      if (!acceptedTerms) {
        toast.error(
          "Vui lòng đồng ý với Điều khoản dịch vụ và Chính sách quyền riêng tư!",
        );
        return;
      }
    }

    setSubmitting(true);
    try {
      if (isLogin) {
        await login(email, password);
        toast.success("Đăng nhập thành công!");
        onClose();
      } else {
        const result = await register({
          userName: userName.trim(),
          email,
          password,
        });

        if (result.needsVerification) {
          toast.success(
            "Đăng ký tài khoản thành công! Vui lòng kiểm tra email."
          );
          setIsLogin(true);
        } else {
          toast.success("Đăng ký và xác thực tài khoản thành công!");
          onClose();
        }
      }
    } catch (error: unknown) {
      const err = error as { message?: string; error?: string };
      toast.error(
        err?.message || err?.error || "Đã xảy ra lỗi, vui lòng thử lại!"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              className="w-full max-w-lg max-h-[calc(100vh-120px)] overflow-y-auto overflow-x-hidden bg-white rounded-2xl shadow-2xl pointer-events-auto relative border border-slate-200"
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-6 sm:p-8">
                <h3 className="text-[2.2rem] font-bold text-[#111827] mb-6">
                  {isLogin ? "Đăng nhập" : "Đăng ký"}
                </h3>

                <form className="space-y-4" onSubmit={handleSubmit}>
                  {!isLogin && (
                    <div className="space-y-4">
                      <input
                        type="email"
                        placeholder="Email*"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-[46px] px-4 rounded-md border border-slate-200 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-primary transition-colors text-[1.4rem]"
                        autoComplete="email"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Tên đăng nhập*"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="w-full h-[46px] px-4 rounded-md border border-slate-200 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-primary transition-colors text-[1.4rem]"
                        autoComplete="username"
                        required
                      />
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Mật khẩu*"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full h-[46px] pl-4 pr-12 rounded-md border border-slate-200 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-primary transition-colors text-[1.4rem]"
                          autoComplete="new-password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Xác nhận mật khẩu*"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full h-[46px] pl-4 pr-12 rounded-md border border-slate-200 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-primary transition-colors text-[1.4rem]"
                          autoComplete="new-password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      <label className="flex cursor-pointer items-start gap-3 text-[1.3rem] text-slate-500">
                        <input
                          type="checkbox"
                          checked={acceptedTerms}
                          onChange={(event) => setAcceptedTerms(event.target.checked)}
                          className="mt-1 w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                        />
                        <span>
                          Tôi đã đọc và đồng ý với{" "}
                          <Link href="/terms" onClick={onClose} className="font-semibold text-slate-700 hover:text-primary">
                            Điều khoản dịch vụ
                          </Link>{" "}
                          và{" "}
                          <Link href="/privacy" onClick={onClose} className="font-semibold text-slate-700 hover:text-primary">
                            Chính sách quyền riêng tư
                          </Link>
                          .
                        </span>
                      </label>
                    </div>
                  )}

                  {isLogin && (
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Email hoặc tên đăng nhập*"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-[46px] px-4 rounded-md border border-slate-200 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-primary transition-colors text-[1.4rem]"
                        autoComplete="username"
                        required
                      />
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Mật khẩu*"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full h-[46px] pl-4 pr-12 rounded-md border border-slate-200 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-primary transition-colors text-[1.4rem]"
                          autoComplete="current-password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      <label className="flex cursor-pointer items-center gap-3 text-[1.4rem] text-slate-500">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                        />
                        <span>Ghi nhớ đăng nhập</span>
                      </label>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-[46px] rounded-full bg-[#FF7622] hover:bg-[#FF7622]/90 text-white font-semibold text-[1.5rem] transition-colors duration-300 disabled:opacity-50 mt-2"
                  >
                    {submitting ? "Đang xử lý..." : isLogin ? "Đăng nhập" : "Đăng ký"}
                  </button>

                  {isLogin && (
                    <div className="pt-2 text-left">
                      <Link
                        href="/forgot-password"
                        onClick={onClose}
                        className="text-[1.4rem] text-[#111827] font-medium hover:text-primary transition-colors"
                      >
                        Quên mật khẩu?
                      </Link>
                    </div>
                  )}
                </form>

                <div className="flex items-center gap-4 my-6">
                  <div className="h-[1px] flex-1 bg-slate-200"></div>
                  <span className="text-[1.2rem] text-slate-400 font-medium">HOẶC</span>
                  <div className="h-[1px] flex-1 bg-slate-200"></div>
                </div>

                <div className="flex flex-col gap-4">
                  {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
                    <div className="relative mx-auto h-[58px] w-full max-w-[400px] overflow-hidden rounded-full">
                      <div className="absolute inset-0 flex items-center justify-center [&>div]:max-w-full">
                        <GoogleLogin
                          type="standard"
                          theme="outline"
                          size="large"
                          shape="pill"
                          width="400"
                          text="continue_with"
                          logo_alignment="center"
                          onSuccess={async (credentialResponse) => {
                          if (!credentialResponse.credential) {
                            toast.error("Không nhận được token Google.");
                            return;
                          }
                          setSubmitting(true);
                          try {
                            await loginWithGoogle(credentialResponse.credential);
                            toast.success("Đăng nhập Google thành công!");
                            onClose();
                          } catch (error: unknown) {
                            const err = error as { message?: string; error?: string };
                            toast.error(err?.message || err?.error || "Đăng nhập Google thất bại!");
                          } finally {
                            setSubmitting(false);
                          }
                          }}
                          onError={() => {
                            toast.error("Google từ chối đăng nhập.");
                          }}
                        />
                      </div>
                      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center gap-3 rounded-full border border-slate-200 bg-white text-[1.6rem] font-medium text-slate-800">
                        <GoogleMark className="h-6 w-6" />
                        <span>Tiếp tục với Google</span>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => toast.error("Google Login chưa cấu hình.")}
                      className="w-full h-[46px] rounded-full border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-center gap-3"
                    >
                      <GoogleMark className="w-5 h-5" />
                      <span className="text-[1.4rem] font-medium text-slate-700">Tiếp tục với Google</span>
                    </button>
                  )}
                  
                  <div className="text-center mt-4">
                    <button
                      onClick={() => setIsLogin(!isLogin)}
                      className="text-[1.4rem] text-slate-600 font-medium hover:text-primary transition-colors"
                    >
                      {isLogin ? "Chưa có tài khoản? Đăng ký ngay" : "Đã có tài khoản? Đăng nhập"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

function GoogleMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
