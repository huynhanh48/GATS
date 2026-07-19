"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock, Star, PlayCircle, Layers } from "lucide-react";
import apiClient from "@/lib/apiClient";
import { PathApi } from "@/constants/PathApi";
import { Course } from "@/types/course";
import { Button } from "@/components/ui/button";

const gradients = [
  "from-blue-600/20 via-cyan-500/10 to-transparent",
  "from-purple-600/20 via-fuchsia-500/10 to-transparent",
  "from-emerald-500/20 via-teal-400/10 to-transparent",
];

function formatPrice(price: number, salePrice?: number | null) {
  if (price <= 0) return "Miễn phí";
  if (salePrice !== null && salePrice !== undefined && salePrice > 0 && salePrice < price) {
    return `${salePrice.toLocaleString("vi-VN")}đ`;
  }
  return `${price.toLocaleString("vi-VN")}đ`;
}

function hasSale(price: number, salePrice?: number | null) {
  return salePrice !== null && salePrice !== undefined && salePrice > 0 && salePrice < price && price > 0;
}

export function FeaturedCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await apiClient.get<any>(PathApi.courses.list, {
          params: { take: "3", skip: "0", status: 'published' }
        });
        if (response && response.data?.data) {
          setCourses(response.data.data);
        }
      } catch (error) {
        console.warn("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <section className="w-full py-24 relative z-20 bg-background/50 backdrop-blur-xl border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="h-10 bg-muted/20 w-64 rounded-md mb-12 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[400px] rounded-2xl bg-muted/20 animate-pulse border border-border/50" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (courses.length === 0) return null;

  return (
    <section className="w-full py-24 relative z-20 bg-background/40 backdrop-blur-2xl border-y border-border/50 shadow-2xl">
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4 border border-primary/20"
            >
              <Star className="w-4 h-4" /> <span>Nổi bật nhất</span>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
            >
              Chương trình <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400">Đào tạo AI</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground text-lg"
            >
              Trang bị kỹ năng làm chủ Trí tuệ nhân tạo. Từ nền tảng cơ bản đến xây dựng ứng dụng AI thực chiến cho doanh nghiệp.
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Button asChild variant="outline" className="rounded-full border-primary/20 hover:bg-primary/10 group h-12 px-6">
              <Link href="/courses">
                Xem tất cả khóa học <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course, i) => {
            const isFree = course.price <= 0;
            const onSale = hasSale(course.price, course.salePrice);
            const tag = course.tags?.[0]?.name ?? course.category?.name ?? "Khóa học AI";
            const gradient = gradients[i % gradients.length];
            
            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-border/50 bg-card/40 backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:border-primary/50 hover:shadow-[0_20px_40px_-15px_rgba(0,112,235,0.3)]"
              >
                {/* Glow Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />

                <Link href={`/courses/${course.slug}`} className="relative block aspect-[16/10] overflow-hidden">
                  <img
                    src={course.thumbnail || "https://placehold.co/600x400/1e293b/ffffff?text=GATS+Academy"}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300">
                    <div className="bg-primary/90 text-white rounded-full p-4 shadow-lg backdrop-blur-sm border border-white/20">
                      <PlayCircle className="w-8 h-8" fill="currentColor" />
                    </div>
                  </div>
                  {onSale && (
                    <span className="absolute left-4 top-4 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow-lg border border-white/20">
                      Hot Sale
                    </span>
                  )}
                </Link>

                <div className="flex flex-col flex-1 p-6 relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-bold text-primary shadow-sm">
                      {tag}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-muted border border-border px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
                      {course.level === "beginner" ? "Cơ bản" : course.level === "intermediate" ? "Trung cấp" : "Nâng cao"}
                    </span>
                  </div>

                  <Link href={`/courses/${course.slug}`}>
                    <h3 className="text-xl font-bold line-clamp-2 mb-3 group-hover:text-primary transition-colors leading-tight">
                      {course.title}
                    </h3>
                  </Link>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-6 flex-1 leading-relaxed">
                    {course.description || "Khám phá khóa học chuyên sâu về Trí tuệ nhân tạo..."}
                  </p>

                  <div className="flex items-center justify-between border-t border-border/50 pt-5 mt-auto">
                    <div className="flex flex-col">
                      {onSale && (
                        <span className="text-xs text-muted-foreground line-through font-medium">
                          {course.price.toLocaleString("vi-VN")}đ
                        </span>
                      )}
                      <span className={`text-xl font-black tracking-tight ${isFree ? "text-emerald-500" : "text-foreground group-hover:text-primary transition-colors"}`}>
                        {formatPrice(course.price, course.salePrice)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                      <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                      <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                        {course.stats?.averageRating ? Number(course.stats.averageRating).toFixed(1) : "5.0"}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
