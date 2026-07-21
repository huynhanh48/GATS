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
    }
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
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              className="w-full max-w-5xl bg-background rounded-3xl overflow-hidden shadow-2xl pointer-events-auto flex flex-col md:flex-row relative border border-border/50 h-[90vh] md:h-[750px]"
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="hidden md:flex w-[45%] relative bg-black p-4">
                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,112,235,0.15)] bg-black">
                  <Image
                    src="/auth-bg.jpg"
                    alt="AI Artwork"
                    fill
                    className="object-cover opacity-90 mix-blend-screen"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                  <div className="absolute bottom-10 left-10 right-10">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-[2px] bg-primary/60 rounded-full" />
                      <div className="w-4 h-[2px] bg-primary/40 rounded-full" />
                      <div className="w-2 h-[2px] bg-primary/20 rounded-full" />
                    </div>
                    <h2 className="text-4xl font-bold text-white mb-3">
                      Tạo Nguồn Cảm Hứng
                    </h2>
                    <p className="text-gray-300 text-sm leading-relaxed text-balance">
                      Không gian làm việc AI hỗ trợ bạn sáng tạo và nâng tầm ý
                      tưởng.
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-[55%] flex flex-col items-center justify-center p-8 md:p-16 overflow-y-auto">
                <div className="w-full max-w-md">
                  <div className="flex items-center justify-center mb-10">
                    <div className="bg-muted p-1 rounded-full flex gap-1 shadow-inner border border-border/50">
                      <button
                        type="button"
                        onClick={() => setIsLogin(false)}
                        className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                          !isLogin
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                            : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                        }`}
                      >
                        Đăng ký
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsLogin(true)}
                        className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                          isLogin
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                            : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                        }`}
                      >
                        Đăng nhập
                      </button>
                    </div>
                  </div>

                  <h3 className="text-3xl font-bold text-center mb-8">
                    {isLogin ? "Đăng Nhập" : "Tạo Tài Khoản"}
                  </h3>

                  <form className="space-y-4" onSubmit={handleSubmit}>
                    <AnimatePresence mode="popLayout">
                      {!isLogin && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-4"
                        >
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/60" />
                            <input
                              type="text"
                              placeholder="Tên đăng nhập (username)"
                              value={userName}
                              onChange={(e) => setUserName(e.target.value)}
                              className="w-full h-12 pl-12 pr-4 rounded-xl bg-card border border-border/50 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-sm"
                              autoComplete="username"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/60" />
                      <input
                        type="email"
                        placeholder="Nhập Email của bạn"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-12 pl-12 pr-4 rounded-xl bg-card border border-border/50 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-sm"
                        autoComplete="email"
                      />
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/60" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Mật khẩu"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full h-12 pl-12 pr-12 rounded-xl bg-card border border-border/50 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-sm"
                        autoComplete={
                          isLogin ? "current-password" : "new-password"
                        }
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    {isLogin ? (
                      <div className="-mt-2 text-right">
                        <Link
                          href="/forgot-password"
                          onClick={onClose}
                          className="text-xs font-semibold text-primary hover:underline"
                        >
                          Quên mật khẩu?
                        </Link>
                      </div>
                    ) : null}

                    <AnimatePresence mode="popLayout">
                      {!isLogin && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, marginTop: 0 }}
                          animate={{
                            opacity: 1,
                            height: "auto",
                            marginTop: 16,
                          }}
                          exit={{ opacity: 0, height: 0, marginTop: 0 }}
                          className="relative"
                        >
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/60" />
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Xác nhận mật khẩu"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full h-12 pl-12 pr-12 rounded-xl bg-card border border-border/50 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-sm"
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold shadow-[0_0_20px_rgba(0,112,235,0.4)] hover:shadow-[0_0_30px_rgba(0,112,235,0.6)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none"
                      >
                        {submitting
                          ? "Đang xử lý..."
                          : isLogin
                            ? "Đăng Nhập"
                            : "Tạo tài khoản"}
                      </button>
                    </div>
                  </form>

                  <div className="flex items-center gap-4 my-8">
                    <div className="h-[1px] flex-1 bg-border/50"></div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                      Hoặc
                    </span>
                    <div className="h-[1px] flex-1 bg-border/50"></div>
                  </div>

                  <div className="flex gap-4 justify-center">
                    <div className="h-12 w-16 flex items-center justify-center rounded-xl bg-card border border-border/50 shadow-sm overflow-hidden hover:bg-muted/50 transition-colors relative">
                      <div className="scale-[1.2] opacity-0 absolute inset-0 z-10">
                        <GoogleLogin
                          onSuccess={async (credentialResponse) => {
                            if (credentialResponse.credential) {
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
                            }
                          }}
                          onError={() => {
                            toast.error("Đăng nhập Google thất bại!");
                          }}
                          type="icon"
                          theme={mounted && document.documentElement.classList.contains("dark") ? "filled_black" : "outline"}
                          size="large"
                        />
                      </div>
                      <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                        <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                          <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                          <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                          <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                          <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                        </g>
                      </svg>
                    </div>
                    <button
                      type="button"
                      onClick={handleComingSoon}
                      className="h-12 w-16 rounded-xl bg-card border border-border/50 flex items-center justify-center hover:bg-muted/50 transition-colors shadow-sm"
                      aria-label="Đăng nhập Facebook (sắp ra mắt)"
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-[#1877F2]"
                      >
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={handleComingSoon}
                      className="h-12 w-16 rounded-xl bg-card border border-border/50 flex items-center justify-center hover:bg-muted/50 transition-colors shadow-sm"
                      aria-label="Đăng nhập Apple (sắp ra mắt)"
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-foreground"
                      >
                        <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.665-1.48 3.666-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.56-1.702z" />
                      </svg>
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
