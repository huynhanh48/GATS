import { Bot, BrainCircuit, Network, Search } from "lucide-react";

import { SectionHeader } from "@/components/ted/section-header";
import { Surface } from "@/components/ui/surface";

const features = [
  {
    icon: BrainCircuit,
    title: "AI Productivity",
    description:
      "Sử dụng AI để tăng hiệu suất cá nhân qua Prompt Engineering và trợ lý chuyên biệt.",
  },
  {
    icon: Network,
    title: "Workflow Automation",
    description:
      "Kết nối n8n, Make và API để giảm thao tác thủ công trong quy trình vận hành.",
  },
  {
    icon: Search,
    title: "AI Agent Development",
    description:
      "Thiết kế AI Agent có khả năng tìm kiếm, lập kế hoạch và xử lý tác vụ đa hệ thống.",
  },
  {
    icon: Bot,
    title: "Business Transformation",
    description:
      "Xây dựng chiến lược AI từ đào tạo nhân sự đến triển khai theo từng phòng ban.",
  },
];

export function FeatureSection() {
  return (
    <section className="w-full bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="Học để ứng dụng"
          title="Lý do chọn GATS Academy"
          description="Hệ sinh thái đào tạo AI tập trung vào năng lực thực hành, hiệu quả vận hành và sự đồng hành của chuyên gia."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Surface key={feature.title} className="p-6 sm:p-8">
                <span className="inline-flex rounded-xl bg-accent p-3 text-brand-primary">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <h3 className="mt-6 text-xl font-semibold">{feature.title}</h3>
                <p className="mt-3 leading-7 text-muted-foreground">{feature.description}</p>
              </Surface>
            );
          })}
        </div>
      </div>
    </section>
  );
}
