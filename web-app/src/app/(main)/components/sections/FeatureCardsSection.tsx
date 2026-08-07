"use client";

import { Container } from "@/components/layout/Container";
import { ArrowRight, Award, Briefcase, Users } from "lucide-react";
import Link from "next/link";

const features = [
  {
    id: 1,
    title: "Học Bổng & Hỗ Trợ Học Phí",
    desc: "Chương trình tài trợ 100% học phí AI cơ bản cho nhân sự doanh nghiệp",
    icon: Award,
    link: "/about",
    bgColor: "bg-[#FF6B00]",
  },
  {
    id: 2,
    title: "Phát Triển Sự Nghiệp AI",
    desc: "Lộ trình cố vấn 1:1 cùng chuyên gia giúp thăng tiến vị trí công việc",
    icon: Briefcase,
    link: "/courses",
    bgColor: "bg-[#0265FF]",
  },
  {
    id: 3,
    title: "Mạng Lưới Cựu Học Viên (25K+)",
    desc: "Kết nối cộng đồng nhân sự AI Enterprise và trao đổi cơ hội hợp tác",
    icon: Users,
    link: "/about",
    bgColor: "bg-[#0B0F17]",
  },
];

export function FeatureCardsSection() {
  return (
    <section className="w-full py-12 bg-[#FAF8F5] text-[#0B0F17] -mt-8 relative z-20">
      <Container size="xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="group relative p-8 rounded-3xl bg-white border border-amber-200/80 shadow-xl shadow-amber-950/5 hover:-translate-y-2 hover:border-[#FF6B00] transition-all duration-300 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className={`size-16 rounded-2xl ${item.bgColor} text-white flex items-center justify-center font-bold shadow-lg shadow-black/10 group-hover:scale-110 transition-transform`}>
                    <Icon className="size-8 text-white" />
                  </div>
                  <span className="text-[1.8rem] font-extrabold text-slate-300 group-hover:text-[#FF6B00] transition-colors font-mono">
                    0{item.id}
                  </span>
                </div>

                <div>
                  <h3 className="text-[2rem] font-heading font-extrabold text-[#0B0F17] mb-3 group-hover:text-[#FF6B00] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[1.45rem] text-slate-600 font-normal leading-relaxed mb-6">
                    {item.desc}
                  </p>
                </div>

                <Link
                  href={item.link}
                  className="inline-flex items-center gap-2 text-[1.4rem] font-bold text-[#FF6B00] group-hover:translate-x-1 transition-transform"
                >
                  <span>Xem chi tiết</span>
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
