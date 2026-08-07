"use client";

import { Container } from "@/components/layout/Container";
import { Play, CheckCircle2, ShieldCheck, Zap, Award } from "lucide-react";
import { useState } from "react";

export function WhyChooseSection() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="w-full py-24 bg-[#FAF8F5] text-[#0B0F17] border-t border-amber-200/60 overflow-hidden">
      <Container size="xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Video Thumbnail with Play Button (Edubost Style) */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white group aspect-[16/10]">
              <img
                src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1000&auto=format&fit=crop&q=80"
                alt="GATS AI Training Video"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Play Overlay Button */}
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <button
                  onClick={() => setIsPlaying(true)}
                  aria-label="Play video"
                  className="size-20 rounded-full bg-[#FF6B00] text-white flex items-center justify-center shadow-2xl shadow-[#FF6B00]/50 hover:scale-110 transition-transform cursor-pointer border-4 border-white"
                >
                  <Play className="size-8 text-white ml-1 fill-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Why Choose Us Content & Progress Bars */}
          <div className="lg:col-span-6 flex flex-col items-start space-y-6">
            <span className="text-[1.2rem] font-bold text-[#FF6B00] uppercase tracking-wider font-mono bg-[#FF6B00]/10 px-3.5 py-1 rounded-full border border-[#FF6B00]/20">
              TẠI SAO CHỌN GATS ACADEMY
            </span>

            <h2 className="text-[3.4rem] sm:text-[4.4rem] font-heading font-extrabold text-[#0B0F17] leading-[1.12]">
              Lý Do Hàng Nghìn Doanh Nghiệp <br />
              <span className="text-[#FF6B00]">Tin Tưởng &amp; Đồng Hành</span>
            </h2>

            <p className="text-[1.6rem] text-slate-600 font-normal leading-relaxed">
              Chúng tôi không chỉ truyền tải lý thuyết công cụ mà tập trung giải quyết bài toán vận hành tự động hóa cụ thể của doanh nghiệp Việt Nam.
            </p>

            {/* Progress Bars */}
            <div className="w-full space-y-5 pt-2">
              <div>
                <div className="flex justify-between items-center text-[1.45rem] font-bold text-[#0B0F17] mb-2">
                  <span>Ứng Dụng Thực Chiến Ngay Trong Khóa Học</span>
                  <span className="text-[#FF6B00] font-mono">98%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full bg-[#FF6B00] rounded-full w-[98%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-[1.45rem] font-bold text-[#0B0F17] mb-2">
                  <span>Bảo Chứng ROI &amp; Tăng Năng Suất Vận Hành</span>
                  <span className="text-[#0265FF] font-mono">95%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full bg-[#0265FF] rounded-full w-[95%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-[1.45rem] font-bold text-[#0B0F17] mb-2">
                  <span>Bảo Mật Dữ Liệu An Toàn Tuyệt Đối</span>
                  <span className="text-emerald-600 font-mono">100%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[100%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
