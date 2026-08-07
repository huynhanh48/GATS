"use client";

import { Container } from "@/components/layout/Container";
import { Check, X } from "lucide-react";

export function WorkflowDifferentiator() {
  return (
    <section className="w-full py-24 bg-[#FAF8F5] text-[#0B0F17] border-t border-amber-200/60">
      <Container size="xl">
        {/* Section Title */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
          <span className="text-[1.2rem] font-bold text-[#FF6B00] uppercase tracking-wider mb-3 bg-[#FF6B00]/10 px-3.5 py-1 rounded-full border border-[#FF6B00]/20 font-mono">
            ĐIỂM NỔI TRỘI CẠNH TRANH ĐỘC QUYỀN
          </span>
          <h2 className="text-[3.2rem] sm:text-[4.2rem] font-heading font-extrabold text-[#0B0F17] leading-tight mb-4">
            Khóa Học GATS Có Gì Vượt Trội Hơn Thị Trường?
          </h2>
          <p className="text-[1.6rem] text-slate-600 font-normal leading-relaxed">
            Chúng tôi không dạy công cụ lẻ tẻ chung chung. GATS thiết kế luồng Workflow tự động hóa kết hợp nhiều công cụ AI từ A đến Z dành riêng cho bài toán doanh nghiệp Việt Nam.
          </p>
        </div>

        {/* Comparison Table Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Card 1: Market Generic Courses */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-lg shadow-amber-950/5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="size-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center font-bold">
                  <X className="size-5" />
                </div>
                <div>
                  <h3 className="text-[1.8rem] font-heading font-bold text-slate-700 dark:text-slate-300">
                    Khóa Học AI Trên Thị Trường
                  </h3>
                  <div className="text-[1.2rem] text-slate-400">Cách làm truyền thống chung chung</div>
                </div>
              </div>

              <ul className="space-y-4 text-[1.4rem] text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-3">
                  <X className="size-4 text-red-400 shrink-0 mt-1" />
                  <span>Dạy lý thuyết công cụ đơn lẻ (ChatGPT, Midjourney riêng biệt), thiếu tính kết nối.</span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="size-4 text-red-400 shrink-0 mt-1" />
                  <span>Không có chuyên đề về <strong>Bảo Mật Dữ Liệu AI Doanh Nghiệp</strong>.</span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="size-4 text-red-400 shrink-0 mt-1" />
                  <span>Chỉ học xong để biết, không tạo ra được quy trình vận hành tự động thực tế.</span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="size-4 text-red-400 shrink-0 mt-1" />
                  <span>Học phí cao nhưng không cam kết chỉ số đo lường hiệu quả (ROI).</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Card 2: GATS Enterprise Workflow (Our Superior Model) */}
          <div className="p-8 rounded-2xl bg-linear-to-b from-white to-[#EFF6FF] dark:from-slate-900 dark:to-slate-900/90 border-2 border-[#0265FF] flex flex-col justify-between shadow-xl shadow-[#0265FF]/10">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-[#0265FF] text-white flex items-center justify-center font-bold shadow-md shadow-[#0265FF]/20">
                    <Check className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-[1.8rem] font-heading font-extrabold text-[#0B0F17] dark:text-white">
                      Lộ Trình GATS Enterprise Workflow
                    </h3>
                    <div className="text-[1.2rem] text-[#0265FF] font-bold">Thực chiến khác biệt &amp; Giá tối ưu</div>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#FF6B00] text-white text-[1.1rem] font-bold uppercase">
                  Superior Workflow
                </span>
              </div>

              <ul className="space-y-4 text-[1.4rem] text-slate-800 dark:text-slate-200 font-semibold">
                <li className="flex items-start gap-3">
                  <Check className="size-5 text-[#0265FF] shrink-0 mt-0.5" />
                  <span><strong>AI Cơ Bản Miễn Phí 100%:</strong> Giúp mọi nhân sự nắm vững nền tảng trước khi nâng cao.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="size-5 text-[#0265FF] shrink-0 mt-0.5" />
                  <span><strong>Độc Quyền Bảo Mật Dữ Liệu:</strong> 1 Chương riêng hướng dẫn cách dùng AI an toàn tuyệt đối cho doanh nghiệp.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="size-5 text-[#0265FF] shrink-0 mt-0.5" />
                  <span><strong>Luồng Workflow Kết Hợp Multi-Tool:</strong> Kết nối Make, n8n, ChatGPT API, Claude để tự động hóa 80% công việc.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="size-5 text-[#0265FF] shrink-0 mt-0.5" />
                  <span><strong>Cạnh Tranh Về Giá &amp; Bảo Chứng ROI:</strong> Chi phí tối ưu nhất thị trường kèm <strong>Chứng Nhận GATS</strong> uy tín.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
