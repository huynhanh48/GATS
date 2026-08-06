"use client";

import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building, Users, Globe } from "lucide-react";
import { useState } from "react";

const heroBackgrounds = [
  "/images/landingpages/banner1.webp",
  "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1920&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1920&auto=format&fit=crop&q=80",
];

export function Hero() {
  const [bgIndex, setBgIndex] = useState(0);

  return (
    <section className="relative w-full min-h-[90vh] pt-[10rem] pb-[7rem] lg:pt-[12rem] lg:pb-[9rem] flex flex-col justify-between overflow-hidden text-white bg-slate-950">
      {/* Full-Bleed Background Image Layer (Robot & Human Touching Hands Artwork) */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 transform scale-105"
        style={{ backgroundImage: `url('${heroBackgrounds[bgIndex]}')` }}
      />

      {/* Dark Ambient Gradient Overlay for 100% Contrast & High Readability */}
      <div className="absolute inset-0 bg-linear-to-b from-[#0B0F17]/90 via-[#0B0F17]/82 to-[#0B0F17]/95 backdrop-blur-[1px] pointer-events-none" />

      {/* Subtle Glowing Amber Accent Orbs */}
      <div className="absolute top-1/4 right-10 size-[500px] bg-[#FF6B00]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 size-[450px] bg-[#0265FF]/15 rounded-full blur-3xl pointer-events-none" />

      <Container size="xl" className="relative z-10 w-full my-auto">
        {/* Top Tagline */}
        <div className="text-center font-mono text-[1.3rem] font-bold tracking-widest text-[#FF6B00] uppercase mb-4 drop-shadow-md">
          AI ON THE JOB · GATS ENTERPRISE ACADEMY
        </div>

        {/* Hero Main Title */}
        <div className="text-center max-w-5xl mx-auto mb-6">
          <h1 className="text-[4.2rem] sm:text-[5.8rem] md:text-[6.8rem] lg:text-[7.4rem] font-heading font-extrabold text-white leading-[1.08] tracking-tight drop-shadow-lg">
            Làm Chủ Công Nghệ AI <br />
            <span className="text-[#FF6B00] underline decoration-[#FF6B00]/40 underline-offset-8">
              Nâng Tầm Năng Suất
            </span> Doanh Nghiệp
          </h1>
        </div>

        {/* Sub-Pills Bar (Luxury Glassmorphism Style) */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          <span className="px-5 py-2.5 rounded-full bg-white/10 border border-white/20 text-white text-[1.3rem] font-bold shadow-lg backdrop-blur-md flex items-center gap-2 hover:bg-white/20 transition-all">
            <Building className="size-4 text-[#FF6B00]" />
            Industry Connected
          </span>
          <span className="px-5 py-2.5 rounded-full bg-white/10 border border-white/20 text-white text-[1.3rem] font-bold shadow-lg backdrop-blur-md flex items-center gap-2 hover:bg-white/20 transition-all">
            <Users className="size-4 text-[#FF6B00]" />
            Supported Community (25K+)
          </span>
          <span className="px-5 py-2.5 rounded-full bg-white/10 border border-white/20 text-white text-[1.3rem] font-bold shadow-lg backdrop-blur-md flex items-center gap-2 hover:bg-white/20 transition-all">
            <Globe className="size-4 text-[#FF6B00]" />
            Real World Skills
          </span>
        </div>

        {/* Subtitle */}
        <p className="text-[1.65rem] sm:text-[1.9rem] text-slate-200 text-center leading-relaxed max-w-3xl mx-auto mb-12 font-normal drop-shadow-md">
          Hệ thống chương trình chuẩn hóa giúp cá nhân và tổ chức làm chủ công nghệ trí tuệ nhân tạo, tự động hóa luồng làm việc thực tế và đo lường chỉ số ROI rõ ràng.
        </p>

        {/* CTA Buttons Bar */}
        <div className="flex flex-wrap items-center justify-center gap-5 mb-20">
          <Button
            asChild
            className="bg-[#FF6B00] hover:bg-[#e05e00] text-white rounded-xl px-11 h-15 text-[1.65rem] font-extrabold shadow-2xl shadow-[#FF6B00]/40 transition-all hover:scale-105 border-none cursor-pointer"
          >
            <Link href="/courses" className="flex items-center gap-2.5">
              <span>Đăng Ký Ngay</span>
              <ArrowRight className="size-5 text-white" />
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="border-white/30 bg-white/10 hover:bg-white/20 text-white rounded-xl px-9 h-15 text-[1.65rem] font-bold backdrop-blur-md shadow-lg transition-all cursor-pointer"
          >
            <Link href="/about">
              Lộ Trình Đào Tạo
            </Link>
          </Button>
        </div>

        {/* Bottom Metrics Bar (Full Glassmorphism Floating Panel) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white/10 backdrop-blur-xl border border-white/20 p-6 sm:p-8 rounded-3xl shadow-2xl shadow-black/40 max-w-5xl mx-auto">
          <div className="flex flex-col items-center text-center">
            <span className="text-[3.8rem] sm:text-[4.4rem] font-heading font-extrabold text-[#FF6B00] leading-none mb-1 drop-shadow-sm">25,000+</span>
            <span className="text-[1.4rem] font-semibold text-slate-200">Học viên tin tưởng</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="text-[3.8rem] sm:text-[4.4rem] font-heading font-extrabold text-white leading-none mb-1 drop-shadow-sm">899+</span>
            <span className="text-[1.4rem] font-semibold text-slate-200">Chương trình đào tạo</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="text-[3.8rem] sm:text-[4.4rem] font-heading font-extrabold text-amber-300 leading-none mb-1 drop-shadow-sm">158</span>
            <span className="text-[1.4rem] font-semibold text-slate-200">Chuyên gia AI cố vấn</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="text-[3.8rem] sm:text-[4.4rem] font-heading font-extrabold text-emerald-400 leading-none mb-1 drop-shadow-sm">100%</span>
            <span className="text-[1.4rem] font-semibold text-slate-200">Tỉ lệ hài lòng</span>
          </div>
        </div>
      </Container>
    </section>
  );
}
