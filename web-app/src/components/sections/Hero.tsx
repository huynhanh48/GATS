"use client";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import React, { useEffect } from "react";
import { Robot3D } from "../common/Robot3D";

export function Hero() {
  const aiThemes = [
    { name: "Mặc định", color: "default", uiColor: "#0070eb" },
    { name: "Công nghệ", color: "#0070eb", uiColor: "#0070eb" },
    { name: "Sáng tạo", color: "#d946ef", uiColor: "#d946ef" },
    { name: "Năng lượng", color: "#10b981", uiColor: "#10b981" },
  ];

  const activeTheme = aiThemes[0];
  const themeColor = activeTheme.uiColor;

  useEffect(() => {
    document.documentElement.style.setProperty("--primary", themeColor);
  }, [themeColor]);

  return (
    <section className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center pt-32 pb-20 px-4 transition-colors duration-1000">
      {/* Background Glow */}
      <div className="absolute top-0 inset-0 w-full h-full z-0">
        <div
          className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] blur-[120px] rounded-[100%] pointer-events-none transition-colors duration-1000"
          style={{ backgroundColor: `${themeColor}20` }}
        ></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10 relative max-w-7xl mx-auto w-full">
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left relative z-20 w-full max-w-2xl pt-8 lg:pt-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-5xl md:text-6xl lg:text-[46px] font-bold tracking-tight text-foreground mb-6 leading-[1.1]"
          >
            Xây dựng Tác Nhân AI <span className="inline-block whitespace-nowrap bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 via-blue-600 to-green-500">GATS Academy</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-foreground/80 text-md md:text-md max-w-xl mb-10 leading-relaxed font-normal"
          >
            Nền tảng đào tạo trí tuệ nhân tạo chuyên sâu và dễ dàng ứng dụng cho doanh nghiệp. Giải pháp toàn diện của bạn để làm chủ công nghệ tương lai.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-12"
          >
            <Button size="lg" className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-8 h-12 font-medium">
              Bắt đầu ngay
            </Button>

            <Button size="lg" variant="outline" className="rounded-full bg-transparent border border-border text-foreground px-8 h-12 font-medium hover:bg-muted/10 hover:text-foreground transition-colors">
              Tìm hiểu thêm
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex items-center gap-4"
          >
            <div className="flex -space-x-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-muted overflow-hidden relative z-10 hover:z-20 transition-transform hover:scale-110">
                  <img src={`/professional/person-${i}.jpg`} alt={`Expert ${i}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div className="text-sm text-muted-foreground leading-snug text-left">
              <span className="text-foreground font-semibold">50+ chuyên gia</span> đồng hành<br />
              Hỗ trợ hơn <span className="text-[#0070eb] font-semibold">2000+</span> học viên
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 48, scale: 0.94 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="w-full h-[500px] lg:h-[620px] relative flex items-center justify-center"
        >
          <Robot3D themeColor={activeTheme.color} />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.95, rotateX: 15 }}
        animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
        transition={{ duration: 1.2, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ perspective: 1200 }}
        className="mt-20 w-full max-w-6xl z-10 relative px-4 sm:px-6 group pb-20"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] blur-[120px] rounded-[100%] pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-1000" style={{ backgroundColor: `${themeColor}20` }}></div>

        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="w-full relative"
        >
          {/* Outer Window Border */}
          <div className="w-full relative rounded-xl overflow-hidden border shadow-2xl flex flex-col font-sans bg-[#f8fafc] dark:bg-[#0a0a0a] border-black/5 dark:border-white/5" style={{ borderColor: `${themeColor}60`, boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px ${themeColor}30, 0 0 20px ${themeColor}20` }}>

            {/* Top Title Bar */}
            <div className="h-14 flex items-center justify-between px-4 bg-[#f8fafc] dark:bg-[#0a0a0a] border-b border-black/5 dark:border-white/5">
              <div className="flex items-center gap-4 w-64">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={themeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
                  <span className="font-bold text-sm tracking-wide text-slate-900 dark:text-white">GATS Academy</span>
                </div>
              </div>

              {/* Search */}
              <div className="flex-1 flex justify-start pl-4 md:pl-0 md:justify-start">
                <div className="flex items-center gap-2 rounded-md px-3 py-1.5 w-full max-w-sm bg-[#f1f5f9] dark:bg-[#141414] border border-black/5 dark:border-white/5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 dark:text-white/30"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                  <span className="text-xs text-slate-400 dark:text-white/30">Search...</span>
                </div>
              </div>

              {/* Right Actions */}
              <div className="hidden md:flex items-center gap-6">
                <div className="flex items-center gap-4 text-slate-500 dark:text-white/50">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="cursor-pointer transition-colors hover:text-slate-800 dark:hover:text-white"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" /></svg>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="cursor-pointer transition-colors hover:text-slate-800 dark:hover:text-white"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 overflow-hidden border border-black/5 dark:border-white/10">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" className="w-full h-full object-cover mix-blend-overlay opacity-90" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-slate-900 dark:text-white">Học viên</span>
                    <span className="text-[10px] text-slate-500 dark:text-white/40">Premium</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Body */}
            <div className="flex min-h-[500px] overflow-hidden bg-[#f8fafc] dark:bg-[#0a0a0a]">
              {/* Sidebar */}
              <div className="w-56 p-4 hidden lg:flex flex-col gap-6 border-r border-black/5 dark:border-white/5">
                <div className="flex flex-col gap-1">
                  {[
                    { label: "Tổng quan", icon: <><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></>, active: true },
                    { label: "Khóa học", icon: <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /> },
                    { label: "Dự án AI", icon: <><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" /><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" /><path d="M7 21h10" /><path d="M12 3v18" /><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" /></> },
                  ].map((item, i) => (
                    <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${item.active ? 'bg-blue-500/10 dark:bg-white/10 text-primary dark:text-white' : 'text-slate-500 dark:text-white/50 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'}`}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{item.icon}</svg>
                      {item.label}
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-1 mt-4">
                  <div className="text-[10px] font-bold px-3 tracking-wider text-slate-400 dark:text-white/30 mb-2">CÔNG CỤ</div>
                  {[
                    { label: "Phân tích", icon: <><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></> },
                    { label: "Chứng chỉ", icon: <><path d="M12 15V3" /><path d="m7 8 5-5 5 5" /><path d="M20 21H4v-8" /></> },
                    { label: "Hỗ trợ", icon: <><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></> },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium cursor-pointer text-slate-500 dark:text-white/50 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{item.icon}</svg>
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="flex-1 p-6 lg:p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-medium tracking-tight text-slate-900 dark:text-white">Chào mừng trở lại!</h2>
                  <div className="flex gap-3">
                    <button className="px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 transition-colors bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white/80 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
                      Thêm dự án
                    </button>
                    <button className="px-3 py-1.5 rounded-md text-xs font-medium border transition-colors shadow-lg" style={{ backgroundColor: `${themeColor}20`, borderColor: themeColor, boxShadow: `0 0 10px ${themeColor}40`, color: themeColor }}>
                      Tiếp tục học
                    </button>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: "Khóa học", value: "4", icon: <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /> },
                    { label: "Dự án AI", value: "12", icon: <><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" /><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" /><path d="M7 21h10" /><path d="M12 3v18" /><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" /></> },
                    { label: "Bài tập xong", value: "38", icon: <><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><path d="m9 16 2 2 4-4" /></> },
                    { label: "Giờ học", value: "120h", icon: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></> },
                  ].map((stat, i) => (
                    <div key={i} className="rounded-xl p-5 flex items-center gap-4 transition-colors bg-card dark:bg-[#141414] border border-border dark:border-white/5 shadow-sm dark:shadow-none">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-500 dark:text-white/50">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">{stat.icon}</svg>
                      </div>
                      <div>
                        <div className="text-xs mb-1 text-slate-500 dark:text-white/40">{stat.label}</div>
                        <div className="text-xl font-semibold text-slate-900 dark:text-white/90">{stat.value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Main Charts Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  {/* Chart */}
                  <div className="lg:col-span-2 rounded-xl p-6 flex flex-col bg-card dark:bg-[#141414] border border-border dark:border-white/5 shadow-sm dark:shadow-none">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium text-slate-700 dark:text-white/80">Tiến trình học tập</div>
                      <div className="px-2 py-1 rounded-md text-xs flex items-center gap-1 cursor-pointer bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/60">
                        Tuần này <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
                      </div>
                    </div>
                    <div className="text-3xl font-semibold mb-6 flex items-baseline gap-2 text-slate-900 dark:text-white">
                      32.5h <span className="text-xs text-green-500 font-normal">↑ 12%</span>
                    </div>
                    <div className="flex-1 relative w-full flex items-end pt-4 pb-6 mt-2">
                      <svg className="w-full h-[200px]" preserveAspectRatio="none" viewBox="0 0 100 40">
                        <line x1="0" y1="10" x2="100" y2="10" className="stroke-black/[0.08] dark:stroke-white/[0.05]" strokeWidth="0.5" />
                        <line x1="0" y1="20" x2="100" y2="20" className="stroke-black/[0.08] dark:stroke-white/[0.05]" strokeWidth="0.5" />
                        <line x1="0" y1="30" x2="100" y2="30" className="stroke-black/[0.08] dark:stroke-white/[0.05]" strokeWidth="0.5" />
                        <path d="M0,35 C10,35 15,25 25,25 C35,25 35,15 45,20 C55,25 55,5 70,10 C80,15 85,5 100,8 L100,40 L0,40 Z" fill={`url(#chart-grad)`} opacity="0.2" />
                        <path d="M0,35 C10,35 15,25 25,25 C35,25 35,15 45,20 C55,25 55,5 70,10 C80,15 85,5 100,8" fill="none" stroke={themeColor} strokeWidth="1.5" />
                        <defs>
                          <linearGradient id={`chart-grad`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={themeColor} stopOpacity="1" />
                            <stop offset="100%" stopColor={themeColor} stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <circle cx="70" cy="10" r="3" fill={themeColor} className="stroke-white dark:stroke-[#141414] animate-pulse" strokeWidth="1.5" />
                      </svg>
                      <div className="absolute top-[12%] left-[62%] border text-xs px-3 py-2 rounded-lg shadow-xl flex flex-col items-center bg-popover dark:bg-[#1a1a1a] border-border dark:border-white/10 text-slate-900 dark:text-white/90">
                        <span className="text-[10px] text-slate-400 dark:text-white/40 mb-1">Thứ 6, 2026</span>
                        <span className="font-semibold text-sm">8.5 giờ</span>
                      </div>
                      <div className="absolute bottom-0 w-full flex justify-between text-[11px] text-slate-400 dark:text-white/30">
                        <span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span>
                      </div>
                    </div>
                  </div>

                  {/* List */}
                  <div className="rounded-xl p-6 flex flex-col bg-card dark:bg-[#141414] border border-border dark:border-white/5 shadow-sm dark:shadow-none">
                    <div className="flex items-center justify-between mb-6">
                      <div className="text-sm font-medium text-slate-700 dark:text-white/80">Khóa học đang học</div>
                      <div className="text-xs cursor-pointer transition-colors text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white">
                        Xem tất cả
                      </div>
                    </div>

                    <div className="text-[11px] font-medium flex justify-between pb-3 mb-4 text-slate-400 dark:text-white/30 border-b border-black/5 dark:border-b-white/5">
                      <span>Khóa học</span>
                      <span>Tiến độ</span>
                    </div>

                    <div className="flex flex-col gap-5 flex-1">
                      {[
                        { name: "Prompt Engineering", icon: "🤖", color: "#d946ef", prog: "85%", status: "Đang học" },
                        { name: "AI Automation", icon: "⚡", color: "#10b981", prog: "42%", status: "Đang học" },
                        { name: "Data Analysis", icon: "📊", color: "#0070eb", prog: "12%", status: "Đang học" },
                        { name: "Machine Learning", icon: "🧠", color: "#f59e0b", prog: "0%", status: "Chưa học" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between group cursor-pointer">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                              {item.icon}
                            </div>
                            <div>
                              <div className="text-sm font-medium transition-colors text-slate-700 dark:text-white/80 group-hover:text-slate-950 dark:group-hover:text-white">{item.name}</div>
                              <div className="text-[10px] mt-0.5 text-slate-400 dark:text-white/40">{item.status}</div>
                            </div>
                          </div>
                          <div className="text-xs font-medium text-slate-600 dark:text-white/70">{item.prog}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
