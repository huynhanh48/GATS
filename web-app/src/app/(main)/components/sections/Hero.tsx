"use client";

import Link from "next/link";
import { Container } from "@/components/layout/Container";

export function Hero() {
  return (
    <>
      {/* Edubost Hero Section Structure */}
      <section className="hero o-hidden pos-rel relative w-full bg-slate-950 text-white overflow-hidden pt-28 pb-16">
        {/* Background Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
          style={{ backgroundImage: `url('/images/landingpages/banner1.webp')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/80 to-slate-950 pointer-events-none" />

        <Container size="xl" className="relative z-10">
          <div className="hero__content-wrap text-center max-w-5xl mx-auto pt-6">
            <div className="section-title clr-white mb-6">
              <span className="sub-title text-[#FF6B00] uppercase font-mono font-bold tracking-widest text-[1.3rem] block mb-3 bg-[#FF6B00]/10 px-4 py-1.5 rounded-full border border-[#FF6B00]/20 w-fit mx-auto">
                Welcome to GATS Academy
              </span>
              <h1 className="title text-[3.8rem] sm:text-[5.4rem] md:text-[6.4rem] font-heading font-extrabold text-white leading-[1.1] tracking-tight">
                GATS Academy — Nền Tảng Đào Tạo <br />
                <span className="text-[#FF6B00]">AI &amp; Enterprise Workflow</span> Hàng Đầu
              </h1>
            </div>

            <p className="text-[1.7rem] sm:text-[1.9rem] text-slate-300 max-w-3xl mx-auto mb-10 font-normal leading-relaxed">
              Hệ thống chương trình chuẩn hóa giúp cá nhân và doanh nghiệp làm chủ công nghệ trí tuệ nhân tạo, tự động hóa luồng làm việc thực tế và tối ưu chỉ số ROI.
            </p>

            {/* Central Hero Artwork Display (Edubost xb-hero-img) */}
            <div className="xb-hero-img max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 relative group">
              <img
                src="/images/landingpages/banner1.webp"
                alt="GATS AI Training Platform"
                className="w-full h-auto object-cover transform group-hover:scale-102 transition-transform duration-700"
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Edubost Hero Action Buttons Bar (hero-btns) */}
      <div className="hero-btns bg-[#FAF8F5] py-8 border-b border-amber-200/60 relative z-20">
        <Container size="xl">
          <div className="btns flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <Link
              href="/courses"
              className="thm-btn px-9 py-4 rounded-2xl bg-[#FF6B00] text-white font-extrabold text-[1.55rem] shadow-xl shadow-[#FF6B00]/25 hover:bg-[#e05e00] hover:scale-105 transition-all cursor-pointer"
            >
              Khám Phá Chương Trình
            </Link>

            <Link
              href="/courses"
              className="thm-btn px-9 py-4 rounded-2xl bg-[#0265FF] text-white font-extrabold text-[1.55rem] shadow-xl shadow-[#0265FF]/25 hover:bg-[#0052d4] hover:scale-105 transition-all cursor-pointer"
            >
              Đăng Ký Ngay
            </Link>

            <Link
              href="/about"
              className="thm-btn px-9 py-4 rounded-2xl bg-white border border-slate-300 text-slate-800 font-bold text-[1.55rem] shadow-md hover:bg-slate-50 transition-all cursor-pointer"
            >
              Tư Vấn Với Chuyên Gia
            </Link>
          </div>
        </Container>
      </div>
    </>
  );
}
