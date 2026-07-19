"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Course, CourseCategory, PaginationData } from "@/types/course";
import { PathApi } from "@/constants/PathApi";
import apiClient from "@/lib/apiClient";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ParticlesBackground } from "@/components/common/ParticlesBackground";
import { motion, AnimatePresence } from "framer-motion";
import {
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Sparkles,
  Percent,
  Tag,
  ArrowUpDown
} from "lucide-react";

// Standard brand colors based on AGENTS.md rules:
// 1. Technology / Default: blue-500 (#0070EB)
// 2. Creative: fuchsia-500 (#D946EF)
// 3. Energy: emerald-500 (#10B981)
// 4. Machine Learning / Warning: amber-500 (#F59E0B)




export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [latestCourses, setLatestCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);

  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [productTypeFilter, setProductTypeFilter] = useState<string>("all");
  const [priceFilter, setPriceFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [isLoading, setIsLoading] = useState(true);

  // Accordion Toggles
  const [openAccordion, setOpenAccordion] = useState<Record<string, boolean>>({
    level: true,
    productType: true,
    price: true,
  });

  const toggleAccordion = (key: string) => {
    setOpenAccordion(prev => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    // Fetch categories
    apiClient.get(`${PathApi.categories.list}?type=course`)
      .then((res: any) => {
        if (res.data) setCategories(res.data);
      })
      .catch(console.error);

    // Fetch top 2 newest courses for Hero (published only)
    apiClient.get(`${PathApi.courses.list}?limit=2&status=published`)
      .then((res: any) => {
        if (res.data) setLatestCourses(res.data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const params = new URLSearchParams({
      page: String(currentPage),
      limit: String(itemsPerPage),
      status: 'published',
    });

    if (levelFilter !== "all") params.append("level", levelFilter);
    if (productTypeFilter !== "all") params.append("category", productTypeFilter);
    if (priceFilter === "free") params.append("maxPrice", "0");
    if (priceFilter === "paid") params.append("minPrice", "1");
    if (sortBy === "priceAsc") params.append("sort", "price_asc");
    if (sortBy === "priceDesc") params.append("sort", "price_desc");

    apiClient.get(`${PathApi.courses.list}?${params.toString()}`)
      .then((res: any) => {
        if (res.data) {
          setCourses(res.data);
        }
        if (res.pagination) setPagination(res.pagination);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [levelFilter, productTypeFilter, priceFilter, sortBy, currentPage]);

  const formatPrice = (value: number) => {
    return value.toLocaleString("vi-VN") + "đ";
  };

  const getUIProps = (course: Course) => {
    const cat = course.category?.slug || '';
    let imageGradient = 'from-[#0070EB]/80 to-[#0070EB]/30';
    let glowColor = 'rgba(0, 112, 235, 0.15)';
    if (cat === 'bootcamp') {
      imageGradient = 'from-[#F59E0B]/70 to-[#D946EF]/35';
      glowColor = 'rgba(245, 158, 11, 0.15)';
    } else if (cat === 'template') {
      imageGradient = 'from-[#D946EF]/80 to-[#D946EF]/30';
      glowColor = 'rgba(217, 70, 239, 0.15)';
    }

    let levelLabel = 'Cơ bản';
    if (course.level === 'intermediate') levelLabel = 'Trung cấp';
    if (course.level === 'advanced') levelLabel = 'Nâng cao';

    return { imageGradient, glowColor, levelLabel };
  };
  return (
    <main className="min-h-screen bg-background selection:bg-primary/30 relative flex flex-col justify-between overflow-hidden">
      <ParticlesBackground id="courses-particles" />
      <Header />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full pt-32 pb-24 z-20 flex-1">

        {/* Hero Section */}
        <div className="relative mb-12 rounded-3xl overflow-hidden bg-[#0A0A0B] border border-border/10 shadow-2xl">
          {/* Background Elements */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-fuchsia-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />
            <div className="absolute top-1/2 left-1/2 w-[1000px] h-[300px] bg-blue-600/15 blur-[120px] -translate-x-1/2 -translate-y-1/2 rotate-12" />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12 p-8 sm:p-12 lg:p-16">
            {/* Left Content */}
            <div className="flex-1 space-y-6 text-left">
              <h1 className="text-4xl text-primary sm:text-5xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-white leading-[1.15]">
                Tối Ưu Năng Suất  <br className="hidden sm:block" /> Quản Trị Vận Hành
              </h1>
              <p className="text-slate-300 text-base sm:text-lg max-w-xl leading-relaxed">
                Nâng cấp kỹ năng cá nhân và dẫn dắt doanh nghiệp ứng dụng AI hiệu quả với bộ đôi khóa học mới nhất.
              </p>
            </div>

            {/* Right Content: Featured Cards */}
            <div className="flex-1 w-full max-w-xl lg:max-w-none flex flex-col gap-4 sm:gap-5">
              {latestCourses.map((course, idx) => {
                const colorTheme = idx % 2 === 0 ? "blue" : "fuchsia";
                const bgColor = colorTheme === "blue" ? "bg-blue-500/20" : "bg-fuchsia-500/20";
                const badgeColor = colorTheme === "blue" ? "bg-blue-500" : "bg-fuchsia-500";

                return (
                  <Link key={course.id} href={`/courses/${course.slug}`} className="block group relative bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl p-4 flex gap-4 sm:gap-5 items-center transition-all duration-300 cursor-pointer overflow-hidden">
                    <div className={`absolute right-0 top-0 text-[10px] sm:text-xs font-bold ${badgeColor} text-white px-2.5 py-1 rounded-bl-lg z-10 shadow-sm`}>
                      Khóa học mới
                    </div>

                    <div className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-xl overflow-hidden shrink-0 border border-white/5 bg-[#111]">
                      {course.thumbnail && (
                        <img src={course.thumbnail} alt={course.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      )}
                    </div>

                    <div className="flex-1 flex flex-col justify-center pr-2">
                      <h3 className="text-white font-semibold text-sm sm:text-base leading-snug group-hover:text-blue-400 transition-colors line-clamp-2">
                        {course.title}
                      </h3>
                      <div className="mt-2 sm:mt-3 flex flex-wrap items-baseline gap-2">
                        {course.salePrice && course.price > course.salePrice ? (
                          <>
                            <span className="text-base sm:text-xl font-bold text-white">{formatPrice(course.salePrice)}</span>
                            <span className="text-xs sm:text-sm text-slate-400 line-through">{formatPrice(course.price)}</span>
                          </>
                        ) : (
                          <span className="text-base sm:text-xl font-bold text-white">{formatPrice(course.price)}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* LEFT SIDEBAR: Filters */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-border/40">
              <SlidersHorizontal className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-lg text-foreground">Bộ lọc</h2>
            </div>

            {/* Accordion 1: Cấp độ */}
            <div className="border-b border-border/40 pb-4">
              <button
                onClick={() => toggleAccordion("level")}
                className="w-full flex items-center justify-between py-2 text-foreground font-semibold hover:text-primary transition-colors cursor-pointer"
              >
                <span>Cấp độ</span>
                {openAccordion.level ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              <AnimatePresence initial={false}>
                {openAccordion.level && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden space-y-2 mt-2"
                  >

                    {[
                      { value: "all", label: "Tất cả" },
                      { value: "beginner", label: "Cơ bản" },
                      { value: "intermediate", label: "Trung cấp" },
                      { value: "advanced", label: "Nâng cao" },
                    ].map(opt => (
                      <label key={opt.value} className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground cursor-pointer py-1">
                        <input
                          type="radio"
                          name="level"
                          checked={levelFilter === opt.value}
                          onChange={() => {
                            setLevelFilter(opt.value);
                            setCurrentPage(1);
                          }}
                          className="accent-primary w-4 h-4"
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}

                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Accordion 2: Loại sản phẩm */}
            <div className="border-b border-border/40 pb-4">
              <button
                onClick={() => toggleAccordion("productType")}
                className="w-full flex items-center justify-between py-2 text-foreground font-semibold hover:text-primary transition-colors cursor-pointer"
              >
                <span>Loại sản phẩm</span>
                {openAccordion.productType ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              <AnimatePresence initial={false}>
                {openAccordion.productType && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden space-y-2 mt-2"
                  >

                    {[
                      { id: "all", name: "Tất cả", slug: "all", type: "course" } as CourseCategory,
                      ...categories
                    ].map(opt => (
                      <label key={opt.id} className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground cursor-pointer py-1">
                        <input
                          type="radio"
                          name="productType"
                          checked={productTypeFilter === (opt.slug || opt.id)}
                          onChange={() => {
                            setProductTypeFilter(opt.slug || opt.id);
                            setCurrentPage(1);
                          }}
                          className="accent-primary w-4 h-4"
                        />
                        <span>{opt.name} {opt.courseCount !== undefined ? `(${opt.courseCount})` : ''}</span>
                      </label>
                    ))}

                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Accordion 3: Học phí */}
            <div className="border-b border-border/40 pb-4">
              <button
                onClick={() => toggleAccordion("price")}
                className="w-full flex items-center justify-between py-2 text-foreground font-semibold hover:text-primary transition-colors cursor-pointer"
              >
                <span>Học phí</span>
                {openAccordion.price ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              <AnimatePresence initial={false}>
                {openAccordion.price && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden space-y-2 mt-2"
                  >

                    {[
                      { value: "all", label: "Tất cả" },
                      { value: "free", label: "Miễn phí" },
                      { value: "paid", label: "Trả phí" },
                    ].map(opt => (
                      <label key={opt.value} className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground cursor-pointer py-1">
                        <input
                          type="radio"
                          name="price"
                          checked={priceFilter === opt.value}
                          onChange={() => {
                            setPriceFilter(opt.value);
                            setCurrentPage(1);
                          }}
                          className="accent-primary w-4 h-4"
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}

                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* RIGHT CONTENT: Courses Grid & Sorting */}
          <div className="lg:col-span-3 space-y-6">

            {/* Top Bar (Count & Sorting) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
              <div className="text-sm text-muted-foreground font-medium">
                Tìm thấy <span className="text-foreground font-semibold">{pagination?.total || 0}</span> sản phẩm phù hợp
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <ArrowUpDown className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Sắp xếp theo:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-background/80 border border-border/40 text-sm font-medium rounded-lg px-3 py-1.5 focus:border-primary/60 outline-none text-foreground cursor-pointer"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="priceAsc">Giá: Thấp đến Cao</option>
                  <option value="priceDesc">Giá: Cao đến Thấp</option>
                </select>
              </div>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

              {isLoading ? (
                <div className="col-span-full py-20 text-center text-muted-foreground">Đang tải dữ liệu...</div>
              ) : courses.map((course, idx) => {
                const ui = getUIProps(course);
                return (
                  <Link href={`/courses/${course.slug}`} key={course.id} className="block group/link cursor-pointer">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: idx * 0.05 }}
                      className="group flex flex-col rounded-2xl border border-border/40 bg-[#ffffff]/[0.02] backdrop-blur-md hover:border-primary/50 transition-all duration-300 overflow-hidden shadow-lg h-full"
                      style={{
                        boxShadow: `0 0 30px -10px ${ui.glowColor}`
                      }}
                    >
                      {/* Visual Top Container */}
                      <div className={`relative w-full aspect-square bg-[#0A0A0B] p-6 flex flex-col justify-between overflow-hidden border-b border-border/40`}>
                        {course.thumbnail && (
                          <img src={course.thumbnail} alt={course.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        )}

                        {/* Header: Discount */}
                        <div className="flex items-center justify-between w-full relative z-10">
                          {course.salePrice && course.price > course.salePrice ? (
                            <div className="px-2.5 py-1 rounded bg-secondary text-white text-[11px] font-bold shadow-md uppercase">
                              Giảm đến {formatPrice(course.price - course.salePrice)}
                            </div>
                          ) : <div />}
                        </div>

                        {/* Bottom: Tags */}
                        <div className="flex flex-wrap gap-1.5 mt-auto relative z-10">
                          <span className="px-2 py-0.5 rounded bg-black/40 backdrop-blur-sm text-white text-[9px] font-semibold border border-white/10">
                            {ui.levelLabel}
                          </span>
                        </div>
                      </div>

                      {/* Card Info Bottom */}
                      <div className="p-5 flex-1 flex flex-col justify-between bg-card text-card-foreground">
                        <div className="space-y-3">
                          <div className="flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-primary" />
                            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                              {ui.levelLabel} • {course.category?.name || 'Khóa học'}
                            </span>
                          </div>

                          <h3 className="font-bold text-base leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
                            {course.title}
                          </h3>
                        </div>

                        {/* Price and Action */}
                        <div className="pt-4 border-t border-border/40 mt-4 flex items-center justify-between gap-4">
                          <div className="flex flex-col">
                            {course.salePrice && course.price > course.salePrice ? (
                              <>
                                <span className="text-[10px] text-muted-foreground line-through">
                                  {formatPrice(course.price)}
                                </span>
                                <span className="text-lg font-black text-amber-600 dark:text-amber-500">
                                  {formatPrice(course.salePrice)}
                                </span>
                              </>
                            ) : (
                              <span className="text-lg font-black text-amber-600 dark:text-amber-500">
                                {formatPrice(course.price)}
                              </span>
                            )}
                          </div>

                          <button className="h-8 px-4 rounded-full bg-primary hover:bg-primary/90 text-white text-xs font-bold transition-all shadow shadow-primary/25 cursor-pointer">
                            Đăng ký
                          </button>
                        </div>
                      </div>

                    </motion.div>
                  </Link>
                )
              })}
            </div>

            {/* Pagination Controls */}

            {
              pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center mt-12">
                  <div className="flex items-center gap-6 bg-background/80 border border-border/40 backdrop-blur-md px-6 py-2 rounded-full shadow-md select-none">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <span className="text-sm font-semibold text-foreground">
                      {currentPage} / {pagination.totalPages}
                    </span>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                      disabled={currentPage === pagination.totalPages}
                      className="text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            }


            {/* Empty state */}
            {
              !isLoading && courses.length === 0 && (
                <div className="text-center py-20 border border-dashed border-border/40 rounded-2xl bg-[#ffffff]/[0.01]">
                  <Sparkles className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-lg text-foreground mb-1">Không tìm thấy khóa học nào</h3>
                  <p className="text-sm text-muted-foreground">Vui lòng thử chọn bộ lọc khác.</p>
                </div>
              )
            }

          </div >

        </div >
      </div >

      <Footer />
    </main >
  );
}
