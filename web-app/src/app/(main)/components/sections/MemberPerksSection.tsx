"use client";

import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Gift } from "lucide-react";

const memberPerks = [
  "Truy cập trọn bộ Khóa học AI Nâng cao & Workflow Doanh nghiệp",
  "Tặng kèm Bộ Công Cụ AI hỗ trợ làm việc chuyên sâu",
  "Tham gia các buổi Hỏi Đáp Online Trực Tiếp hàng tuần",
  "Cấp Chứng Nhận GATS sau khi hoàn thành lộ trình",
  "Tài liệu Prompt Library & Kịch bản Tự động hóa bản quyền",
];

export function MemberPerksSection() {
  return (
    <section className="w-full py-24 bg-[#FAF8F5] text-[#0B0F17] border-t border-amber-200/60">
      <Container size="xl">
        <div className="relative rounded-3xl overflow-hidden bg-linear-to-r from-[#FF6B00] via-[#FF8800] to-[#E05E00] text-white p-10 md:p-16 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-10 border-4 border-white">
          {/* Subtle Ambient Lighting */}
          <div className="absolute top-0 right-0 size-[400px] bg-white/10 rounded-full blur-3xl pointer-events-none" />

          {/* Left Side: Perks Description */}
          <div className="relative z-10 max-w-2xl flex flex-col items-start gap-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 text-white text-[1.2rem] font-bold uppercase tracking-wider backdrop-blur-md border border-white/30">
              <Gift className="size-4 text-amber-200" />
              <span>ĐẶC QUYỀN HỘI VIÊN GATS</span>
            </div>

            <h2 className="text-[3.2rem] sm:text-[4.2rem] font-heading font-extrabold text-white leading-tight">
              Gói Hội Viên: Học Nâng Cao + Tặng Bộ Công Cụ AI
            </h2>

            <p className="text-[1.6rem] text-white/95 leading-relaxed font-medium">
              Không chỉ là các bài giảng, hội viên GATS được trang bị sẵn hệ sinh thái công cụ hỗ trợ đi kèm để thực hành và ứng dụng công việc ngay lập tức.
            </p>

            <ul className="space-y-3.5 my-2 text-[1.4rem]">
              {memberPerks.map((perk, idx) => (
                <li key={idx} className="flex items-center gap-3 font-semibold text-white">
                  <CheckCircle2 className="size-5 text-amber-200 shrink-0" />
                  <span>{perk}</span>
                </li>
              ))}
            </ul>

            <Button
              asChild
              className="mt-2 rounded-xl px-8 h-13 text-[1.5rem] font-extrabold bg-white hover:bg-slate-100 text-[#FF6B00] shadow-xl transition-all cursor-pointer border-none"
            >
              <Link href="/courses" className="flex items-center gap-2.5">
                <span>Tham gia Gói Hội Viên</span>
                <ArrowRight className="size-4 text-[#FF6B00]" />
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
