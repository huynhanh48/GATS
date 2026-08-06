"use client";

import { Container } from "@/components/layout/Container";
import { Award } from "lucide-react";

const accreditedPartners = [
  {
    id: "vcci",
    name: "Viện Kinh Tế Số VCCI",
    sub: "Viện KH & Công Nghệ",
    logoSrc: "/images/partners/vcci.svg",
  },
  {
    id: "fpt",
    name: "Hiệp Hội AI & Automation",
    sub: "Đối Tác AI FPT",
    logoSrc: "/images/partners/fpt.svg",
  },
  {
    id: "microsoft",
    name: "Liên Minh CĐS B2B",
    sub: "Microsoft Enterprise AI",
    logoSrc: "/images/partners/microsoft.svg",
  },
  {
    id: "google",
    name: "TT Đổi Mới Sáng Tạo",
    sub: "Google Cloud AI Partner",
    logoSrc: "/images/partners/google.svg",
  },
];

export function AccreditationBar() {
  return (
    <section className="w-full py-8 bg-[#FFFDF9] text-[#0B0F17] border-y border-amber-200/60 shadow-xs">
      <Container size="xl">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Left Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="size-11 rounded-2xl bg-[#FF6B00]/10 text-[#FF6B00] flex items-center justify-center font-bold border border-[#FF6B00]/20 shadow-xs">
              <Award className="size-6 text-[#FF6B00]" />
            </div>
            <div>
              <div className="text-[1.3rem] font-extrabold text-[#0B0F17] uppercase tracking-wide flex items-center gap-2">
                <span>ĐƠN VỊ LIÊN KẾT &amp; CHỨNG THỰC</span>
                <span className="text-[1.0rem] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Xác Thực 100%
                </span>
              </div>
              <div className="text-[1.2rem] text-slate-500 font-medium">
                Chứng nhận GATS có giá trị pháp lý &amp; xác thực trên toàn quốc
              </div>
            </div>
          </div>

          {/* Guaranteed Local Real Brand Logo Images */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full lg:w-auto">
            {accreditedPartners.map((unit) => (
              <div
                key={unit.id}
                className="flex items-center justify-center p-2 rounded-2xl bg-white border border-amber-200/80 shadow-sm transition-all hover:border-[#FF6B00] hover:shadow-md cursor-pointer overflow-hidden group min-w-[160px]"
              >
                <img
                  src={unit.logoSrc}
                  alt={unit.name}
                  className="h-10 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
