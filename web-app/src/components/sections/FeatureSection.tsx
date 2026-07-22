"use client";
import { motion } from "framer-motion";
import { BrainCircuit, Network, Search, Bot } from "lucide-react";
import React from "react";
import { useTheme } from "next-themes";

export function FeatureSection() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";
  const badgeBg = isDark ? "rgba(30,41,59,0.5)" : "rgba(241,245,249,1)";
  const badgeBorder = isDark ? "rgba(71,85,105,0.5)" : "rgba(203,213,225,1)";
  const badgeText = isDark ? "rgba(203,213,225,1)" : "rgba(71,85,105,1)";

  return (
    <section className="w-full py-24 relative z-20 overflow-hidden bg-transparent">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-16 relative flex flex-col items-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-[10px] font-mono tracking-widest text-slate-600 dark:text-slate-300 mb-6 uppercase shadow-sm"
          >
            <span className="w-2 h-2 rounded-sm border border-blue-400/50 flex items-center justify-center opacity-70">
              <span className="w-1 h-1 bg-blue-400 rounded-sm"></span>
            </span>
            VƯỢT TRỘI SO VỚI PHẦN CÒN LẠI
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-foreground"
          >
            Lý do bạn nên chọn{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0070eb] via-[#c026d3] to-[#059669] dark:from-[#60a5fa] dark:via-[#e879f9] dark:to-[#34d399]">
              GATS Academy
            </span>
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto font-normal"
          >
            Hệ sinh thái đào tạo và ứng dụng AI thực chiến toàn diện nhất. Học thật, làm thật, ra kết quả thật với sự đồng hành của chuyên gia hàng đầu.
          </motion.p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:auto-rows-[240px]">

          {/* Left Tall Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="md:col-span-1 md:row-span-2 rounded-3xl border border-border dark:border-white/5 bg-card dark:bg-[#0f1423] p-8 flex flex-col relative overflow-hidden group hover:border-blue-500/30 transition-colors shadow-sm dark:shadow-none"
          >
            {/* Reliable inline style radial glow */}
            <div className="absolute inset-0 pointer-events-none dark:hidden" style={{ background: 'radial-gradient(circle at 0% 0%, rgba(0,112,235,0.08) 0%, transparent 60%)' }}></div>
            <div className="absolute inset-0 pointer-events-none hidden dark:block" style={{ background: 'radial-gradient(circle at 0% 0%, rgba(59,130,246,0.25) 0%, transparent 50%)' }}></div>
            <div className="w-12 h-12 rounded-2xl bg-muted dark:bg-[#1e293b]/80 text-blue-500 dark:text-blue-400 flex items-center justify-center mb-auto border border-blue-500/20 shadow-[0_0_20px_rgba(0,112,235,0.2)] relative z-10">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div className="mt-12 relative z-10">
              <h3 className="text-2xl font-bold text-foreground dark:text-white mb-3">AI Productivity</h3>
              <p className="text-muted-foreground dark:text-slate-400 text-sm leading-relaxed font-light">
                Trang bị tư duy và kỹ năng sử dụng AI để tăng hiệu suất làm việc cá nhân lên nhiều lần thông qua Prompt Engineering và AI Assistant.
              </p>
            </div>
          </motion.div>

          {/* Right Top Wide Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="md:col-span-2 md:row-span-1 rounded-3xl border border-border dark:border-white/5 bg-card dark:bg-[#0f1423] p-8 flex flex-col md:flex-row items-start md:items-center gap-6 relative overflow-hidden group hover:border-purple-500/30 transition-colors shadow-sm dark:shadow-none"
          >
            {/* Reliable inline style radial glow */}
            <div className="absolute inset-0 pointer-events-none dark:hidden" style={{ background: 'radial-gradient(circle at 0% 50%, rgba(217,70,239,0.07) 0%, transparent 50%)' }}></div>
            <div className="absolute inset-0 pointer-events-none hidden dark:block" style={{ background: 'radial-gradient(circle at 0% 50%, rgba(168,85,247,0.2) 0%, transparent 40%)' }}></div>
            <div className="w-14 h-14 shrink-0 rounded-2xl bg-muted dark:bg-[#1e293b]/80 text-[#d946ef] dark:text-[#c084fc] flex items-center justify-center border border-purple-500/20 shadow-[0_0_20px_rgba(217,70,239,0.2)] relative z-10">
              <Network className="w-7 h-7" />
            </div>
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-foreground dark:text-white mb-3">AI Workflow Automation</h3>
              <p className="text-muted-foreground dark:text-slate-400 text-sm leading-relaxed font-light">
                Kết nối các công cụ bằng n8n, Make và API để xây dựng hệ thống tự động hóa, giảm thao tác thủ công và tối ưu quy trình.
              </p>
            </div>
          </motion.div>

          {/* Right Bottom Left Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="md:col-span-1 md:row-span-1 rounded-3xl border border-border dark:border-white/5 bg-card dark:bg-[#0f1423] p-6 flex flex-col relative overflow-hidden group hover:border-cyan-500/30 transition-colors shadow-sm dark:shadow-none"
          >
            {/* Reliable inline style radial glow */}
            <div className="absolute inset-0 pointer-events-none dark:hidden" style={{ background: 'radial-gradient(circle at 0% 0%, rgba(16,185,129,0.08) 0%, transparent 60%)' }}></div>
            <div className="absolute inset-0 pointer-events-none hidden dark:block" style={{ background: 'radial-gradient(circle at 0% 0%, rgba(45,212,191,0.2) 0%, transparent 60%)' }}></div>
            <div className="w-12 h-12 rounded-2xl bg-muted dark:bg-[#1e293b]/80 text-[#10b981] dark:text-[#2dd4bf] flex items-center justify-center mb-auto border border-teal-500/20 shadow-[0_0_20px_rgba(16,185,129,0.2)] relative z-10">
              <Search className="w-5 h-5" />
            </div>
            <div className="mt-6 relative z-10">
              <h3 className="text-xl font-bold text-foreground dark:text-white mb-2">AI Agent Development</h3>
              <p className="text-muted-foreground dark:text-slate-400 text-sm leading-relaxed font-light">
                Thiết kế và triển khai AI Agent có khả năng tìm kiếm dữ liệu, lập kế hoạch, xử lý tác vụ và tương tác với nhiều hệ thống.
              </p>
            </div>
          </motion.div>

          {/* Right Bottom Right Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="md:col-span-1 md:row-span-1 rounded-3xl border border-border dark:border-white/5 bg-card dark:bg-[#0f1423] p-6 flex flex-col relative overflow-hidden group hover:border-amber-500/30 transition-colors shadow-sm dark:shadow-none"
          >
            {/* Reliable inline style radial glow */}
            <div className="absolute inset-0 pointer-events-none dark:hidden" style={{ background: 'radial-gradient(circle at 0% 0%, rgba(245,158,11,0.08) 0%, transparent 60%)' }}></div>
            <div className="absolute inset-0 pointer-events-none hidden dark:block" style={{ background: 'radial-gradient(circle at 0% 0%, rgba(245,158,11,0.2) 0%, transparent 60%)' }}></div>
            <div className="w-12 h-12 rounded-2xl bg-muted dark:bg-[#1e293b]/80 text-[#f59e0b] flex items-center justify-center mb-auto border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.2)] relative z-10">
              <Bot className="w-6 h-6" />
            </div>
            <div className="mt-6 relative z-10">
              <h3 className="text-xl font-bold text-foreground dark:text-white mb-2">AI Business Transformation</h3>
              <p className="text-muted-foreground dark:text-slate-400 text-sm leading-relaxed font-light">
                Xây dựng chiến lược ứng dụng AI cho doanh nghiệp từ đào tạo nhân sự, chuẩn hóa dữ liệu đến triển khai AI vào từng phòng ban.
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
