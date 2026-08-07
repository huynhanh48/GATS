"use client";

import { Container } from "@/components/layout/Container";
import { ShieldCheck } from "lucide-react";


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
            <img
              src="/logo.svg"
              alt="GATS Academy Logo"
              className="h-11 w-auto object-contain"
            />
            <div>
              <div className="text-[1.3rem] font-extrabold text-[#0B0F17] uppercase tracking-wide flex items-center gap-2">
                <span>ĐƠN VỊ LIÊN KẾT &amp; CHỨNG THỰC</span>
                <ShieldCheck className="size-5 text-[#FF6B00]" />
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
                className="flex items-center justify-center p-2 rounded-2xl bg-white border border-amber-200/80 shadow-sm min-w-[160px]"
              >
                <img
                  src={unit.logoSrc}
                  alt={unit.name}
                  className="h-10 w-auto object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
