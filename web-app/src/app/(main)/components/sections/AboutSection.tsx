"use client";

import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Award, Sparkles } from "lucide-react";

export function AboutSection() {
  return (
    <section className="w-full py-24 bg-white text-[#0B0F17] border-t border-amber-200/60 overflow-hidden">
      <Container size="xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Stacked Images with Badge (Matching Edubost About) */}
          <div className="lg:col-span-6 relative">
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-4 border-white max-w-lg">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80"
                alt="GATS Academy Campus & Training"
                className="w-full h-[420px] object-cover"
              />
            </div>

            {/* Overlapping Secondary Image */}
            <div className="hidden sm:block absolute -bottom-10 -right-4 z-20 w-[280px] h-[220px] rounded-3xl overflow-hidden border-4 border-white shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&auto=format&fit=crop&q=80"
                alt="AI Workshop Hands-on"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Floating Established Experience Badge */}
            <div className="absolute top-6 left-6 z-30 p-5 rounded-2xl bg-[#FF6B00] text-white shadow-xl flex items-center gap-4">
              <div className="size-12 rounded-xl bg-white/20 flex items-center justify-center font-bold">
                <Award className="size-7 text-white" />
              </div>
              <div>
                <div className="text-[2.2rem] font-heading font-extrabold leading-none">10+ Năm</div>
                <div className="text-[1.2rem] font-medium opacity-90">Kinh Nghiệm Cố Vấn</div>
              </div>
            </div>
          </div>

          {/* Right Column: Text & Features Content */}
          <div className="lg:col-span-6 flex flex-col items-start space-y-6">
            <span className="text-[1.2rem] font-bold text-[#FF6B00] uppercase tracking-wider font-mono bg-[#FF6B00]/10 px-3.5 py-1 rounded-full border border-[#FF6B00]/20">
              VỀ GATS ACADEMY
            </span>

            <h2 className="text-[3.4rem] sm:text-[4.4rem] font-heading font-extrabold text-[#0B0F17] leading-[1.12]">
              Khai Phá Tiềm Năng AI <br />
              <span className="text-[#FF6B00]">Kiến Tạo Tương Lai Doanh Nghiệp</span>
            </h2>

            <p className="text-[1.6rem] text-slate-600 font-normal leading-relaxed">
              GATS Academy là hệ thống đào tạo ứng dụng trí tuệ nhân tạo thực chiến hàng đầu. Chúng tôi chuyển giao các bộ kịch bản Prompt chuẩn hóa và luồng công việc tự động (Workflow) giúp gia tăng 300% hiệu suất vận hành.
            </p>

            {/* Checklist items */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-[1.5rem] font-bold text-[#0B0F17]">
                <CheckCircle2 className="size-5 text-[#FF6B00] shrink-0" />
                <span>Lộ trình linh hoạt: Từ Online Zoom Live đến Workshop Offline</span>
              </div>
              <div className="flex items-center gap-3 text-[1.5rem] font-bold text-[#0B0F17]">
                <CheckCircle2 className="size-5 text-[#FF6B00] shrink-0" />
                <span>Chứng nhận GATS có giá trị pháp lý &amp; xác thực toàn quốc</span>
              </div>
              <div className="flex items-center gap-3 text-[1.5rem] font-bold text-[#0B0F17]">
                <CheckCircle2 className="size-5 text-[#FF6B00] shrink-0" />
                <span>Cố vấn 1:1 trực tiếp cùng đội ngũ chuyên gia công nghệ</span>
              </div>
            </div>

            {/* Quote & CTA Row */}
            <div className="pt-4 flex flex-wrap items-center gap-6">
              <Button
                asChild
                className="bg-[#FF6B00] hover:bg-[#e05e00] text-white rounded-xl px-8 h-14 text-[1.55rem] font-extrabold shadow-xl shadow-[#FF6B00]/25 transition-all cursor-pointer border-none"
              >
                <Link href="/about" className="flex items-center gap-2">
                  <span>Tìm Hiểu Thêm</span>
                  <ArrowRight className="size-5 text-white" />
                </Link>
              </Button>

              <div className="flex items-center gap-3 border-l-2 border-amber-200 pl-4 py-1">
                <div>
                  <div className="text-[1.4rem] font-extrabold text-[#0B0F17]">Trần Minh Đức</div>
                  <div className="text-[1.2rem] text-slate-500 font-medium">Giám Đốc Cố Vấn GATS</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
