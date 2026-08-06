"use client";

import { Container } from "@/components/layout/Container";
import { ShieldCheck, Award } from "lucide-react";

const accreditedUnits = [
  { name: "Viện Kinh Tế Số & Công Nghệ", code: "IDET" },
  { name: "Hiệp Hội AI & Automation VN", code: "VAIA" },
  { name: "Liên Minh Chuyển Đổi Số B2B", code: "DX-Alliance" },
  { name: "Trung Tâm Đổi Mới Sáng Tạo", code: "NIC Partner" },
];

export function AccreditationBar() {
  return (
    <section className="w-full py-8 bg-[#FFFDF9] text-[#0B0F17] border-y border-amber-200/60">
      <Container size="xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="size-10 rounded-xl bg-[#FF6B00]/10 text-[#FF6B00] flex items-center justify-center font-bold border border-[#FF6B00]/20">
              <Award className="size-5 text-[#FF6B00]" />
            </div>
            <div>
              <div className="text-[1.3rem] font-extrabold text-[#0B0F17] uppercase tracking-wide">
                ĐƠN VỊ LIÊN KẾT &amp; CHỨNG THỰC
              </div>
              <div className="text-[1.2rem] text-slate-500 font-medium">
                Chứng nhận GATS có giá trị xác thực trên toàn quốc
              </div>
            </div>
          </div>

          {/* Accredited Partners Logos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full md:w-auto">
            {accreditedUnits.map((unit) => (
              <div
                key={unit.code}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white border border-amber-200/80 text-slate-800 transition-all hover:border-[#FF6B00] shadow-xs"
              >
                <ShieldCheck className="size-4 text-[#FF6B00] shrink-0" />
                <span className="text-[1.2rem] font-bold tracking-tight">{unit.name}</span>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
