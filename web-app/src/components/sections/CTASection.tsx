"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import React from "react";

export function CTASection() {
  return (
    <section className="w-full py-32 relative z-20 bg-transparent overflow-hidden border-t border-border/10">
      {/* Nền Gradient mờ ảo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none z-0"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Xây dựng <span className="text-primary">Trợ lý AI</span> đầu tiên của bạn
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10 text-balance">
            Tham gia cùng hàng ngàn học viên và doanh nghiệp đang tự động hóa công việc với các trợ lý AI thông minh từ GATS Academy.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="rounded-full px-8 w-full sm:w-auto text-base h-12 shadow-[0_0_30px_rgba(0,112,235,0.3)] hover:shadow-[0_0_40px_rgba(0,112,235,0.5)] transition-shadow">
              Bắt đầu miễn phí
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-8 w-full sm:w-auto text-base h-12 bg-transparent hover:bg-white/5 border-border/50">
              Đăng ký tư vấn
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
