"use client";

import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Gift, Zap, ShieldCheck } from "lucide-react";
import { useState } from "react";

function EduGatsMark({ className = "h-7 w-6 text-[#FF6B00]" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 975 1265"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M831.151 658.012L932.75 760.012C988.85 816.312 988.65 907.512 932.35 963.612L753.85 1141.41L652.25 1039.41L830.75 861.612C868.55 824.012 881.05 770.612 868.35 722.612C862.05 698.912 849.751 676.612 831.151 658.012Z" />
      <path d="M143.95 631.113L702.85 1192.21L651.85 1243.01C632.95 1261.81 606.25 1268.01 582.25 1261.51C570.451 1258.31 559.25 1252.11 550.05 1242.81L143.55 834.713C125.05 816.113 112.65 793.713 106.35 770.113C93.6505 722.013 106.15 668.713 143.95 631.113Z" />
      <path d="M654.25 21.2126C682.35 49.4127 682.25 95.0126 654.05 123.013L143.95 631.113C106.15 668.713 93.6503 722.113 106.35 770.113C112.65 793.813 124.95 816.113 143.55 834.713L41.9503 732.713C-14.1497 676.413 -13.9497 585.213 42.3503 529.113L552.45 21.0127C580.65 -7.08735 626.25 -6.98735 654.25 21.2126Z" />
      <path d="M754.95 581.512L831.151 658.012C849.651 676.612 862.05 699.012 868.35 722.612C881.05 770.712 868.55 824.012 830.75 861.612L652.95 683.112C643.75 673.912 637.65 662.812 634.45 651.112C627.95 627.012 634.15 600.112 653.15 581.212C681.35 553.112 726.95 553.212 754.95 581.412V581.512Z" />
    </svg>
  );
}

const memberPerks = [
  "Truy cập trọn bộ Khóa học AI Nâng cao & Workflow Doanh nghiệp",
  "Tặng kèm Bộ Công Cụ AI hỗ trợ làm việc chuyên sâu",
  "Tham gia các buổi Hỏi Đáp Online Trực Tiếp hàng tuần cùng Chuyên gia",
  "Cấp Chứng Nhận GATS có giá trị xác thực trên toàn quốc",
  "Tài liệu Prompt Library & Kịch bản Tự động hóa bản quyền",
];

const perkBackgrounds = [
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1920&auto=format&fit=crop&q=80",
  "/images/landingpages/banner1.webp",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1920&auto=format&fit=crop&q=80",
];

export function MemberPerksSection() {
  const [bgIdx, setBgIdx] = useState(0);

  return (
    <section className="relative w-full py-20 sm:py-24 overflow-hidden text-white bg-slate-950 border-y border-white/10 shadow-2xl">
      {/* Full-Bleed Background Image Layer (High-Tech Ambient Artwork) */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 transform scale-102"
        style={{ backgroundImage: `url('${perkBackgrounds[bgIdx]}')` }}
      />

      {/* Dark Ambient Gradient Overlay (Sleek Tech Aesthetics, 100% Readability) */}
      <div className="absolute inset-0 bg-linear-to-r from-[#0B0F17]/95 via-[#0B0F17]/85 to-[#FF6B00]/30 pointer-events-none" />

      {/* Subtle Glowing Orbs */}
      <div className="absolute top-1/2 -translate-y-1/2 left-0 size-[450px] bg-[#FF6B00]/20 rounded-full blur-3xl pointer-events-none" />

      <Container size="xl" className="relative z-10 w-full">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left Side: Perks Description */}
          <div className="max-w-2xl flex flex-col items-start space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF6B00]/20 text-[#FF6B00] text-[1.2rem] font-bold uppercase tracking-wider backdrop-blur-md border border-[#FF6B00]/30 shadow-lg font-mono">
              <Gift className="size-4 text-[#FF6B00]" />
              <span>ĐẶC QUYỀN HỘI VIÊN GATS ACADEMY</span>
            </div>

            <h2 className="text-[3.6rem] sm:text-[4.6rem] lg:text-[5.2rem] font-heading font-extrabold text-white leading-[1.1] tracking-tight drop-shadow-lg">
              Gói Hội Viên: Học Nâng Cao <br />
              <span className="text-[#FF6B00]">
                + Tặng Bộ Công Cụ AI
              </span>
            </h2>

            <p className="text-[1.65rem] sm:text-[1.85rem] text-slate-200 leading-relaxed font-normal drop-shadow-md">
              Không chỉ là các bài giảng, hội viên GATS được trang bị sẵn hệ sinh thái công cụ hỗ trợ đi kèm để thực hành và ứng dụng công việc ngay lập tức.
            </p>

            <ul className="space-y-3.5 pt-2 text-[1.5rem] sm:text-[1.6rem]">
              {memberPerks.map((perk, idx) => (
                <li key={idx} className="flex items-center gap-3.5 font-semibold text-white drop-shadow-sm">
                  <CheckCircle2 className="size-6 text-[#FF6B00] shrink-0" />
                  <span>{perk}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4">
              <Button
                asChild
                className="bg-[#FF6B00] hover:bg-[#e05e00] text-white rounded-xl px-11 h-15 text-[1.65rem] font-extrabold shadow-2xl shadow-[#FF6B00]/30 transition-all hover:scale-105 border-none cursor-pointer"
              >
                <Link href="/courses" className="flex items-center gap-2.5">
                  <span>Tham gia Gói Hội Viên</span>
                  <ArrowRight className="size-5 text-white" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Side: Professional VIP Member Pass Card with GATS Orange Logo Mark */}
          <div className="w-full lg:w-1/3 flex flex-col items-center justify-center">
            <div className="w-full max-w-sm p-8 rounded-3xl bg-[#0B0F17]/80 backdrop-blur-xl border border-white/15 shadow-2xl space-y-6 text-left relative overflow-hidden">
              {/* Top Card Badge with GATS Orange Logo */}
              <div className="flex items-center justify-between">
                <div className="size-13 rounded-2xl bg-[#FF6B00]/20 border border-[#FF6B00]/30 flex items-center justify-center text-[#FF6B00] shadow-sm">
                  <EduGatsMark className="h-7 w-5 text-[#FF6B00]" />
                </div>
                <span className="text-[1.1rem] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 font-mono">
                  TIẾT KIỆM 65%
                </span>
              </div>

              {/* Title & Headline */}
              <div>
                <span className="text-[1.2rem] font-extrabold uppercase text-[#FF6B00] tracking-widest font-mono">
                  GATS VIP PASS
                </span>
                <h3 className="text-[2.4rem] font-heading font-extrabold text-white mt-1">
                  Full-Access Membership
                </h3>
              </div>

              {/* Benefits Checklist in Card */}
              <div className="space-y-3 pt-2 border-t border-white/10 text-[1.3rem]">
                <div className="flex items-center gap-2.5 text-slate-200">
                  <Zap className="size-4 text-[#FF6B00] shrink-0" />
                  <span>100+ Bài Giảng AI Real-World</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-200">
                  <ShieldCheck className="size-4 text-[#FF6B00] shrink-0" />
                  <span>Tặng 50+ Agent Prompt Templates</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-200">
                  <CheckCircle2 className="size-4 text-[#FF6B00] shrink-0" />
                  <span>Hỏi Đáp 1:1 Cùng Chuyên Gia</span>
                </div>
              </div>

              {/* Footer Note */}
              <div className="pt-2 text-[1.1rem] text-slate-400 font-medium">
                Cập nhật nội dung bài giảng mới hàng tháng
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Hidden Error Listener Image for Fallback cycling */}
      <img
        src={perkBackgrounds[bgIdx]}
        alt=""
        className="hidden"
        onError={() => {
          setBgIdx((prev) => (prev + 1) % perkBackgrounds.length);
        }}
      />
    </section>
  );
}
