"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Users, Lightbulb, Target, Sparkles, BookOpen, Trophy, Code2, PlayCircle, Star } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CapabilitiesSection } from "@/components/sections/CapabilitiesSection";
import { useEffect, useState } from "react";

const stats = [
  { value: "5000+", label: "Học viên toàn cầu", icon: Users },
  { value: "50+", label: "Khóa học chất lượng", icon: BookOpen },
  { value: "95%", label: "Tỷ lệ đánh giá 5 sao", icon: Star },
  { value: "10+", label: "Năm kinh nghiệm", icon: Trophy },
];

export default function AboutPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-background relative pt-24 pb-16 overflow-hidden">
      <Header />
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background"></div>
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 blur-[120px] rounded-full -z-10 pointer-events-none"
        />
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-8 border border-primary/20">
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
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-500 to-emerald-400">
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
          <Link href="/contact" className="pointer-events-none opacity-50">
            <Button size="lg" variant="outline" className="rounded-full px-8 py-6 text-lg font-bold border-2 transition-all">
              Liên hệ với chúng tôi
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto -mt-16 mb-24">
        <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl p-8 shadow-2xl">
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
                  <div className="w-12 h-12 mx-auto bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4">
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
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -z-10 transition-transform group-hover:scale-150 duration-700 pointer-events-none" />
            <Target className="w-12 h-12 text-blue-500 mb-6" />
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
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
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
              src="/auth-bg.jpg"
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
            { icon: Lightbulb, color: "text-amber-500", bg: "bg-amber-500/10", title: "Đổi Mới Từng Ngày", desc: "Luôn tìm kiếm và áp dụng những công nghệ, framework mới nhất vào chương trình đào tạo." },
            { icon: Code2, color: "text-emerald-500", bg: "bg-emerald-500/10", title: "Thực Chiến 100%", desc: "Học qua dự án thực tế. Code ngay trên nền tảng. Không lý thuyết suông." },
            { icon: Users, color: "text-blue-500", bg: "bg-blue-500/10", title: "Cộng Đồng Gắn Kết", desc: "Môi trường học tập cởi mở, hỗ trợ 24/7 từ mentors và hàng ngàn học viên khác." },
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
                <div className={`absolute top-0 right-0 w-32 h-32 ${item.bg} rounded-bl-full -z-10 transition-transform group-hover:scale-150 duration-500 pointer-events-none`} />
                <div className={`w-16 h-16 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
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
          className="relative bg-gradient-to-br from-primary via-blue-600 to-indigo-700 rounded-[3rem] p-12 md:p-20 overflow-hidden text-white shadow-2xl"
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
            <Button size="lg" className="rounded-full px-10 py-7 text-lg font-bold bg-white text-primary hover:bg-gray-100 hover:scale-105 transition-all shadow-xl">
              Bắt Đầu Học Ngay
            </Button>
          </Link>
        </motion.div>
      </section>

      <Footer />
    </main>
  );
}
