"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Users, Lightbulb, Target, Sparkles, BookOpen, Trophy, Code2, PlayCircle, Star } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CapabilitiesSection } from "./components/CapabilitiesSection";

const stats = [
  { value: "5000+", label: "Học viên toàn cầu", icon: Users },
  { value: "50+", label: "Khóa học chất lượng", icon: BookOpen },
  { value: "95%", label: "Tỷ lệ đánh giá 5 sao", icon: Star },
  { value: "10+", label: "Năm kinh nghiệm", icon: Trophy },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background relative pt-24 pb-16 overflow-hidden">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent"
        />
        
        <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-brand-primary">
          <Sparkles className="w-4 h-4" />
          <span>Nền tảng học tập của tương lai</span>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight"
        >
          Định hình Tương lai cùng <br className="hidden md:block" />
          <span className="text-brand-primary">
            GATS Academy
          </span>
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed"
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
            <Button size="lg" className="rounded-full px-8 py-6 text-lg font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all gap-2">
              Khám phá khóa học <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <Link href="/contact">
            <Button size="lg" variant="outline" className="rounded-full px-8 py-6 text-lg font-bold border-2 transition-all">
              Liên hệ với chúng tôi
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto -mt-16 mb-24">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-card)]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-brand-primary">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-4xl font-black text-foreground mb-2">{stat.value}</h3>
                  <p className="text-muted-foreground font-medium">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>
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
          
          <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">Sẵn Sàng Trở Thành <br/>Chuyên Gia Công Nghệ?</h2>
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
