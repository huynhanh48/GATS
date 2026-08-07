"use client";

import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Video, Calendar, Clock, ArrowRight, Sparkles } from "lucide-react";

export function LiveQnASection() {
  return (
    <section className="relative w-full py-20 sm:py-24 overflow-hidden text-white bg-slate-950 border-y border-white/10 shadow-2xl">
      {/* Full-Bleed Background Image (Clear Presenter Speaking to Audience) */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600&auto=format&fit=crop&q=80')`,
        }}
      />

      {/* Balanced Dark Gradient Overlay for Sharp Photo Visibility + Text Contrast */}
      <div className="absolute inset-0 bg-linear-to-r from-[#0B0F17]/90 via-[#0B0F17]/70 to-[#0B0F17]/40 pointer-events-none" />
      <div className="absolute inset-0 bg-linear-to-t from-[#0B0F17]/90 via-transparent to-[#0B0F17]/60 pointer-events-none" />

      {/* Ambient Glowing Amber Orb */}
      <div className="absolute top-1/2 -translate-y-1/2 -left-20 size-[380px] bg-[#FF6B00]/20 rounded-full blur-3xl pointer-events-none" />

      <Container size="xl" className="relative z-10 w-full">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10">
          {/* Left Content */}
          <div className="flex flex-col items-start max-w-3xl space-y-6">
            {/* Clean Sub-tag Label without pulse animation */}
            <div className="text-[#FF6B00] text-[1.2rem] font-bold font-mono uppercase tracking-wider">
              LỊCH HỎI ĐÁP KHÓA HỌC TRỰC TIẾP
            </div>

            {/* Main Title */}
            <h2 className="text-[3.2rem] sm:text-[4.4rem] lg:text-[5rem] font-heading font-extrabold text-white leading-[1.12] tracking-tight drop-shadow-lg">
              Buổi Hỏi Đáp Online Trực Tiếp <br />
              <span className="text-[#FF6B00]">Cùng Chuyên Gia GATS</span>
            </h2>

            {/* Subtitle Description */}
            <p className="text-[1.6rem] sm:text-[1.8rem] text-slate-200 font-normal leading-relaxed max-w-2xl drop-shadow-md">
              Học viên được trực tiếp trao đổi, giải đáp mọi thắc mắc và nhận tư vấn tối ưu luồng công việc thực tế cùng đội ngũ chuyên gia hàng đầu.
            </p>

            {/* Schedule Pills */}
            <div className="flex flex-wrap items-center gap-4 pt-2 font-semibold text-[1.4rem] text-slate-200">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/15 backdrop-blur-md">
                <Calendar className="size-5 text-[#FF6B00]" />
                <span>Thứ 5 Hàng Tuần</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/15 backdrop-blur-md">
                <Clock className="size-5 text-[#FF6B00]" />
                <span>20:00 - 21:30 (Zoom Live)</span>
              </div>
            </div>
          </div>

          {/* Right CTA Button */}
          <div className="shrink-0 w-full md:w-auto">
            <Button
              asChild
              className="w-full md:w-auto rounded-2xl px-9 h-16 text-[1.6rem] font-extrabold bg-[#FF6B00] hover:bg-[#e05e00] text-white shadow-2xl shadow-[#FF6B00]/30 hover:shadow-[#FF6B00]/50 hover:scale-[1.02] transition-all cursor-pointer border-none"
            >
              <Link href="/courses" className="flex items-center justify-center gap-3">
                <span>Đăng ký tham gia Live Q&amp;A</span>
                <ArrowRight className="size-5 text-white" />
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
