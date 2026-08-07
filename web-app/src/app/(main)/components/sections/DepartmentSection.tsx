"use client";

import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { ArrowRight, BookOpen, Brain, Cpu, Database, ShieldCheck, Sparkles, TrendingUp, Users } from "lucide-react";

const departments = [
  {
    id: "economics",
    title: "Kinh Tế Số & Quản Trị AI",
    desc: "Tối ưu chi phí và tăng chỉ số ROI doanh nghiệp",
    icon: TrendingUp,
    count: "12 Khóa học",
    color: "from-amber-500/10 to-amber-500/5 text-[#FF6B00]",
  },
  {
    id: "technology",
    title: "Công Nghệ AI Agent & LLM",
    desc: "Làm chủ ChatGPT, Claude API & Multi-agent",
    icon: Brain,
    count: "18 Khóa học",
    color: "from-blue-500/10 to-blue-500/5 text-[#0265FF]",
  },
  {
    id: "automation",
    title: "Tự Động Hóa Workflow",
    desc: "Kết nối Make, n8n tự động 80% quy trình",
    icon: Cpu,
    count: "15 Khóa học",
    color: "from-[#FF6B00]/10 to-[#FF6B00]/5 text-[#FF6B00]",
  },
  {
    id: "analytics",
    title: "Phân Tích Dữ Liệu Enterprise",
    desc: "Trích xuất insight thông minh từ Big Data",
    icon: Database,
    count: "10 Khóa học",
    color: "from-emerald-500/10 to-emerald-500/5 text-emerald-600",
  },
  {
    id: "marketing",
    title: "Marketing AI & Content",
    desc: "Tạo hàng nghìn kịch bản và truyền thông",
    icon: Sparkles,
    count: "14 Khóa học",
    color: "from-purple-500/10 to-purple-500/5 text-purple-600",
  },
  {
    id: "security",
    title: "Bảo Mật Dữ Liệu AI",
    desc: "An toàn tuyệt đối dữ liệu nội bộ doanh nghiệp",
    icon: ShieldCheck,
    count: "8 Khóa học",
    color: "from-red-500/10 to-red-500/5 text-red-500",
  },
  {
    id: "research",
    title: "Nghiên Cứu & Phát Triển AI",
    desc: "Cập nhật các thuật toán và mô hình mới",
    icon: BookOpen,
    count: "9 Khóa học",
    color: "from-sky-500/10 to-sky-500/5 text-sky-600",
  },
  {
    id: "enterprise",
    title: "Vận Hành Doanh Nghiệp",
    desc: "Đào tạo nhân sự và chuyển đổi số toàn diện",
    icon: Users,
    count: "11 Khóa học",
    color: "from-amber-600/10 to-amber-600/5 text-amber-700",
  },
];

export function DepartmentSection() {
  return (
    <section className="w-full py-24 bg-white text-[#0B0F17] border-t border-amber-200/60 overflow-hidden">
      <Container size="xl">
        {/* Title Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-[1.2rem] font-bold text-[#FF6B00] uppercase tracking-wider font-mono bg-[#FF6B00]/10 px-3.5 py-1 rounded-full border border-[#FF6B00]/20">
            HỆ THỐNG DANH MỤC ĐÀO TẠO
          </span>
          <h2 className="text-[3.2rem] sm:text-[4.2rem] font-heading font-extrabold text-[#0B0F17] leading-tight">
            Chuyên Ngành &amp; Lĩnh Vực Đào Tạo Tại GATS
          </h2>
          <p className="text-[1.6rem] text-slate-600 font-normal leading-relaxed">
            Các chuyên ngành được thiết kế theo chuẩn thực chiến doanh nghiệp, giúp học viên dễ dàng lựa chọn lộ trình phù hợp với vị trí công việc.
          </p>
        </div>

        {/* 4-Column Grid Layout matching Edubost Department */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {departments.map((dept) => {
            const Icon = dept.icon;
            return (
              <Link
                key={dept.id}
                href={`/courses?category=${dept.id}`}
                className="group relative p-8 rounded-2xl bg-white border border-amber-200/80 shadow-md shadow-amber-950/5 hover:shadow-xl hover:border-[#FF6B00] transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className={`size-14 rounded-2xl bg-gradient-to-br ${dept.color} flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="size-7" />
                  </div>
                  <h3 className="text-[1.8rem] font-heading font-extrabold text-[#0B0F17] mb-2 group-hover:text-[#FF6B00] transition-colors">
                    {dept.title}
                  </h3>
                  <p className="text-[1.35rem] text-slate-500 font-normal leading-relaxed mb-6">
                    {dept.desc}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-[1.3rem] font-bold text-slate-400 group-hover:text-[#FF6B00] transition-colors">
                  <span>{dept.count}</span>
                  <ArrowRight className="size-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
