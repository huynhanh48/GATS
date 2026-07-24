"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Bell,
  BookOpen,
  Clock3,
  Download,
  LayoutDashboard,
  Search,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";

const brand = "#0070EB";

const stats = [
  { label: "Khóa học", value: "4", icon: BookOpen },
  { label: "Bài tập", value: "38", icon: LayoutDashboard },
  { label: "Giờ học", value: "120h", icon: Clock3 },
] as const;

const activeCourses = [
  { name: "Prompt Engineering", progress: "85%", tone: "text-brand-primary" },
  { name: "AI Automation", progress: "42%", tone: "text-primary" },
  { name: "Data Analysis", progress: "12%", tone: "text-brand-primary" },
] as const;

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center overflow-hidden px-4 pb-16 pt-32 transition-colors">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div
          className="absolute top-[-10%] left-1/2 h-[600px] w-[1000px] -translate-x-1/2 rounded-full blur-[120px]"
          style={{ backgroundColor: `${brand}18` }}
        />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <div className="relative z-20 mx-auto flex w-full max-w-2xl flex-col items-center pt-8 text-center lg:mx-0 lg:items-start lg:pt-12 lg:text-left">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-6 w-full text-balance text-4xl leading-[1.15] font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-5xl"
          >
            Xây dựng Tác Nhân AI{" "}
            <span className="bg-linear-to-r from-brand-primary via-primary to-brand-primary bg-clip-text text-transparent">
              GATS Academy
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-10 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg"
          >
            Nền tảng đào tạo trí tuệ nhân tạo chuyên sâu và dễ ứng dụng cho
            doanh nghiệp. Giải pháp toàn diện để làm chủ công nghệ và tạo kết
            quả trong công việc thực tế.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12 flex flex-wrap items-center justify-center gap-4 lg:justify-start"
          >
            <Button size="lg" asChild className="h-12 rounded-full px-8">
              <Link href="/courses">Bắt đầu ngay</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="h-12 rounded-full px-8 text-brand-primary"
            >
              <Link href="/about">Tìm hiểu thêm</Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center gap-4"
          >
            <div className="flex -space-x-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="relative z-10 size-10 overflow-hidden rounded-full border-2 border-background bg-muted transition-transform hover:z-20 hover:scale-110"
                >
                  <img
                    src={`/professional/person-${i}.jpg`}
                    alt=""
                    className="size-full object-cover"
                  />
                </div>
              ))}
            </div>
            <div className="text-left text-sm leading-snug text-muted-foreground">
              <span className="font-semibold text-foreground">50+ chuyên gia</span>{" "}
              đồng hành
              <br />
              Hỗ trợ hơn{" "}
              <span className="font-semibold text-brand-primary">2000+</span>{" "}
              học viên
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 32, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex w-full items-center justify-center"
        >
          <div
            className="pointer-events-none absolute -inset-6 rounded-[2rem] blur-2xl"
            style={{ backgroundColor: `${brand}14` }}
          />
          <Surface elevated className="relative w-full overflow-hidden p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between border-b border-divider pb-4">
              <div className="flex items-center gap-3">
                <Image
                  src="/images/logo/logo-icon.svg"
                  alt=""
                  width={40}
                  height={40}
                  className="size-10"
                />
                <div>
                  <p className="font-semibold text-foreground">Không gian học AI</p>
                  <p className="text-sm text-muted-foreground">
                    Theo dõi tiến độ và khóa học đang học
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-semibold text-brand-primary">
                Live preview
              </span>
            </div>

            <div className="mb-5 grid gap-3 sm:grid-cols-3">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-border bg-background p-4"
                  >
                    <Icon
                      className="mb-2 size-4 text-brand-primary"
                      aria-hidden="true"
                    />
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="mt-1 text-xl font-bold text-foreground">
                      {stat.value}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="space-y-3">
              {activeCourses.map((course) => (
                <div
                  key={course.name}
                  className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {course.name}
                    </p>
                    <p className="text-xs text-muted-foreground">Đang học</p>
                  </div>
                  <span className={`text-sm font-bold ${course.tone}`}>
                    {course.progress}
                  </span>
                </div>
              ))}
            </div>
          </Surface>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.35 }}
        className="relative z-10 mt-16 w-full max-w-6xl px-2 pb-8 sm:px-4"
      >
        <div
          className="pointer-events-none absolute top-1/2 left-1/2 h-[90%] w-[90%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50 blur-[100px]"
          style={{ backgroundColor: `${brand}18` }}
        />
        <Surface
          elevated
          className="relative overflow-hidden border-brand-primary/25"
          style={{
            boxShadow: `0 25px 50px -12px rgb(0 112 235 / 18%), 0 0 0 1px ${brand}22`,
          }}
        >
          <div className="flex h-14 items-center justify-between border-b border-divider bg-card px-4">
            <div className="flex w-56 items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-[#ff5f56]" />
                <div className="size-3 rounded-full bg-[#ffbd2e]" />
                <div className="size-3 rounded-full bg-[#27c93f]" />
              </div>
              <div className="ml-2 flex items-center gap-2">
                <Sparkles className="size-4 text-brand-primary" aria-hidden="true" />
                <span className="text-sm font-bold tracking-wide text-foreground">
                  GATS Academy
                </span>
              </div>
            </div>
            <div className="mx-4 hidden flex-1 justify-center md:flex">
              <div className="flex w-full max-w-sm items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5">
                <Search className="size-3.5 text-muted-foreground" aria-hidden="true" />
                <span className="text-xs text-muted-foreground">Tìm khóa học...</span>
              </div>
            </div>
            <div className="hidden items-center gap-4 md:flex">
              <Bell className="size-4 text-muted-foreground" aria-hidden="true" />
              <Download className="size-4 text-muted-foreground" aria-hidden="true" />
              <div className="flex items-center gap-2">
                <div className="size-8 overflow-hidden rounded-full border border-border bg-linear-to-tr from-brand-primary to-primary">
                  <img
                    src="/professional/person-2.jpg"
                    alt=""
                    className="size-full object-cover opacity-90"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-foreground">Học viên</span>
                  <span className="text-[10px] text-muted-foreground">Premium</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid min-h-[320px] bg-background lg:grid-cols-[220px_1fr]">
            <aside className="hidden flex-col gap-2 border-r border-divider p-4 lg:flex">
              {[
                { label: "Tổng quan", active: true },
                { label: "Khóa học", active: false },
                { label: "Dự án AI", active: false },
                { label: "Chứng chỉ", active: false },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                    item.active
                      ? "bg-brand-primary/10 text-brand-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </div>
              ))}
            </aside>

            <div className="p-5 sm:p-6">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                  Chào mừng trở lại!
                </h2>
                <div className="flex gap-2">
                  <span className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
                    Thêm dự án
                  </span>
                  <span className="rounded-md border border-brand-primary/40 bg-brand-primary/10 px-3 py-1.5 text-xs font-medium text-brand-primary">
                    Tiếp tục học
                  </span>
                </div>
              </div>

              <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[
                  ["Khóa học", "4"],
                  ["Dự án AI", "12"],
                  ["Bài tập xong", "38"],
                  ["Giờ học", "120h"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]"
                  >
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="mt-1 text-xl font-semibold text-foreground">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)] lg:col-span-2">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">
                      Tiến trình học tập
                    </p>
                    <span className="rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground">
                      Tuần này
                    </span>
                  </div>
                  <p className="mb-4 text-3xl font-semibold text-foreground">
                    32.5h{" "}
                    <span className="text-xs font-normal text-emerald-600">↑ 12%</span>
                  </p>
                  <svg
                    className="h-[140px] w-full"
                    viewBox="0 0 100 40"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M0,35 C10,35 15,25 25,25 C35,25 35,15 45,20 C55,25 55,5 70,10 C80,15 85,5 100,8 L100,40 L0,40 Z"
                      fill="url(#hero-chart-grad)"
                      opacity="0.25"
                    />
                    <path
                      d="M0,35 C10,35 15,25 25,25 C35,25 35,15 45,20 C55,25 55,5 70,10 C80,15 85,5 100,8"
                      fill="none"
                      stroke={brand}
                      strokeWidth="1.5"
                    />
                    <defs>
                      <linearGradient id="hero-chart-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={brand} stopOpacity="1" />
                        <stop offset="100%" stopColor={brand} stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <circle
                      cx="70"
                      cy="10"
                      r="2.5"
                      fill={brand}
                      className="animate-pulse"
                    />
                  </svg>
                </div>

                <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
                  <p className="mb-4 text-sm font-medium text-foreground">
                    Khóa học đang học
                  </p>
                  <div className="space-y-4">
                    {activeCourses.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {item.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground">Đang học</p>
                        </div>
                        <span className={`text-xs font-semibold ${item.tone}`}>
                          {item.progress}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Surface>
      </motion.div>
    </section>
  );
}
