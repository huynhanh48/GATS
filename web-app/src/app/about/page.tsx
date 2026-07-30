"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Users, Lightbulb, Target, Sparkles, BookOpen, Trophy, Code2, PlayCircle, Star } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CapabilitiesSection } from "./components/CapabilitiesSection";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background relative pb-16 overflow-hidden">
      <Header />

      {/* Hero Section */}
      <section className="relative w-full overflow-hidden pt-32 pb-32 md:pt-40 md:pb-40 bg-[#FDF3E7]">
        {/* Background Illustrations */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden flex justify-between items-end pb-8">
          <img
            src="/images/us/illustration-2.svg"
            alt="Left decoration"
            className="h-[55%] md:h-[70%] w-auto max-w-[35%] md:max-w-[40%] object-contain object-left-bottom"
          />
          <img
            src="/images/us/illustration-1.svg"
            alt="Right decoration"
            className="h-[55%] md:h-[70%] w-auto max-w-[35%] md:max-w-[40%] object-contain object-right-bottom"
          />
        </div>


        <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-[3.6rem] md:text-[5.4rem] font-extrabold tracking-tight mb-8 leading-[1.2] text-[#0B272C]"
          >
            Định hình Tương lai cùng <br className="hidden md:block" />
            <span className="text-[#0070EB]">
              GATS Academy
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[1.6rem] md:text-[2rem] text-slate-700 font-medium mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Chúng tôi tiên phong cung cấp giải pháp đào tạo AI và công nghệ thực chiến, giúp doanh nghiệp và cá nhân bứt phá giới hạn trong kỷ nguyên số.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/courses">
              <Button size="lg" className="rounded-full px-10 h-[5.4rem] text-[1.6rem] font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all gap-2 bg-[#FF7622] hover:bg-[#FF7622]/90 text-white">
                Khám phá khóa học
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="rounded-full px-10 h-[5.4rem] text-[1.6rem] font-bold border-2 transition-all bg-white/80 hover:bg-white text-slate-800 border-slate-200">
                Liên hệ với chúng tôi
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Vision & Mission (Bento Grid Style) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Tầm Nhìn & Sứ Mệnh</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Tại GATS Academy, chúng tôi tin rằng AI là chìa khóa để mở khóa tiềm năng vô hạn của con người.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2 bg-card border border-border/50 rounded-3xl p-10 overflow-hidden relative group"
          >
            <Target className="mb-6 h-12 w-12 text-brand-primary" />
            <h3 className="text-2xl font-bold mb-4">Sứ mệnh của chúng tôi</h3>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Dân chủ hóa kiến thức AI, đưa những công nghệ phức tạp trở nên dễ tiếp cận và ứng dụng thực tế cho tất cả mọi người. Không chỉ là lý thuyết, chúng tôi mang đến trải nghiệm học tập thực chiến.
            </p>
            <ul className="space-y-4">
              {[
                "Đào tạo thực chiến, ứng dụng ngay vào công việc",
                "Chương trình học cập nhật xu hướng mới nhất",
                "Đồng hành cùng học viên đến khi thành thạo",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-foreground font-medium">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent">
                    <CheckCircle2 className="h-4 w-4 text-brand-primary" />
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-card border border-border/50 rounded-3xl overflow-hidden relative group min-h-[400px]"
          >
            <Image
              src="https://placehold.co/800x800"
              alt="GATS Vision"
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8">
              <Lightbulb className="w-10 h-10 text-amber-400 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Tầm nhìn 2030</h3>
              <p className="text-gray-300">
                Trở thành học viện công nghệ hàng đầu Đông Nam Á về đào tạo Trí tuệ nhân tạo.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Core Values with hover effects */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Giá Trị Cốt Lõi</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Những nguyên tắc định hướng mọi hành động tại GATS Academy.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
          {[
            { icon: Lightbulb, title: "Đổi Mới Từng Ngày", desc: "Luôn tìm kiếm và áp dụng những công nghệ, framework mới nhất vào chương trình đào tạo." },
            { icon: Code2, title: "Thực Chiến 100%", desc: "Học qua dự án thực tế. Code ngay trên nền tảng. Không lý thuyết suông." },
            { icon: Users, title: "Cộng Đồng Gắn Kết", desc: "Môi trường học tập cởi mở, hỗ trợ 24/7 từ mentors và hàng ngàn học viên khác." },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative bg-card p-10 rounded-3xl border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 overflow-hidden"
              >
                <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-brand-primary">
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Team Section */}
      <section className="bg-muted/30 pt-12 pb-8">
        <CapabilitiesSection />
      </section>

      {/* Modern CTA Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-brand-primary p-12 text-white shadow-[var(--shadow-elevated)] md:p-20"
        >
          {/* Decorative circles */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-black/10 rounded-full blur-3xl"></div>
          </div>

          <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">Sẵn Sàng Trở Thành <br />Chuyên Gia Công Nghệ?</h2>
          <p className="text-blue-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            Hàng ngàn học viên đã thay đổi sự nghiệp. Bây giờ đến lượt bạn. Hãy bắt đầu hành trình ngay hôm nay.
          </p>
          <Link href="/courses">
            <Button size="lg" className="rounded-full bg-primary px-10 py-7 text-lg font-bold text-white hover:bg-primary/90">
              Bắt Đầu Học Ngay
            </Button>
          </Link>
        </motion.div>
      </section>

      <Footer />
    </main>
  );
}
