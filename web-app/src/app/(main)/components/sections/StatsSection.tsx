"use client";

import { Container } from "@/components/layout/Container";
import { Award, BookOpen, Building2, CheckCircle2, ShieldCheck, Users } from "lucide-react";

const statsList = [
  {
    number: "15.000+",
    label: "Học Viên Tốt Nghiệp",
    desc: "Đã hoàn thành các khóa đào tạo AI & Workflow thực chiến",
    icon: Users,
    color: "text-[#FF6B00]",
    bgColor: "bg-[#FF6B00]/10 border-[#FF6B00]/20",
  },
  {
    number: "50+",
    label: "Tập Đoàn & Doanh Nghiệp",
    desc: "Đối tác tin tưởng lựa chọn giải pháp cố vấn chuyển đổi số GATS",
    icon: Building2,
    color: "text-[#0265FF]",
    bgColor: "bg-[#0265FF]/10 border-[#0265FF]/20",
  },
  {
    number: "100%",
    label: "Bảo Chứng ROI & An Toàn",
    desc: "Cam kết chuẩn mã hóa bảo mật dữ liệu an toàn cho doanh nghiệp",
    icon: ShieldCheck,
    color: "text-emerald-600",
    bgColor: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    number: "98.5%",
    label: "Tỉ Lệ Đánh Giá 5 Sao",
    desc: "Sự hài lòng tuyệt đối từ phản hồi trực tiếp của học viên",
    icon: Award,
    color: "text-amber-600",
    bgColor: "bg-amber-500/10 border-amber-500/20",
  },
];

export function StatsSection() {
  return (
    <section className="relative w-full py-24 bg-[#0B0F17] text-white border-t border-white/10 overflow-hidden">
      {/* Background Graphic Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] bg-[#FF6B00]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 size-[400px] bg-[#0265FF]/10 rounded-full blur-[100px] pointer-events-none" />

      <Container size="xl" className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Big Headline & Intro */}
          <div className="lg:col-span-5 flex flex-col items-start space-y-6">
            <span className="text-[1.2rem] font-bold text-[#FF6B00] uppercase tracking-wider font-mono bg-[#FF6B00]/10 px-3.5 py-1 rounded-full border border-[#FF6B00]/20">
              THÀNH TỰU &amp; CON SỐ ẤN TƯỢNG
            </span>
            <h2 className="text-[3.4rem] sm:text-[4.2rem] font-heading font-extrabold text-white leading-[1.15]">
              Bảo Chứng Uy Tín <br />
              <span className="text-[#FF6B00]">Hàng Đầu Tại Việt Nam</span>
            </h2>
            <p className="text-[1.6rem] text-slate-300 font-normal leading-relaxed">
              GATS Academy tự hào là đơn vị tiên phong đào tạo và chuyển giao quy trình ứng dụng trí tuệ nhân tạo (AI Workflow) cho hàng nghìn cá nhân và tổ chức.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-[1.45rem] text-slate-200 font-medium">
                <CheckCircle2 className="size-5 text-[#FF6B00] shrink-0" />
                <span>Chứng nhận GATS có giá trị pháp lý &amp; xác thực toàn quốc</span>
              </div>
              <div className="flex items-center gap-3 text-[1.45rem] text-slate-200 font-medium">
                <CheckCircle2 className="size-5 text-[#FF6B00] shrink-0" />
                <span>Giảng dạy bởi đội ngũ cố vấn trưởng hơn 10 năm kinh nghiệm</span>
              </div>
            </div>
          </div>

          {/* Right Column: 2x2 Stats Grid (Edubost Fanfact Card Grid Style) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {statsList.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md hover:border-white/20 transition-all duration-300 flex flex-col justify-between"
                >
                  <div className={`size-14 rounded-2xl ${stat.bgColor} border flex items-center justify-center mb-6`}>
                    <Icon className={`size-7 ${stat.color}`} />
                  </div>
                  <div>
                    <div className={`text-[4rem] sm:text-[4.6rem] font-heading font-extrabold ${stat.color} leading-none mb-2`}>
                      {stat.number}
                    </div>
                    <h3 className="text-[1.8rem] font-bold text-white mb-2">
                      {stat.label}
                    </h3>
                    <p className="text-[1.35rem] text-slate-400 font-normal leading-relaxed">
                      {stat.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
