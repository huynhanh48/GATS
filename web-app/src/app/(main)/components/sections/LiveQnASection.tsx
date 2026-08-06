"use client";

import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Video, Calendar, Clock, ArrowRight } from "lucide-react";

export function LiveQnASection() {
  return (
    <section className="w-full py-20 bg-[#FAF8F5] text-[#0B0F17] border-t border-amber-200/60">
      <Container size="xl">
        <div className="bg-white rounded-3xl border border-amber-200/80 p-8 sm:p-12 shadow-xl shadow-amber-950/5 flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left info */}
          <div className="flex items-start gap-5 max-w-2xl">
            <div className="size-14 rounded-2xl bg-[#FF6B00]/10 text-[#FF6B00] flex items-center justify-center font-bold shrink-0 border border-[#FF6B00]/20">
              <Video className="size-7 text-[#FF6B00]" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-50 text-emerald-600 font-mono text-[1.1rem] font-bold mb-2 border border-emerald-200">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                LỊCH HỎI ĐÁP KHÓA HỌC TỰ ĐỘNG
              </div>
              <h3 className="text-[2.4rem] sm:text-[3rem] font-heading font-extrabold text-[#0B0F17] leading-tight mb-2">
                Buổi Hỏi Đáp Online Trực Tiếp Cùng Chuyên Gia
              </h3>
              <p className="text-[1.5rem] text-slate-600 font-normal leading-relaxed">
                Học viên được trực tiếp trao đổi, giải đáp mọi thắc mắc và nhận tư vấn tối ưu luồng công việc thực tế cùng đội ngũ chuyên gia GATS.
              </p>

              <div className="flex flex-wrap items-center gap-4 mt-4 font-semibold text-[1.3rem] text-slate-700">
                <div className="flex items-center gap-1.5">
                  <Calendar className="size-4 text-[#FF6B00]" />
                  <span>Thứ 5 Hàng Tuần</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="size-4 text-[#FF6B00]" />
                  <span>20:00 - 21:30 (Zoom Live)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Action Button */}
          <div className="shrink-0 w-full md:w-auto">
            <Button
              asChild
              className="w-full md:w-auto rounded-xl px-8 h-13 text-[1.5rem] font-extrabold bg-[#FF6B00] hover:bg-[#e05e00] text-white shadow-xl shadow-[#FF6B00]/25 transition-all cursor-pointer border-none"
            >
              <Link href="/courses" className="flex items-center justify-center gap-2">
                <span>Đăng ký tham gia Live Q&amp;A</span>
                <ArrowRight className="size-4 text-white" />
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
