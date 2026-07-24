"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import React, { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { leadApi } from "@/lib/leads/api";
import { toast } from "sonner";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function CTASection() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");

  const reactId = useId();
  const nameErrorId = `${reactId}-name-error`;
  const phoneErrorId = `${reactId}-phone-error`;
  const emailErrorId = `${reactId}-email-error`;

  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => nameInputRef.current?.focus(), 0);
    return () => {
      document.body.style.overflow = prev;
      window.clearTimeout(t);
    };
  }, [open]);

  const closeModal = () => {
    if (submitting) return;
    setOpen(false);
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  };

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) {
        e.preventDefault();
        setOpen(false);
        window.setTimeout(() => triggerRef.current?.focus(), 0);
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, submitting]);

  const reset = () => {
    setName("");
    setPhone("");
    setEmail("");
    setMessage("");
    setNameError("");
    setPhoneError("");
    setEmailError("");
  };

  const validate = () => {
    let ok = true;
    setNameError("");
    setPhoneError("");
    setEmailError("");

    if (!name.trim()) {
      setNameError("Vui lòng nhập họ tên");
      ok = false;
    }
    if (!phone.trim()) {
      setPhoneError("Vui lòng nhập số điện thoại");
      ok = false;
    } else if (!/^[0-9+\s()-]{8,20}$/.test(phone.trim())) {
      setPhoneError("Số điện thoại không hợp lệ");
      ok = false;
    }
    if (email.trim() && !EMAIL_RE.test(email.trim())) {
      setEmailError("Email không đúng định dạng");
      ok = false;
    }
    return ok;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!validate()) {
      toast.error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    setSubmitting(true);
    try {
      await leadApi.create({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        message: message.trim() || undefined,
        source: "homepage_cta",
      });
      toast.success("Đã gửi đăng ký tư vấn. Chúng tôi sẽ liên hệ sớm!");
      reset();
      setOpen(false);
      window.setTimeout(() => triggerRef.current?.focus(), 0);
    } catch (err: unknown) {
      const error = err as { message?: string; error?: string };
      toast.error(
        error.message || error.error || "Không gửi được. Vui lòng thử lại.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass = (hasError: boolean) =>
    `w-full rounded-xl border bg-background px-3 py-2.5 outline-none focus:ring-1 focus:ring-primary ${
      hasError ? "border-red-500" : "border-border"
    }`;

  const modal =
    open && typeof document !== "undefined"
      ? createPortal(
          <div className="fixed inset-0 z-200 flex items-center justify-center p-4">
            <button
              type="button"
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              aria-label="Đóng hộp thoại"
              onClick={closeModal}
            />
            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="consult-modal-title"
              className="relative w-full max-w-md bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-2xl"
            >
              <button
                type="button"
                className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
                onClick={closeModal}
                aria-label="Đóng"
              >
                <X className="w-5 h-5" aria-hidden />
              </button>
              <h3
                id="consult-modal-title"
                className="text-xl font-bold mb-1 pr-8"
              >
                Đăng ký tư vấn
              </h3>
              <p className="text-sm text-muted-foreground mb-5">
                Để lại thông tin, đội ngũ GATS sẽ trao đổi về nhu cầu ứng dụng
                AI của bạn.
              </p>
              <form
                onSubmit={submit}
                className="space-y-3 text-left"
                autoComplete="on"
              >
                <div>
                  <label
                    htmlFor="consult-name"
                    className="text-sm font-medium mb-1 block"
                  >
                    Họ và tên *
                  </label>
                  <input
                    ref={nameInputRef}
                    id="consult-name"
                    name="name"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (nameError) setNameError("");
                    }}
                    className={fieldClass(!!nameError)}
                    placeholder="Nguyễn Văn A"
                    disabled={submitting}
                    aria-invalid={nameError ? true : undefined}
                    aria-describedby={nameError ? nameErrorId : undefined}
                  />
                  {nameError ? (
                    <p id={nameErrorId} className="text-red-500 text-xs mt-1" role="alert">
                      {nameError}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label
                    htmlFor="consult-phone"
                    className="text-sm font-medium mb-1 block"
                  >
                    Số điện thoại *
                  </label>
                  <input
                    id="consult-phone"
                    name="tel"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (phoneError) setPhoneError("");
                    }}
                    className={fieldClass(!!phoneError)}
                    placeholder="09xxxxxxxx"
                    disabled={submitting}
                    aria-invalid={phoneError ? true : undefined}
                    aria-describedby={phoneError ? phoneErrorId : undefined}
                  />
                  {phoneError ? (
                    <p id={phoneErrorId} className="text-red-500 text-xs mt-1" role="alert">
                      {phoneError}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label
                    htmlFor="consult-email"
                    className="text-sm font-medium mb-1 block"
                  >
                    Email
                  </label>
                  <input
                    id="consult-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError("");
                    }}
                    className={fieldClass(!!emailError)}
                    placeholder="email@example.com"
                    disabled={submitting}
                    aria-invalid={emailError ? true : undefined}
                    aria-describedby={emailError ? emailErrorId : undefined}
                  />
                  {emailError ? (
                    <p id={emailErrorId} className="text-red-500 text-xs mt-1" role="alert">
                      {emailError}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label
                    htmlFor="consult-message"
                    className="text-sm font-medium mb-1 block"
                  >
                    Nhu cầu / ghi chú
                  </label>
                  <textarea
                    id="consult-message"
                    name="message"
                    autoComplete="off"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none focus:ring-1 focus:ring-primary resize-none"
                    placeholder="Bạn muốn dùng AI cho công việc nào?"
                    disabled={submitting}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl h-11 font-bold"
                >
                  {submitting ? "Đang gửi..." : "Gửi đăng ký"}
                </Button>
              </form>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <section className="w-full py-32 relative z-20 bg-transparent overflow-hidden border-t border-border/10">
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-100 w-200 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[120px]" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Bắt đầu ứng dụng <span className="text-primary">AI</span> vào công
            việc
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10 text-balance">
            Chọn khóa học để tự thực hành hoặc trao đổi với GATS về bài toán bạn
            đang muốn giải quyết.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="h-12 w-full rounded-full px-8 text-base shadow-[0_0_30px_rgba(255,118,34,0.35)] transition-shadow hover:shadow-[0_0_40px_rgba(255,118,34,0.5)] sm:w-auto"
            >
              <Link href="/courses">Khám phá khóa học</Link>
            </Button>
            <Button
              ref={triggerRef}
              size="lg"
              className="h-12 w-full rounded-full border-2 border-brand-primary bg-brand-primary px-8 text-base text-white shadow-[0_0_24px_rgba(0,112,235,0.35)] transition-all hover:bg-brand-primary/90 hover:shadow-[0_0_36px_rgba(0,112,235,0.5)] sm:w-auto"
              onClick={() => setOpen(true)}
            >
              Đăng ký tư vấn
            </Button>
          </div>
        </motion.div>
      </div>

      {modal}
    </section>
  );
}
