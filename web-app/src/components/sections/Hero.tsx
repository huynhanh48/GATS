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
  ArrowRight,
  ShieldCheck,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { LightRays, ShinyText, BlurText, AnimatedContent } from "@/components/react-bits";
import { Container } from "@/components/layout/Container";

const brand = "#0070EB";

const stats = [
  { label: "Khóa học thực chiến", value: "4+", icon: BookOpen },
  { label: "Bài tập & Dự án", value: "38+", icon: LayoutDashboard },
  { label: "Giờ học thực hành", value: "120h+", icon: Clock3 },
] as const;

const activeCourses = [
  { name: "Prompt Engineering", progress: "85%", tone: "text-brand-primary" },
  { name: "AI Automation (n8n & Make)", progress: "42%", tone: "text-primary" },
  { name: "Enterprise AI Agent Development", progress: "12%", tone: "text-brand-primary" },
] as const;

export function Hero() {
  return (
    <section className="relative  flex min-h-[92vh] flex-col items-center justify-center overflow-hidden bg-background px-4 pb-20 pt-32 transition-colors">
      {/* React Bits Ambient Atmosphere Background */}
      <LightRays className="z-0 opacity-80" color1="0, 112, 235" color2="255, 118, 34" speed={1.2} />

      {/* Editorial First Viewport */}
      <Container size="lg" className="relative z-10 flex flex-col items-center text-center">
        {/* Brand Signal Badge with ShinyText */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-primary/20 bg-accent/80 px-4 py-1.5 text-xs font-semibold tracking-wide text-brand-primary backdrop-blur-md shadow-xs"
        >
          <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
          <span>GATS Academy</span>
          <span className="text-muted-foreground/40">•</span>
          <ShinyText text="Enterprise AI Training Platform" speed={4} className="font-bold" />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl text-balance font-heading text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl md:text-7xl lg:leading-[1.1]"
        >
          Xây dựng Tác Nhân AI{" "}
          <span className="bg-linear-to-r from-brand-primary via-primary to-brand-primary bg-clip-text text-transparent">
            Thực Chiến Cho Doanh Nghiệp
          </span>
        </motion.h1>

        {/* Subtitle with BlurText */}
        <div className="mt-6 max-w-2xl text-center">
          <BlurText
            text="Nền tảng đào tạo trí tuệ nhân tạo chuyên sâu và dễ ứng dụng. Giải pháp toàn diện giúp doanh nghiệp làm chủ công nghệ tương lai."
            delay={30}
            animateBy="words"
            direction="top"
            className="justify-center text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl font-sans"
          />
        </div>

        {/* Action Group */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Button
            size="lg"
            asChild
            className="h-13 rounded-full bg-primary px-8 text-base font-semibold text-white shadow-[0_0_24px_rgba(255,118,34,0.35)] transition-all duration-300 hover:scale-105 hover:bg-primary/90 hover:shadow-[0_0_32px_rgba(255,118,34,0.5)]"
          >
            <Link href="/courses" className="flex items-center gap-2">
              Bắt đầu ngay
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>

          <Button
            size="lg"
            variant="outline"
            asChild
            className="h-13 rounded-full border-brand-primary/30 bg-card/60 px-8 text-base font-semibold text-brand-primary backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-brand-primary hover:bg-accent"
          >
            <Link href="/about">Tìm hiểu thêm</Link>
          </Button>
        </motion.div>

        {/* Social Proof Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground sm:gap-10"
        >
          <div className="flex items-center gap-2">
            <Users className="size-4 text-brand-primary" aria-hidden="true" />
            <span><strong className="font-semibold text-foreground">2,000+</strong> Học viên</span>
          </div>
          <div className="hidden size-1 rounded-full bg-border sm:block" />
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
            <span><strong className="font-semibold text-foreground">50+</strong> Chuyên gia đồng hành</span>
          </div>
          <div className="hidden size-1 rounded-full bg-border sm:block" />
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-brand-primary" aria-hidden="true" />
            <span><strong className="font-semibold text-foreground">98%</strong> Đánh giá tích cực</span>
          </div>
        </motion.div>
      </Container>

      {/* Integrated Workspace Showcase (Sub-Hero Section) */}
      <AnimatedContent
        distance={40}
        delay={0.5}
        className="relative z-10 mt-20 w-full max-w-6xl px-2 sm:px-4"
      >
        <Surface
          elevated
          className="relative overflow-hidden border-brand-primary/20 backdrop-blur-xl"
          style={{
            boxShadow: `0 20px 50px -10px rgb(0 112 235 / 12%), 0 0 0 1px ${brand}18`,
          }}
        >
          {/* Top Bar */}
          <div className="flex h-14 items-center justify-between border-b border-divider bg-card/90 px-4 backdrop-blur-md">
            <div className="flex w-56 items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-[#ff5f56]" />
                <div className="size-3 rounded-full bg-[#ffbd2e]" />
                <div className="size-3 rounded-full bg-[#27c93f]" />
              </div>
              <div className="ml-2 flex items-center gap-2">
                <Image
                  src="/images/logo/logo-icon.svg"
                  alt="GATS Logo"
                  width={20}
                  height={20}
                  className="size-5"
                />
                <span className="text-sm font-bold tracking-wide text-foreground">
                  GATS AI Workspace
                </span>
              </div>
            </div>
            <div className="mx-4 hidden flex-1 justify-center md:flex">
              <div className="flex w-full max-w-sm items-center gap-2 rounded-lg border border-border bg-background/80 px-3 py-1.5 text-xs text-muted-foreground">
                <Search className="size-3.5 text-muted-foreground" aria-hidden="true" />
                <span>Tìm kiếm trợ lý AI & Khóa học...</span>
              </div>
            </div>
            <div className="hidden items-center gap-4 md:flex">
              <Bell className="size-4 text-muted-foreground" aria-hidden="true" />
              <Download className="size-4 text-muted-foreground" aria-hidden="true" />
              <div className="flex items-center gap-2">
                <div className="size-8 overflow-hidden rounded-full border border-border bg-linear-to-tr from-brand-primary to-primary">
                  <img
                    src="/professional/person-2.jpg"
                    alt="User Profile"
                    className="size-full object-cover opacity-90"
                  />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-foreground">Minh Quân</span>
                  <span className="text-[10px] text-brand-primary font-medium">Enterprise Plan</span>
                </div>
              </div>
            </div>
          </div>

          {/* Workspace Body */}
          <div className="grid min-h-[300px] bg-background/60 lg:grid-cols-[220px_1fr]">
            <aside className="hidden flex-col gap-1 border-r border-divider p-4 lg:flex">
              {[
                { label: "Tổng quan AI", active: true },
                { label: "Khóa học thực hành", active: false },
                { label: "Tác nhân AI (Agents)", active: false },
                { label: "Dự án Doanh nghiệp", active: false },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    item.active
                      ? "bg-brand-primary/10 text-brand-primary font-semibold"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {item.label}
                </div>
              ))}
            </aside>

            <div className="p-6">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground font-heading">
                    Không gian học tập AI thực chiến
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Hệ thống theo dõi lộ trình làm chủ công nghệ AI chuyên sâu
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="rounded-full border border-brand-primary/30 bg-brand-primary/10 px-3 py-1 text-xs font-semibold text-brand-primary">
                    Live Demo Workspace
                  </span>
                </div>
              </div>

              <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-border bg-card/80 p-4 shadow-xs"
                    >
                      <Icon className="mb-2 size-5 text-brand-primary" aria-hidden="true" />
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <p className="mt-1 text-2xl font-extrabold text-foreground font-heading">
                        {stat.value}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-2xl border border-border bg-card/80 p-5 shadow-xs lg:col-span-2">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">
                      Hiệu suất ứng dụng AI trong tuần
                    </p>
                    <span className="rounded-md border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                      Tuần 4 - Tháng 7
                    </span>
                  </div>
                  <p className="mb-4 text-3xl font-extrabold text-foreground font-heading">
                    +140%{" "}
                    <span className="text-xs font-semibold text-emerald-600">↑ Tăng tốc quy trình</span>
                  </p>
                  <svg
                    className="h-[120px] w-full"
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
                      strokeWidth="2"
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
                      r="3"
                      fill={brand}
                      className="animate-pulse"
                    />
                  </svg>
                </div>

                <div className="rounded-2xl border border-border bg-card/80 p-5 shadow-xs">
                  <p className="mb-4 text-sm font-semibold text-foreground">
                    Tiến độ môn học AI
                  </p>
                  <div className="space-y-4">
                    {activeCourses.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs font-semibold text-foreground line-clamp-1">
                            {item.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground">Đang thực hành</p>
                        </div>
                        <span className={`text-xs font-bold ${item.tone}`}>
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
      </AnimatedContent>
    </section>
  );
}
