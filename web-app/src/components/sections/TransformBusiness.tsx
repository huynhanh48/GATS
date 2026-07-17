"use client";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import React from "react";

const businessCases = [
  {
    badge: "Chăm sóc khách hàng",
    title: "Hỗ trợ thông minh 24/7",
    description: "Triển khai trợ lý AI xử lý thắc mắc, giải quyết vấn đề và tự động chuyển giao các trường hợp phức tạp cho nhân viên.",
    metric: "95% hài lòng, Giảm 80% chi phí",
  },
  {
    badge: "Bán hàng & Marketing",
    title: "Tự động hóa tìm kiếm khách hàng",
    description: "Trợ lý AI đánh giá khách hàng tiềm năng, cá nhân hóa nội dung tiếp cận và tự động đặt lịch hẹn.",
    metric: "Tăng 3x chuyển đổi, Tiết kiệm 60% thời gian",
  },
  {
    badge: "Vận hành",
    title: "Tự động hóa quy trình",
    description: "Tối ưu hóa luồng công việc với các tác nhân AI xử lý nhập liệu, tài liệu và điều phối nhiệm vụ.",
    metric: "Xử lý nhanh hơn 70%, Độ chính xác 90%",
  },
  {
    badge: "Nghiên cứu & Phân tích",
    title: "Phân tích Dữ liệu Thông minh",
    description: "Trợ lý ảo phân tích khối lượng lớn dữ liệu, tạo thông tin chuyên sâu và báo cáo toàn diện một cách tự động.",
    metric: "Thông tin nhanh hơn 10x, Bao phủ 100% dữ liệu",
  },
];

export function TransformBusiness() {
  return (
    <section className="w-full py-24 relative z-20 bg-transparent">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Chuyển đổi số <span className="text-primary">Doanh nghiệp</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Trợ lý AI tự động hóa và nâng cao hiệu suất trên toàn bộ tổ chức của bạn.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {businessCases.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true, margin: "-50px" }}
              className="rounded-2xl border border-border/40 bg-card p-8 flex flex-col group hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-[0_0_40px_rgba(0,112,235,0.1)]"
            >
              <div className="mb-4">
                <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                  {item.badge}
                </span>
              </div>
              
              <h3 className="text-2xl font-semibold mb-3 text-foreground">{item.title}</h3>
              
              <p className="text-muted-foreground text-base leading-relaxed flex-1 mb-8">
                {item.description}
              </p>
              
              <div className="flex items-center gap-2 text-sm font-medium text-primary mt-auto pt-4 border-t border-border/30">
                <TrendingUp className="w-4 h-4" />
                <span>{item.metric}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
