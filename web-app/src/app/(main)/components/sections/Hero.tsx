"use client";

import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building, Users, Globe } from "lucide-react";
import { useState } from "react";

const heroFallbacks = [
  "/images/landingpages/banner1.webp",
  "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1400&auto=format&fit=crop&q=80",
];

export function Hero() {
  const [imgIndex, setImgIndex] = useState(0);

  return (
    <section className="relative w-full pt-[9rem] pb-[6.5rem] lg:pt-[11rem] lg:pb-[8.5rem] overflow-hidden bg-[#FAF8F5] text-[#0B0F17]">
      {/* Light Amber Glows & Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-70 pointer-events-none" />
      <div className="absolute top-0 right-1/4 size-[600px] bg-[#FF6B00]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 size-[450px] bg-[#0265FF]/8 rounded-full blur-3xl pointer-events-none" />

      <Container size="xl" className="relative z-10 w-full">
        {/* Top Tagline */}
        <div className="text-center font-mono text-[1.3rem] font-bold tracking-widest text-[#FF6B00] uppercase mb-4">
          AI ON THE JOB · GATS ENTERPRISE ACADEMY
        </div>

        {/* Hero Title */}
        <div className="text-center max-w-4xl mx-auto mb-6">
          <h1 className="text-[4rem] sm:text-[5.4rem] md:text-[6.4rem] lg:text-[7rem] font-heading font-extrabold text-[#0B0F17] leading-[1.08] tracking-tight">
            Làm Chủ Công Nghệ AI <br />
            <span className="text-[#FF6B00] underline decoration-[#FF6B00]/30 underline-offset-8">
              Nâng Tầm Năng Suất
            </span> Doanh Nghiệp
          </h1>
        </div>

        {/* Sub-Pills Bar (Light Amber Style) */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          <span className="px-4 py-2 rounded-full bg-white border border-amber-200 text-[#0B0F17] text-[1.3rem] font-bold shadow-xs backdrop-blur-md flex items-center gap-2">
            <Building className="size-4 text-[#FF6B00]" />
            Industry Connected
          </span>
          <span className="px-4 py-2 rounded-full bg-white border border-amber-200 text-[#0B0F17] text-[1.3rem] font-bold shadow-xs backdrop-blur-md flex items-center gap-2">
            <Users className="size-4 text-[#FF6B00]" />
            Supported Community (25K+)
          </span>
          <span className="px-4 py-2 rounded-full bg-white border border-amber-200 text-[#0B0F17] text-[1.3rem] font-bold shadow-xs backdrop-blur-md flex items-center gap-2">
            <Globe className="size-4 text-[#FF6B00]" />
            Real World Skills
          </span>
        </div>

        {/* Subtitle */}
        <p className="text-[1.6rem] sm:text-[1.85rem] text-slate-600 text-center leading-relaxed max-w-3xl mx-auto mb-10 font-normal">
          Hệ thống chương trình chuẩn hóa giúp cá nhân và tổ chức làm chủ công nghệ trí tuệ nhân tạo, tự động hóa luồng làm việc thực tế và đo lường chỉ số ROI rõ ràng.
        </p>

        {/* CTA Buttons Bar */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <Button
            asChild
            className="bg-[#FF6B00] hover:bg-[#e05e00] text-white rounded-xl px-10 h-14 text-[1.6rem] font-extrabold shadow-xl shadow-[#FF6B00]/25 transition-all hover:scale-105 border-none cursor-pointer"
          >
            <Link href="/courses" className="flex items-center gap-2.5">
              <span>Đăng Ký Ngay</span>
              <ArrowRight className="size-5 text-white" />
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="border-slate-300 bg-white hover:bg-slate-50 text-[#0B0F17] rounded-xl px-8 h-14 text-[1.6rem] font-bold shadow-xs transition-all cursor-pointer"
          >
            <Link href="/about">
              Lộ Trình Đào Tạo
            </Link>
          </Button>
        </div>

        {/* Hero Visual Banner: Specified Local Image /images/landingpages/banner1.webp */}
        <div className="relative w-full max-w-6xl mx-auto mb-16 rounded-3xl overflow-hidden border-4 border-white shadow-2xl shadow-amber-900/10 bg-slate-900">
          <img
            src={heroFallbacks[imgIndex]}
            alt="Đào tạo công nghệ AI thực chiến - GATS Academy"
            className="w-full h-[440px] sm:h-[580px] lg:h-[680px] object-cover object-center"
            onError={() => {
              setImgIndex((prev) => (prev + 1) % heroFallbacks.length);
            }}
          />
          <div className="absolute inset-0 bg-linear-to-t from-[#0B0F17]/60 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Bottom Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white border border-amber-200/80 p-6 sm:p-8 rounded-2xl shadow-xl shadow-amber-900/5">
          <div className="flex flex-col items-center text-center">
            <span className="text-[3.6rem] sm:text-[4.2rem] font-heading font-extrabold text-[#FF6B00] leading-none mb-1">25,000+</span>
            <span className="text-[1.4rem] font-semibold text-slate-600">Học viên tin tưởng</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="text-[3.6rem] sm:text-[4.2rem] font-heading font-extrabold text-[#0B0F17] leading-none mb-1">899+</span>
            <span className="text-[1.4rem] font-semibold text-slate-600">Chương trình đào tạo</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="text-[3.6rem] sm:text-[4.2rem] font-heading font-extrabold text-[#0265FF] leading-none mb-1">158</span>
            <span className="text-[1.4rem] font-semibold text-slate-600">Chuyên gia AI cố vấn</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="text-[3.6rem] sm:text-[4.2rem] font-heading font-extrabold text-emerald-600 leading-none mb-1">100%</span>
            <span className="text-[1.4rem] font-semibold text-slate-600">Tỉ lệ hài lòng</span>
          </div>
        </div>
      </Container>
    </section>
  );
}
