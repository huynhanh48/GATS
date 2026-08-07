"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUp, PhoneCall } from "lucide-react";
import { Container } from "@/components/layout/Container";

export function Footer() {
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowTopBtn(true);
      } else {
        setShowTopBtn(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="footer bg-[#0B0F17] text-white relative z-20 pt-16 pb-8 border-t border-white/10 font-sans">
      <Container size="xl">
        {/* Footer CTA Top Bar (Edubost footer-cta) */}
        <div className="flex flex-col md:flex-row items-center justify-between pb-12 mb-12 border-b border-white/10 gap-6">
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-2xl bg-[#FF6B00]/15 text-[#FF6B00] flex items-center justify-center font-bold shrink-0 border border-[#FF6B00]/30">
              <PhoneCall className="size-7 text-[#FF6B00]" />
            </div>
            <div>
              <div className="text-[1.2rem] text-slate-400 uppercase font-mono tracking-wider font-bold">
                TƯ VẤN HỖ TRỢ 24/7
              </div>
              <div className="text-[1.5rem] font-medium text-slate-200">
                Nhận tư vấn miễn phí lộ trình đào tạo AI thực chiến cùng chuyên gia GATS
              </div>
            </div>
          </div>

          <div className="shrink-0 text-right">
            <div className="text-[1.2rem] text-slate-400 uppercase font-mono tracking-wider">
              HOTLINE CHÍNH THỨC
            </div>
            <div className="text-[2.6rem] font-heading font-extrabold text-[#FF6B00]">
              +84 (024) 8888-6868
            </div>
          </div>
        </div>

        {/* 4 Widget Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 mb-16 text-slate-300">
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-block mb-6">
              <img src="/logo.svg" alt="GATS Academy Logo" className="h-10 w-auto object-contain" />
            </Link>
            <p className="text-[1.45rem] text-slate-400 leading-relaxed mb-6 font-normal">
              GATS Academy là hệ thống đào tạo ứng dụng trí tuệ nhân tạo (AI) thực chiến cho cá nhân và tổ chức, hỗ trợ tối ưu luồng công việc tự động hóa và đo lường chỉ số ROI rõ ràng.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="size-10 rounded-xl bg-white/10 flex items-center justify-center text-slate-300 hover:bg-[#FF6B00] hover:text-white transition-all" aria-label="Facebook">
                <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              <a href="#" className="size-10 rounded-xl bg-white/10 flex items-center justify-center text-slate-300 hover:bg-[#FF6B00] hover:text-white transition-all" aria-label="LinkedIn">
                <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.88a1.45 1.45 0 1 0 0 2.9 1.45 1.45 0 0 0 0-2.9z" />
                </svg>
              </a>
              <a href="#" className="size-10 rounded-xl bg-white/10 flex items-center justify-center text-slate-300 hover:bg-[#FF6B00] hover:text-white transition-all" aria-label="Instagram">
                <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a href="#" className="size-10 rounded-xl bg-white/10 flex items-center justify-center text-slate-300 hover:bg-[#FF6B00] hover:text-white transition-all" aria-label="YouTube">
                <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Col 2: Admissions Links */}
          <div className="lg:col-span-3">
            <h4 className="text-[1.6rem] font-bold text-white mb-6 uppercase tracking-wider font-mono">
              Chương Trình Đào Tạo
            </h4>
            <ul className="space-y-3.5 text-[1.45rem]">
              <li><Link href="/courses" className="hover:text-[#FF6B00] transition-colors">AI Cơ Bản Miễn Phí</Link></li>
              <li><Link href="/courses?tier=advanced" className="hover:text-[#FF6B00] transition-colors">AI Nâng Cao &amp; Workflow</Link></li>
              <li><Link href="/courses?format=offline" className="hover:text-[#FF6B00] transition-colors">Lớp Offline &amp; Workshop</Link></li>
              <li><Link href="/courses?category=security" className="hover:text-[#FF6B00] transition-colors">Bảo Mật Dữ Liệu AI Enterprise</Link></li>
              <li><Link href="/about" className="hover:text-[#FF6B00] transition-colors">Đào Tạo In-house Doanh Nghiệp</Link></li>
            </ul>
          </div>

          {/* Col 3: Quick Links */}
          <div className="lg:col-span-3">
            <h4 className="text-[1.6rem] font-bold text-white mb-6 uppercase tracking-wider font-mono">
              Thông Tin &amp; Hỗ Trợ
            </h4>
            <ul className="space-y-3.5 text-[1.45rem]">
              <li><Link href="/about" className="hover:text-[#FF6B00] transition-colors">Về GATS Academy</Link></li>
              <li><Link href="/posts" className="hover:text-[#FF6B00] transition-colors">Tin Tức &amp; Tri Thức AI</Link></li>
              <li><Link href="/faq" className="hover:text-[#FF6B00] transition-colors">Câu Hỏi Thường Gặp (FAQ)</Link></li>
              <li><Link href="/contact" className="hover:text-[#FF6B00] transition-colors">Liên Hệ Đăng Ký</Link></li>
              <li><Link href="/privacy" className="hover:text-[#FF6B00] transition-colors">Chính Sách Bảo Mật</Link></li>
            </ul>
          </div>

          {/* Col 4: Fast CTA Links */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <h4 className="text-[1.6rem] font-bold text-white mb-3 uppercase tracking-wider font-mono">
              Thao Tác Nhanh
            </h4>
            <Link
              href="/courses"
              className="w-full text-center px-4 py-3 rounded-xl bg-[#FF6B00] hover:bg-[#e05e00] text-white font-extrabold text-[1.4rem] transition-all cursor-pointer"
            >
              Đăng Ký Khóa Học
            </Link>
            <Link
              href="/about"
              className="w-full text-center px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-[1.4rem] transition-all cursor-pointer border border-white/15"
            >
              Lộ Trình Cố Vấn
            </Link>
            <Link
              href="/contact"
              className="w-full text-center px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-[1.4rem] transition-all cursor-pointer border border-white/15"
            >
              Tư Vấn Trực Tiếp
            </Link>
          </div>
        </div>

        {/* Copyright & Scroll To Top */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[1.35rem] text-slate-400">
          <p>Copyright © {new Date().getFullYear()} GATS Academy. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Bảo chứng bởi GATS Enterprise Advisory</span>
          </div>

          {/* Floating Scroll to Top button */}
          <button
            onClick={scrollToTop}
            className={`fixed right-8 bottom-8 z-50 bg-[#FF6B00] text-white p-4 rounded-2xl hover:bg-[#e05e00] transition-all duration-300 shadow-2xl hover:-translate-y-1 cursor-pointer ${
              showTopBtn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
            }`}
            aria-label="Cuộn lên đầu trang"
          >
            <ArrowUp className="size-6 text-white" />
          </button>
        </div>
      </Container>
    </footer>
  );
}
