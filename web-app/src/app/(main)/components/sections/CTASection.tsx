"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import React, { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { leadApi } from "@/services/leads.service";
import { toast } from "sonner";
import { X } from "lucide-react";
import { createPortal } from "react-dom";
import { ShinyText } from "@/components/react-bits";
import { Container } from "@/components/layout/Container";

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
    <section className="relative z-20 w-full overflow-hidden bg-slate-950 text-white py-16 sm:py-20 lg:py-24 shadow-2xl border-t border-white/10">
      {/* Full-Bleed Background Image Layer (Humans Working & AI Technology Interaction) */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 transform scale-102"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&auto=format&fit=crop&q=80')" }}
      />

      {/* Dark Ambient Gradient Overlay for 100% Contrast & High Readability */}
      <div className="absolute inset-0 bg-linear-to-r from-[#0B0F17]/95 via-[#0B0F17]/85 to-[#FF6B00]/40 pointer-events-none" />

      <div className="relative isolate w-full">
        {/* Subtle Ambient Glow */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,107,0,0.15)_0%,transparent_70%)] pointer-events-none"
        />

        <Container className="relative flex flex-col items-center justify-center py-16 text-center sm:py-20 lg:py-24">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: "-40px" }}
            className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#FFB380] sm:text-sm"
          >
            GATS Academy
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: "-40px" }}
            className="max-w-3xl text-balance font-heading text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-[3.35rem] leading-[1.4] lg:leading-[1.5] pt-4"
          >
            Bắt đầu ứng dụng{" "}
            <ShinyText text="AI Agent" speed={4} className="font-extrabold" />{" "}
            vào công việc
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: "-40px" }}
            className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-white/75 sm:text-lg"
          >
            Học thực chiến trên khóa học, hoặc đăng ký tư vấn để GATS cùng bạn
            chọn hướng ứng dụng AI phù hợp.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: "-40px" }}
            className="mt-9 flex w-full max-w-md flex-col gap-3 sm:mt-10 sm:max-w-none sm:flex-row sm:justify-center sm:gap-4"
          >
            <Button
              asChild
              size="lg"
              className="h-12 cursor-pointer rounded-full bg-primary px-8 text-base font-semibold text-white shadow-[0_0_32px_rgba(255,118,34,0.45)] transition-all duration-200 hover:scale-[1.03] hover:bg-primary/90 hover:shadow-[0_0_40px_rgba(255,118,34,0.6)] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#071525] active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:scale-100"
            >
              <Link href="/courses">Khám phá khóa học</Link>
            </Button>
            <Button
              ref={triggerRef}
              size="lg"
              variant="outline"
              className="h-12 cursor-pointer rounded-full border-white/30 bg-white/5 px-8 text-base font-semibold text-white backdrop-blur-md transition-all duration-200 hover:scale-[1.03] hover:border-white/50 hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#071525] active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:scale-100"
              onClick={() => setOpen(true)}
            >
              Đăng ký tư vấn
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.28 }}
            viewport={{ once: true }}
            className="mt-8 text-sm text-white/45"
          >
            Tư vấn miễn phí · Không cam kết · Phản hồi trong 24 giờ
          </motion.p>
        </Container>
      </div>

      {modal}
    </section>
  );
}
