"use client";

import { Bot, BrainCircuit, Network, Sparkles } from "lucide-react";
import { SectionHeader } from "@/components/ted/section-header";
import { SpotlightCard, AnimatedContent } from "@/components/react-bits";

const features = [
  {
    icon: BrainCircuit,
    title: "AI Productivity & Prompting",
    tagline: "Tăng 3x tốc độ công việc",
    description:
      "Làm chủ nghệ thuật viết Prompt nâng cao và làm việc cùng trợ lý AI chuyên biệt theo từng ngành nghề.",
    accent: "border-brand-primary/20 text-brand-primary bg-accent/60",
  },
  {
    icon: Network,
    title: "Workflow Automation",
    tagline: "Tự động hóa 80% tác vụ",
    description:
      "Kết nối n8n, Make và API để cắt giảm triệt để các thao tác thủ công lặp đi lặp lại trong doanh nghiệp.",
    accent: "border-primary/20 text-primary bg-primary/10",
  },
  {
    icon: Bot,
    title: "AI Agent Development",
    tagline: "Tác nhân tự chủ thông minh",
    description:
      "Thiết kế AI Agent có khả năng tự lập kế hoạch, truy vấn dữ liệu nội bộ và ra quyết định độc lập.",
    accent: "border-brand-primary/20 text-brand-primary bg-accent/60",
  },
  {
    icon: Sparkles,
    title: "Business Transformation",
    tagline: "Chuẩn hóa cho phòng ban",
    description:
      "Xây dựng lộ trình ứng dụng AI từ cấp quản lý đến nhân sự, đo lường ROI chuyển đổi số rõ ràng.",
    accent: "border-primary/20 text-primary bg-primary/10",
  },
];

export function FeatureSection() {
  return (
    <section className="relative w-full bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <AnimatedContent distance={30}>
          <SectionHeader
            eyebrow="Học để ứng dụng"
            title="Lý do chọn GATS Academy"
            description="Hệ sinh thái đào tạo AI tập trung vào năng lực thực hành, hiệu quả vận hành và sự đồng hành của chuyên gia."
          />
        </AnimatedContent>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <AnimatedContent key={feature.title} distance={30} delay={idx * 0.1}>
                <SpotlightCard className="p-6 sm:p-8">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex rounded-2xl bg-accent p-3.5 text-brand-primary">
                      <Icon className="size-6" aria-hidden="true" />
                    </span>
                    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${feature.accent}`}>
                      {feature.tagline}
                    </span>
                  </div>
                  <h3 className="mt-6 text-2xl font-bold font-heading text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-3 leading-relaxed text-muted-foreground font-sans">
                    {feature.description}
                  </p>
                </SpotlightCard>
              </AnimatedContent>
            );
          })}
        </div>
      </div>
    </section>
  );
}
