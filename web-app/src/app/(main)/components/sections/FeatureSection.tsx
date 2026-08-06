"use client";

import { Bot, BrainCircuit, Network, Sparkles, ArrowRight } from "lucide-react";
import { SpotlightCard, AnimatedContent } from "@/components/react-bits";
import { Container } from "@/components/layout/Container";
import Link from "next/link";

const pillars = [
  {
    icon: BrainCircuit,
    title: "1. AI Productivity & Prompting",
    tagline: "Tăng 3x Hiệu Suất",
    description:
      "Làm chủ nghệ thuật viết Prompt chuyên sâu và chuẩn hóa các trợ lý AI chuyên biệt theo từng bài toán thực tế phòng ban.",
    badgeColor: "bg-[#0265FF]/10 text-[#0265FF] border-[#0265FF]/20",
  },
  {
    icon: Network,
    title: "2. Workflow Automation",
    tagline: "Tự Động Hóa 80%",
    description:
      "Kết nối Make, n8n và các hệ thống API doanh nghiệp nhằm cắt giảm triệt để các tác vụ thủ công lặp đi lặp lại.",
    badgeColor: "bg-[#0265FF]/10 text-[#0265FF] border-[#0265FF]/20",
  },
  {
    icon: Bot,
    title: "3. AI Agent Development",
    tagline: "Tác Nhân Tự Chủ EU",
    description:
      "Thiết kế AI Agent thông minh có khả năng tự lập kế hoạch, phân tích dữ liệu nội bộ và phối hợp xử lý quy trình phức tạp.",
    badgeColor: "bg-[#0265FF]/10 text-[#0265FF] border-[#0265FF]/20",
  },
  {
    icon: Sparkles,
    title: "4. Business Transformation",
    tagline: "Cam Kết ROI Rõ Ràng",
    description:
      "Xây dựng chiến lược chuyển đổi số đồng bộ từ cấp quản lý đến nhân sự, đo lường chỉ số ROI doanh nghiệp minh bạch.",
    badgeColor: "bg-[#FF6B00]/10 text-[#FF6B00] border-[#FF6B00]/20",
  },
];

export function FeatureSection() {
  return (
    <section className="relative w-full bg-[#FFFDF9] text-[#0B0F17] py-24 border-t border-amber-200/60">
      <Container size="xl">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
          <span className="text-[1.2rem] font-bold text-[#FF6B00] uppercase tracking-wider mb-3 bg-[#FF6B00]/10 px-3.5 py-1 rounded-full border border-[#FF6B00]/20 font-mono">
            KHUNG NĂNG LỰC DOANH NGHIỆP
          </span>
          <h2 className="text-[3.2rem] sm:text-[4.2rem] font-heading font-extrabold text-[#0B0F17] leading-tight mb-4">
            4 Trụ Cột Đào Tạo AI Cấp Doanh Nghiệp
          </h2>
          <p className="text-[1.6rem] text-slate-600 font-normal leading-relaxed">
            Chương trình được chuẩn hóa giúp các tổ chức bứt phá năng suất vận hành và tối ưu chi phí.
          </p>
        </div>

        {/* Pillars Bento Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {pillars.map((pillar, index) => {
            const IconComponent = pillar.icon;
            return (
              <AnimatedContent key={pillar.title} distance={30} delay={index * 0.1}>
                <SpotlightCard className="p-8 sm:p-10 rounded-2xl bg-white border border-amber-200/80 hover:border-[#FF6B00]/60 transition-colors flex flex-col justify-between shadow-lg shadow-amber-950/5">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="size-14 rounded-xl bg-[#0265FF]/10 text-[#0265FF] flex items-center justify-center border border-[#0265FF]/20">
                        <IconComponent className="size-7 text-[#0265FF]" />
                      </div>
                      <span className="px-3 py-1 rounded-md bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/20 text-[1.2rem] font-bold font-mono">
                        {pillar.tagline}
                      </span>
                    </div>

                    <h3 className="text-[2.2rem] font-heading font-extrabold text-[#0B0F17] mb-3">
                      {pillar.title}
                    </h3>
                    <p className="text-[1.5rem] text-slate-600 leading-relaxed font-normal mb-6">
                      {pillar.description}
                    </p>
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-100">
                    <Link href="/courses" className="inline-flex items-center gap-1.5 text-[1.3rem] font-bold text-[#0265FF] hover:text-[#0052cc] transition-colors group">
                      <span>Xem lộ trình chi tiết</span>
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </SpotlightCard>
              </AnimatedContent>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

