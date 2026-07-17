"use client";
import { motion } from "framer-motion";
import { Target, Workflow, BrainCircuit, Zap, ShieldCheck, BarChart3 } from "lucide-react";
import React from "react";

const features = [
  {
    title: "Trợ lý hướng mục tiêu",
    description: "Các tác nhân AI thấu hiểu mục tiêu và tự động xác định lộ trình tốt nhất để hoàn thành công việc một cách tối ưu.",
    icon: <Target className="w-5 h-5" />,
  },
  {
    title: "Điều phối đa tác vụ",
    description: "Phối hợp liền mạch nhiều trợ lý ảo làm việc cùng nhau trong các nhiệm vụ phức tạp với giao thức cộng tác tích hợp sẵn.",
    icon: <Workflow className="w-5 h-5" />,
  },
  {
    title: "Bộ nhớ nâng cao",
    description: "Quản lý bộ nhớ ngắn hạn và dài hạn giúp AI ghi nhớ ngữ cảnh, tăng cường độ chính xác trong các tương tác liên tục.",
    icon: <BrainCircuit className="w-5 h-5" />,
  },
  {
    title: "Xử lý thời gian thực",
    description: "Tốc độ phản hồi cực nhanh với độ trễ cực thấp, hỗ trợ xử lý dữ liệu luồng liên tục và triển khai tại biên (edge deployment).",
    icon: <Zap className="w-5 h-5" />,
  },
  {
    title: "Bảo mật doanh nghiệp",
    description: "Tuân thủ tiêu chuẩn khắt khe với mã hóa đầu cuối, kiểm soát truy cập theo vai trò (RBAC) và lưu vết mọi hoạt động.",
    icon: <ShieldCheck className="w-5 h-5" />,
  },
  {
    title: "Phân tích & Báo cáo",
    description: "Hệ thống dashboard toàn diện giúp bạn giám sát hiệu suất của AI, tối ưu hóa chi phí và đánh giá hiệu quả kinh doanh.",
    icon: <BarChart3 className="w-5 h-5" />,
  },
];

export function EnterpriseFeatures() {
  return (
    <section className="w-full py-24 relative z-20 bg-transparent">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-16 relative">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">
            Trợ lý AI cấp Doanh nghiệp
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto">
            Triển khai các trợ lý tự động mang lại hiệu suất thực tế trên quy mô lớn.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true, margin: "-50px" }}
              className="rounded-2xl border bg-card/50 text-card-foreground p-6 group hover:border-primary/50 hover:bg-card transition-all duration-300 hover:shadow-lg flex flex-col relative overflow-hidden"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 relative z-10">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2 relative z-10">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed flex-1 relative z-10">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
