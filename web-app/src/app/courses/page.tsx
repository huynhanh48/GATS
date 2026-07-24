"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpDown,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { PathApi } from "@/constants/PathApi";
import apiClient from "@/lib/apiClient";
import { resolveMediaUrl } from "@/lib/media/url";
import type { Course, CourseCategory, PaginationData } from "@/types/course";

type CategoriesPayload = {
  data?: CourseCategory[];
};

type CoursesListPayload = {
  data?: Course[];
  pagination?: PaginationData;
};

const LEVEL_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "beginner", label: "Cơ bản" },
  { value: "intermediate", label: "Trung cấp" },
  { value: "advanced", label: "Nâng cao" },
] as const;

const PRICE_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "free", label: "Miễn phí" },
  { value: "paid", label: "Trả phí" },
] as const;

const LEVEL_LABELS: Record<Course["level"], string> = {
  beginner: "Cơ bản",
  intermediate: "Trung cấp",
  advanced: "Nâng cao",
};

const ALL_CATEGORY: CourseCategory = {
  id: "all",
  name: "Tất cả",
  slug: "all",
  type: "course",
};

function formatPrice(value: number) {
  return `${value.toLocaleString("vi-VN")}đ`;
}

function getUIProps(course: Course) {
  const cat = course.category?.slug ?? "";
  // brand-primary (blue) default; primary (orange) for bootcamp/energy variants
  let glowColor = "rgba(0, 112, 235, 0.15)";
  if (cat === "bootcamp") {
    glowColor = "rgba(255, 118, 34, 0.18)";
  } else if (cat === "template") {
    glowColor = "rgba(0, 112, 235, 0.2)";
  }

  return {
    glowColor,
    levelLabel: LEVEL_LABELS[course.level],
  };
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [latestCourses, setLatestCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);

  const [levelFilter, setLevelFilter] = useState("all");
  const [productTypeFilter, setProductTypeFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [isLoading, setIsLoading] = useState(true);

  const [openAccordion, setOpenAccordion] = useState<Record<string, boolean>>({
    level: true,
    productType: true,
    price: true,
  });

  const toggleAccordion = (key: string) => {
    setOpenAccordion((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    apiClient
      .get(`${PathApi.categories.list}?type=course`)
      .then((response) => {
        const payload = response as unknown as CategoriesPayload;
        setCategories(payload.data ?? []);
      })
      .catch(console.error);

    apiClient
      .get(`${PathApi.courses.list}?limit=2&status=published`)
      .then((response) => {
        const payload = response as unknown as CoursesListPayload;
        setLatestCourses(payload.data ?? []);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    let active = true;
    setIsLoading(true);

    const params = new URLSearchParams({
      page: String(currentPage),
      limit: String(itemsPerPage),
      status: "published",
    });

    if (levelFilter !== "all") params.append("level", levelFilter);
    if (productTypeFilter !== "all") params.append("category", productTypeFilter);
    if (priceFilter === "free") params.append("maxPrice", "0");
    if (priceFilter === "paid") params.append("minPrice", "1");
    if (sortBy === "priceAsc") params.append("sort", "price_asc");
    if (sortBy === "priceDesc") params.append("sort", "price_desc");

    apiClient
      .get(`${PathApi.courses.list}?${params.toString()}`)
      .then((response) => {
        if (!active) return;
        const payload = response as unknown as CoursesListPayload;
        setCourses(payload.data ?? []);
        setPagination(payload.pagination ?? null);
      })
      .catch(console.error)
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [levelFilter, productTypeFilter, priceFilter, sortBy, currentPage]);

  return (
    <main className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-background selection:bg-primary/30">
      <Header />

      <div className="z-20 mx-auto w-full max-w-7xl flex-1 px-4 pb-24 pt-32 sm:px-6">
        {/* Hero */}
        <div className="relative mb-12 overflow-hidden rounded-3xl border border-border/10 bg-[#0A0A0B] shadow-2xl">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <div className="absolute right-0 top-0 h-[800px] w-[800px] translate-x-1/3 -translate-y-1/2 rounded-full bg-brand-primary/25 blur-[120px]" />
            <div className="absolute bottom-0 left-0 h-[600px] w-[600px] -translate-x-1/4 translate-y-1/3 rounded-full bg-primary/15 blur-[100px]" />
            <div className="absolute left-1/2 top-1/2 h-[300px] w-[1000px] -translate-x-1/2 -translate-y-1/2 rotate-12 bg-brand-primary/15 blur-[120px]" />
          </div>

          <div className="relative z-10 flex flex-col items-center gap-12 p-8 sm:p-12 lg:flex-row lg:p-16">
            <div className="flex-1 space-y-6 text-left">
              <h1 className="text-4xl font-bold leading-[1.15] tracking-tight text-white sm:text-5xl lg:text-4xl xl:text-5xl">
                Tối Ưu Năng Suất <br className="hidden sm:block" /> Quản Trị Vận Hành
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
                Nâng cấp kỹ năng cá nhân và dẫn dắt doanh nghiệp ứng dụng AI hiệu quả với bộ đôi khóa học mới nhất.
              </p>
            </div>

            <div className="flex w-full max-w-xl flex-1 flex-col gap-4 sm:gap-5 lg:max-w-none">
              {latestCourses.map((course, idx) => {
                const badgeColor =
                  idx % 2 === 0 ? "bg-brand-primary" : "bg-primary";

                return (
                  <Link
                    key={course.id}
                    href={`/courses/${course.slug}`}
                    className="group relative flex cursor-pointer items-center gap-4 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition-all duration-300 hover:bg-white/10 sm:gap-5"
                  >
                    <div
                      className={`absolute right-0 top-0 z-10 rounded-bl-lg px-2.5 py-1 text-[10px] font-bold text-white shadow-sm sm:text-xs ${badgeColor}`}
                    >
                      Khóa học mới
                    </div>

                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/5 bg-[#111] sm:h-28 sm:w-28">
                      {course.thumbnail ? (
                        <img
                          src={resolveMediaUrl(course.thumbnail)}
                          alt={course.title}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : null}
                    </div>

                    <div className="flex flex-1 flex-col justify-center pr-2">
                      <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-white transition-colors group-hover:text-brand-primary sm:text-base">
                        {course.title}
                      </h3>
                      <div className="mt-2 flex flex-wrap items-baseline gap-2 sm:mt-3">
                        {course.salePrice != null && course.price > course.salePrice ? (
                          <>
                            <span className="text-base font-bold text-white sm:text-xl">
                              {formatPrice(course.salePrice)}
                            </span>
                            <span className="text-xs text-slate-400 line-through sm:text-sm">
                              {formatPrice(course.price)}
                            </span>
                          </>
                        ) : (
                          <span className="text-base font-bold text-white sm:text-xl">
                            {formatPrice(course.price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Filters */}
          <div className="space-y-6 lg:col-span-1">
            <div className="flex items-center gap-2 border-b border-border/40 pb-4">
              <SlidersHorizontal className="h-5 w-5 text-primary" aria-hidden="true" />
              <h2 className="text-lg font-bold text-foreground">Bộ lọc</h2>
            </div>

            <div className="border-b border-border/40 pb-4">
              <button
                type="button"
                onClick={() => toggleAccordion("level")}
                className="flex w-full cursor-pointer items-center justify-between py-2 font-semibold text-foreground transition-colors hover:text-primary"
              >
                <span>Cấp độ</span>
                {openAccordion.level ? (
                  <ChevronUp className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                )}
              </button>

              <AnimatePresence initial={false}>
                {openAccordion.level ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-2 space-y-2 overflow-hidden"
                  >
                    {LEVEL_OPTIONS.map((opt) => (
                      <label
                        key={opt.value}
                        className="flex cursor-pointer items-center gap-2.5 py-1 text-sm text-muted-foreground hover:text-foreground"
                      >
                        <input
                          type="radio"
                          name="level"
                          checked={levelFilter === opt.value}
                          onChange={() => {
                            setLevelFilter(opt.value);
                            setCurrentPage(1);
                          }}
                          className="h-4 w-4 accent-primary"
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            <div className="border-b border-border/40 pb-4">
              <button
                type="button"
                onClick={() => toggleAccordion("productType")}
                className="flex w-full cursor-pointer items-center justify-between py-2 font-semibold text-foreground transition-colors hover:text-primary"
              >
                <span>Loại sản phẩm</span>
                {openAccordion.productType ? (
                  <ChevronUp className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                )}
              </button>

              <AnimatePresence initial={false}>
                {openAccordion.productType ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-2 space-y-2 overflow-hidden"
                  >
                    {[ALL_CATEGORY, ...categories].map((opt) => (
                      <label
                        key={opt.id}
                        className="flex cursor-pointer items-center gap-2.5 py-1 text-sm text-muted-foreground hover:text-foreground"
                      >
                        <input
                          type="radio"
                          name="productType"
                          checked={productTypeFilter === (opt.slug || opt.id)}
                          onChange={() => {
                            setProductTypeFilter(opt.slug || opt.id);
                            setCurrentPage(1);
                          }}
                          className="h-4 w-4 accent-primary"
                        />
                        <span>
                          {opt.name}
                          {opt.courseCount !== undefined ? ` (${opt.courseCount})` : ""}
                        </span>
                      </label>
                    ))}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            <div className="border-b border-border/40 pb-4">
              <button
                type="button"
                onClick={() => toggleAccordion("price")}
                className="flex w-full cursor-pointer items-center justify-between py-2 font-semibold text-foreground transition-colors hover:text-primary"
              >
                <span>Học phí</span>
                {openAccordion.price ? (
                  <ChevronUp className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                )}
              </button>

              <AnimatePresence initial={false}>
                {openAccordion.price ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-2 space-y-2 overflow-hidden"
                  >
                    {PRICE_OPTIONS.map((opt) => (
                      <label
                        key={opt.value}
                        className="flex cursor-pointer items-center gap-2.5 py-1 text-sm text-muted-foreground hover:text-foreground"
                      >
                        <input
                          type="radio"
                          name="price"
                          checked={priceFilter === opt.value}
                          onChange={() => {
                            setPriceFilter(opt.value);
                            setCurrentPage(1);
                          }}
                          className="h-4 w-4 accent-primary"
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>

          {/* Grid */}
          <div className="space-y-6 lg:col-span-3">
            <div className="flex flex-col justify-between gap-4 border-b border-border/40 pb-4 sm:flex-row sm:items-center">
              <div className="text-sm font-medium text-muted-foreground">
                Tìm thấy{" "}
                <span className="font-semibold text-foreground">
                  {pagination?.total ?? 0}
                </span>{" "}
                sản phẩm phù hợp
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <ArrowUpDown className="h-4 w-4 text-primary" aria-hidden="true" />
                <span className="text-sm font-semibold text-foreground">Sắp xếp theo:</span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="cursor-pointer rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground outline-none focus:border-primary/60"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="priceAsc">Giá: Thấp đến Cao</option>
                  <option value="priceDesc">Giá: Cao đến Thấp</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {isLoading ? (
                <div className="col-span-full py-20 text-center text-muted-foreground">
                  Đang tải dữ liệu...
                </div>
              ) : (
                courses.map((course, idx) => {
                  const ui = getUIProps(course);
                  return (
                    <Link
                      href={`/courses/${course.slug}`}
                      key={course.id}
                      className="group/link block cursor-pointer"
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: idx * 0.05 }}
                        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/40 bg-card shadow-lg backdrop-blur-md transition-all duration-300 hover:border-primary/50"
                        style={{
                          boxShadow: `0 0 30px -10px ${ui.glowColor}`,
                        }}
                      >
                        <div className="relative flex aspect-square w-full flex-col justify-between overflow-hidden border-b border-border/40 bg-[#0A0A0B] p-6">
                          {course.thumbnail ? (
                            <img
                              src={resolveMediaUrl(course.thumbnail)}
                              alt={course.title}
                              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          ) : null}

                          <div className="relative z-10 flex w-full items-center justify-between">
                            {course.salePrice != null && course.price > course.salePrice ? (
                              <div className="rounded bg-primary px-2.5 py-1 text-[11px] font-bold uppercase text-primary-foreground shadow-md">
                                Giảm đến {formatPrice(course.price - course.salePrice)}
                              </div>
                            ) : (
                              <div />
                            )}
                          </div>

                          <div className="relative z-10 mt-auto flex flex-wrap gap-1.5">
                            <span className="rounded border border-white/10 bg-black/40 px-2 py-0.5 text-[9px] font-semibold text-white backdrop-blur-sm">
                              {ui.levelLabel}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-1 flex-col justify-between bg-card p-5 text-card-foreground">
                          <div className="space-y-3">
                            <div className="flex items-center gap-1.5">
                              <BookOpen
                                className="h-3.5 w-3.5 text-brand-primary"
                                aria-hidden="true"
                              />
                              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-primary">
                                {ui.levelLabel} • {course.category?.name || "Khóa học"}
                              </span>
                            </div>

                            <h3 className="line-clamp-2 text-base font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
                              {course.title}
                            </h3>
                          </div>

                          <div className="mt-4 flex items-center justify-between gap-4 border-t border-border/40 pt-4">
                            <div className="flex flex-col">
                              {course.salePrice != null && course.price > course.salePrice ? (
                                <>
                                  <span className="text-[10px] text-muted-foreground line-through">
                                    {formatPrice(course.price)}
                                  </span>
                                  <span className="text-lg font-black text-primary">
                                    {formatPrice(course.salePrice)}
                                  </span>
                                </>
                              ) : (
                                <span className="text-lg font-black text-primary">
                                  {formatPrice(course.price)}
                                </span>
                              )}
                            </div>

                            <span className="inline-flex h-8 cursor-pointer items-center rounded-full bg-primary px-4 text-xs font-bold text-primary-foreground shadow shadow-primary/25 transition-all hover:bg-primary/90">
                              Đăng ký
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  );
                })
              )}
            </div>

            {pagination && pagination.totalPages > 1 ? (
              <div className="mt-12 flex justify-center">
                <div className="flex select-none items-center gap-6 rounded-full border border-border/40 bg-card px-6 py-2 shadow-md backdrop-blur-md">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="cursor-pointer text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                    aria-label="Trang trước"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <span className="text-sm font-semibold text-foreground">
                    {currentPage} / {pagination.totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, pagination.totalPages))
                    }
                    disabled={currentPage === pagination.totalPages}
                    className="cursor-pointer text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                    aria-label="Trang sau"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : null}

            {!isLoading && courses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/40 bg-card/50 py-20 text-center">
                <Sparkles className="mx-auto mb-4 h-8 w-8 text-muted-foreground" aria-hidden="true" />
                <h3 className="mb-1 text-lg font-semibold text-foreground">
                  Không tìm thấy khóa học nào
                </h3>
                <p className="text-sm text-muted-foreground">Vui lòng thử chọn bộ lọc khác.</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
