"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  Users,
  BarChart,
  FileText,
  Layers3,
  Star,
  Search,
  LayoutGrid,
  List,
  X,
} from "lucide-react";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Container } from "@/components/layout/Container";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PathApi } from "@/constants/PathApi";
import apiClient from "@/lib/apiClient";
import { resolveMediaUrl } from "@/lib/media/url";
import { theme as designTheme } from "@/lib/theme";
import type { Course, CourseCategory, PaginationData } from "@/types/course";

const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất", api: "newest" },
  { value: "priceAsc", label: "Giá: Thấp đến Cao", api: "price_asc" },
  { value: "priceDesc", label: "Giá: Cao đến Thấp", api: "price_desc" },
] as const;

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

function formatPrice(value: number | null | undefined) {
  if (value == null) return "0đ";
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
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#f8f9fa] pt-28">
          <Header />
          <Container size="xl">
            <p className="py-20 text-center text-[1.6rem] text-slate-500">
              Đang tải khóa học…
            </p>
          </Container>
        </main>
      }
    >
      <CoursesPageContent />
    </Suspense>
  );
}

function CoursesPageContent() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filterCourses, setFilterCourses] = useState<Course[]>([]);
  const [latestCourses, setLatestCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);

  const searchParams = useSearchParams();
  const keywordFromUrl = searchParams.get("keyword")?.trim() ?? "";
  const categoryFromUrl = searchParams.get("category")?.trim() ?? "";

  const [levelFilter, setLevelFilter] = useState("all");
  const [productTypeFilter, setProductTypeFilter] = useState(
    categoryFromUrl || "all",
  );
  const [priceFilter, setPriceFilter] = useState("all");
  const [instructorFilter, setInstructorFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [searchInput, setSearchInput] = useState(keywordFromUrl);
  const [searchQuery, setSearchQuery] = useState(keywordFromUrl);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const reviewCounts = filterCourses.reduce<Record<number, number>>(
    (counts, course) => {
      for (let rating = 1; rating <= 5; rating += 1) {
        counts[rating] =
          (counts[rating] ?? 0) +
          (course.stats?.ratingDistribution?.[rating] ?? 0);
      }
      return counts;
    },
    {},
  );
  const categoryCounts = useMemo(
    () =>
      filterCourses.reduce<Record<string, number>>((counts, course) => {
        const slug = course.category?.slug;
        if (slug) counts[slug] = (counts[slug] ?? 0) + 1;
        return counts;
      }, {}),
    [filterCourses],
  );
  const instructors = useMemo(() => {
    const byId = new Map<number, { id: number; name: string; count: number }>();
    filterCourses.forEach((course) => {
      if (!course.author) return;
      const current = byId.get(course.author.id);
      byId.set(course.author.id, {
        id: course.author.id,
        name: course.author.userName,
        count: (current?.count ?? 0) + 1,
      });
    });
    return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name, "vi"));
  }, [filterCourses]);
  const priceCounts = useMemo(
    () =>
      filterCourses.reduce(
        (counts, course) => {
          const effectivePrice = course.salePrice ?? course.price;
          if (effectivePrice === 0) counts.free += 1;
          else counts.paid += 1;
          counts.all += 1;
          return counts;
        },
        { all: 0, free: 0, paid: 0 },
      ),
    [filterCourses],
  );
  const levelCounts = useMemo(
    () =>
      filterCourses.reduce(
        (counts, course) => {
          counts[course.level] += 1;
          counts.all += 1;
          return counts;
        },
        { all: 0, beginner: 0, intermediate: 0, advanced: 0 },
      ),
    [filterCourses],
  );

  useEffect(() => {
    if (!keywordFromUrl) return;
    setSearchInput(keywordFromUrl);
    setSearchQuery(keywordFromUrl);
    setCurrentPage(1);
  }, [keywordFromUrl]);

  useEffect(() => {
    if (!categoryFromUrl) return;
    setProductTypeFilter(categoryFromUrl);
    setCurrentPage(1);
  }, [categoryFromUrl]);

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

    const loadFilterCourses = async () => {
      const firstResponse = await apiClient.get(
        `${PathApi.courses.list}?page=1&limit=100&status=published`,
      );
      const firstPayload = firstResponse as unknown as CoursesListPayload;
      const totalPages = firstPayload.pagination?.totalPages ?? 1;
      const remaining = await Promise.all(
        Array.from({ length: Math.max(0, totalPages - 1) }, (_, index) =>
          apiClient.get(
            `${PathApi.courses.list}?page=${index + 2}&limit=100&status=published`,
          ),
        ),
      );
      setFilterCourses([
        ...(firstPayload.data ?? []),
        ...remaining.flatMap(
          (response) =>
            (response as unknown as CoursesListPayload).data ?? [],
        ),
      ]);
    };
    loadFilterCourses().catch(console.error);
  }, []);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setErrorMsg("");

    const params = new URLSearchParams({
      page: String(currentPage),
      limit: String(itemsPerPage),
      status: "published",
    });

    if (levelFilter !== "all") params.append("level", levelFilter);
    if (productTypeFilter !== "all") params.append("category", productTypeFilter);
    if (instructorFilter !== "all") params.append("instructorId", instructorFilter);
    if (priceFilter === "free") params.append("maxPrice", "0");
    if (priceFilter === "paid") params.append("minPrice", "1");
    if (searchQuery) params.append("keyword", searchQuery);

    const sortOpt =
      SORT_OPTIONS.find((opt) => opt.value === sortBy) ?? SORT_OPTIONS[0];
    params.append("sort", sortOpt.api);

    apiClient
      .get(`${PathApi.courses.list}?${params.toString()}`)
      .then((response) => {
        const payload = response as unknown as CoursesListPayload;
        if (!payload.data) {
          setErrorMsg("API returned success but no data field: " + JSON.stringify(payload).substring(0, 100));
        }
        setCourses(payload.data ?? []);
        setPagination(payload.pagination ?? null);
      })
      .catch((err) => {
        console.error(err);
        setErrorMsg(err.message || String(err));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [levelFilter, productTypeFilter, instructorFilter, priceFilter, sortBy, currentPage, searchQuery]);

  const filterContent = (
    <div className="space-y-8">
      {/* Category Filter */}
      <div>
        <h3 className="text-[2rem] font-bold text-[#111827] font-heading mb-6">
          Danh mục khóa học
        </h3>
        <div className="space-y-4">
          {[ALL_CATEGORY, ...categories].map((opt) => (
            <label
              key={opt.id}
              className="group flex cursor-pointer items-center justify-between text-[1.5rem] font-medium text-slate-600 transition-colors hover:text-[#111827]"
            >
              <div className="flex items-center gap-3">
                <div className="relative flex h-5 w-5 items-center justify-center rounded border border-slate-300 bg-white transition-colors group-hover:border-[#ff782d]">
                  <input
                    type="checkbox"
                    checked={productTypeFilter === (opt.slug || opt.id)}
                    onChange={() => {
                      setProductTypeFilter(opt.slug || opt.id);
                      setCurrentPage(1);
                    }}
                    className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />
                  <div className="pointer-events-none absolute inset-0 hidden bg-[#ff782d] peer-checked:block rounded" />
                  <svg className="pointer-events-none absolute h-3 w-3 text-white hidden peer-checked:block z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>{opt.name === "Tất cả" ? "Tất cả" : opt.name}</span>
              </div>
              <span className="text-[1.4rem] text-slate-400">
                {opt.slug === "all"
                  ? filterCourses.length
                  : (categoryCounts[opt.slug] ?? 0)}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Instructors Filter */}
      <div className="pt-8 border-t border-slate-200">
        <h3 className="text-[2rem] font-bold text-[#111827] font-heading mb-6">
          Giảng viên
        </h3>
        <div className="space-y-4">
          {instructors.map((instructor) => (
            <label
              key={instructor.id}
              className="group flex cursor-pointer items-center justify-between text-[1.5rem] font-medium text-slate-600 transition-colors hover:text-[#111827]"
            >
              <div className="flex items-center gap-3">
                <div className="relative flex h-5 w-5 items-center justify-center rounded border border-slate-300 bg-white transition-colors group-hover:border-[#ff782d]">
                  <input
                    type="checkbox"
                    checked={instructorFilter === String(instructor.id)}
                    onChange={() => {
                      setInstructorFilter((current) =>
                        current === String(instructor.id)
                          ? "all"
                          : String(instructor.id),
                      );
                      setCurrentPage(1);
                    }}
                    className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />
                  <div className="pointer-events-none absolute inset-0 hidden bg-[#ff782d] peer-checked:block rounded" />
                  <svg className="pointer-events-none absolute h-3 w-3 text-white hidden peer-checked:block z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>{instructor.name}</span>
              </div>
              <span className="text-[1.4rem] text-slate-400">{instructor.count}</span>
            </label>
          ))}
          {instructors.length === 0 && (
            <p className="text-[1.4rem] text-slate-400">Chưa có giảng viên</p>
          )}
        </div>
      </div>

      {/* Price Filter */}
      <div className="pt-8 border-t border-slate-200">
        <h3 className="text-[2rem] font-bold text-[#111827] font-heading mb-6">
          Giá
        </h3>
        <div className="space-y-4">
          {PRICE_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="group flex cursor-pointer items-center justify-between text-[1.5rem] font-medium text-slate-600 transition-colors hover:text-[#111827]"
            >
              <div className="flex items-center gap-3">
                <div className="relative flex h-5 w-5 items-center justify-center rounded border border-slate-300 bg-white transition-colors group-hover:border-[#ff782d]">
                  <input
                    type="checkbox"
                    checked={priceFilter === opt.value}
                    onChange={() => {
                      setPriceFilter(opt.value);
                      setCurrentPage(1);
                    }}
                    className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />
                  <div className="pointer-events-none absolute inset-0 hidden bg-[#ff782d] peer-checked:block rounded" />
                  <svg className="pointer-events-none absolute h-3 w-3 text-white hidden peer-checked:block z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>{opt.label === "Tất cả" ? "Tất cả" : opt.label === "Miễn phí" ? "Miễn phí" : "Trả phí"}</span>
              </div>
              <span className="text-[1.4rem] text-slate-400">
                {priceCounts[opt.value]}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Review Filter */}
      <div className="pt-8 border-t border-slate-200">
        <h3 className="text-[2rem] font-bold text-[#111827] font-heading mb-6">
          Đánh giá
        </h3>
        <div className="space-y-4">
          {[5, 4, 3, 2, 1].map((stars) => (
            <label
              key={stars}
              className="group flex cursor-pointer items-center justify-between text-[1.5rem] font-medium text-slate-600 transition-colors hover:text-[#111827]"
            >
              <div className="flex items-center gap-3">
                <div className="relative flex h-5 w-5 items-center justify-center rounded border border-slate-300 bg-white transition-colors group-hover:border-[#ff782d]">
                  <input
                    type="checkbox"
                    disabled={(reviewCounts[stars] ?? 0) === 0}
                    className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />
                  <div className="pointer-events-none absolute inset-0 hidden bg-[#ff782d] peer-checked:block rounded" />
                  <svg className="pointer-events-none absolute h-3 w-3 text-white hidden peer-checked:block z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className={`w-4 h-4 ${i < stars ? "text-amber-400" : "text-slate-300"}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <span className="text-[1.4rem] text-slate-400">
                ({(reviewCounts[stars] ?? 0).toLocaleString("vi-VN")})
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Level Filter */}
      <div className="pt-8 border-t border-slate-200">
        <h3 className="text-[2rem] font-bold text-[#111827] font-heading mb-6">
          Trình độ
        </h3>
        <div className="space-y-4">
          {LEVEL_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="group flex cursor-pointer items-center justify-between text-[1.5rem] font-medium text-slate-600 transition-colors hover:text-[#111827]"
            >
              <div className="flex items-center gap-3">
                <div className="relative flex h-5 w-5 items-center justify-center rounded border border-slate-300 bg-white transition-colors group-hover:border-[#ff782d]">
                  <input
                    type="checkbox"
                    checked={levelFilter === opt.value}
                    onChange={() => {
                      setLevelFilter(opt.value);
                      setCurrentPage(1);
                    }}
                    className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />
                  <div className="pointer-events-none absolute inset-0 hidden bg-[#ff782d] peer-checked:block rounded" />
                  <svg className="pointer-events-none absolute h-3 w-3 text-white hidden peer-checked:block z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>{opt.label}</span>
              </div>
              <span className="text-[1.4rem] text-slate-400">
                {levelCounts[opt.value]}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <main className="relative flex min-h-screen flex-col justify-between bg-white overflow-hidden">
      <Header />

      {/* Breadcrumb Area */}
      <div
        className="w-full bg-[#f8f9fa] py-4 border-b border-border/10"
        style={{
          marginTop: `calc(${designTheme.layout.headerHeight} + 1px)`,
        }}
      >
        <Container size="xl">
          <div className="text-[1.3rem] font-medium text-slate-500 flex items-center gap-2">
            <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
            <span>›</span>
            <span className="text-slate-800">Tất cả khóa học</span>
          </div>
        </Container>
      </div>

      <Container size="xl" className="flex-1 pb-24 pt-10">
        {/* Header row: Title + Search & View Toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <h1 className="text-[2.8rem] md:text-[3.2rem] font-bold text-[#111827] font-heading">
            Tất cả khóa học
          </h1>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setSearchQuery(searchInput);
                    setCurrentPage(1);
                  }
                }}
                className="w-full md:w-[260px] h-[4rem] rounded-full border border-slate-200 bg-white px-5 pr-12 text-[1.4rem] text-slate-700 outline-none focus:border-primary/50 transition-colors"
              />
              <button 
                onClick={() => {
                  setSearchQuery(searchInput);
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-primary transition-colors"
              >
                <Search className="w-[1.8rem] h-[1.8rem]" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setViewMode("grid")}
                className={`hidden md:flex w-[4rem] h-[4rem] rounded-full items-center justify-center transition-colors ${viewMode === 'grid' ? 'bg-primary text-white shadow-md' : 'bg-white border border-slate-200 text-slate-400 hover:text-primary'}`}
              >
                <LayoutGrid className="w-[1.8rem] h-[1.8rem]" />
              </button>
              <button 
                onClick={() => setViewMode("list")}
                className={`hidden md:flex w-[4rem] h-[4rem] rounded-full items-center justify-center transition-colors ${viewMode === 'list' ? 'bg-primary text-white shadow-md' : 'bg-white border border-slate-200 text-slate-400 hover:text-primary'}`}
              >
                <List className="w-[1.8rem] h-[1.8rem]" />
              </button>
              <button 
                onClick={() => setIsMobileFilterOpen(true)}
                className={`md:hidden w-[4rem] h-[4rem] rounded-full flex items-center justify-center transition-colors ${isMobileFilterOpen ? 'bg-primary text-white shadow-md' : 'bg-white border border-slate-200 text-slate-400 hover:text-primary'}`}
              >
                <SlidersHorizontal className="w-[1.8rem] h-[1.8rem]" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          {/* Main Course List (Left) */}
          <div className="flex-1 space-y-8 min-w-0">
            <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center">
              <div className="text-[1.5rem] font-medium text-slate-500">
                Tìm thấy{" "}
                <span className="font-bold text-slate-800">
                  {pagination?.total ?? 0}
                </span>{" "}
                khóa học
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <span className="text-[1.4rem] font-medium text-slate-500">
                  Sắp xếp:
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-[1.4rem] font-semibold text-slate-800 outline-none transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-[#ff782d]/40 data-[state=open]:border-[#ff782d]/40 data-[state=open]:bg-orange-50/40"
                  >
                    <ArrowUpDown className="h-4 w-4 text-slate-500" />
                    {SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label ??
                      "Mới nhất"}
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="min-w-[22rem] rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg"
                  >
                    {SORT_OPTIONS.map((opt) => {
                      const active = sortBy === opt.value;
                      return (
                        <DropdownMenuItem
                          key={opt.value}
                          onSelect={() => {
                            setSortBy(opt.value);
                            setCurrentPage(1);
                          }}
                          className={`cursor-pointer rounded-lg px-3 py-2.5 text-[1.4rem] font-medium ${
                            active
                              ? "bg-[#ff782d]/10 text-[#ff782d] focus:bg-[#ff782d]/15 focus:text-[#ff782d]"
                              : "text-slate-700 focus:bg-slate-50 focus:text-slate-900"
                          }`}
                        >
                          {opt.label}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className={viewMode === "list" ? "flex flex-col gap-8" : "grid grid-cols-1 md:grid-cols-2 gap-8"}>
              {errorMsg && (
                <div
                  role="alert"
                  className="col-span-full rounded-xl border border-red-200 bg-red-50 p-5 text-[1.5rem] text-red-700"
                >
                  <strong>Không thể tải danh sách khóa học: </strong>
                  {errorMsg}
                </div>
              )}
              {isLoading ? (
                <div className="py-20 text-center text-[1.6rem] text-slate-500 col-span-full">
                  Đang tải dữ liệu...
                </div>
              ) : (
                courses.map((course, idx) => {
                  const ui = getUIProps(course);
                  return (
                    <Link
                      href={`/courses/${course.slug}`}
                      key={course.id}
                      className="group block h-full"
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: idx * 0.05 }}
                        className={
                          viewMode === "list"
                            ? "flex flex-col md:flex-row items-stretch bg-white border border-slate-200 rounded-[2rem] overflow-hidden transition-all duration-300 group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] group-hover:border-transparent h-full"
                            : "flex flex-col bg-white border border-slate-200 rounded-[2rem] overflow-hidden transition-all duration-300 group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] group-hover:border-transparent h-full"
                        }
                      >
                        {/* Thumbnail */}
                        <div className={
                          viewMode === "list"
                            ? "relative w-full md:w-[260px] lg:w-[280px] shrink-0 aspect-[4/3] md:aspect-auto bg-slate-100 overflow-hidden"
                            : "relative w-full aspect-[4/3] shrink-0 bg-slate-100 overflow-hidden"
                        }>
                          <div className="absolute top-4 left-4 z-10 bg-[#111827] text-white text-[1.2rem] font-bold px-3 py-1 rounded">
                            {course.category?.name || "Khóa học"}
                          </div>
                          {course.thumbnail ? (
                            <img
                              src={resolveMediaUrl(course.thumbnail)}
                              alt={course.title}
                              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                          ) : null}
                        </div>

                        {/* Content */}
                        <div className="p-6 md:p-8 flex flex-col flex-1">
                          <p className="text-[1.3rem] text-slate-500 mb-2">
                            bởi <span className="font-bold text-[#111827]">GATS Academy</span>
                          </p>
                          <h3 className="text-[2rem] md:text-[2.2rem] font-bold text-[#111827] font-heading leading-snug group-hover:text-[#ff782d] transition-colors mb-3 line-clamp-2">
                            {course.title}
                          </h3>

                          {/* Course statistics from the API */}
                          <div className="flex flex-wrap items-center gap-4 text-[1.3rem] text-slate-500 mb-4">
                            <div className="flex items-center gap-1.5">
                              <Layers3 className="w-4 h-4 text-[#ff782d]" />
                              <span className="font-medium">
                                {course.stats?.sectionCount ?? 0} Chương
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Users className="w-4 h-4 text-[#ff782d]" />
                              <span className="font-medium">
                                {(course.stats?.enrollmentCount ?? 0).toLocaleString("vi-VN")} Học viên
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <BarChart className="w-4 h-4 text-[#ff782d]" />
                              <span className="font-medium">{ui.levelLabel}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <FileText className="w-4 h-4 text-[#ff782d]" />
                              <span className="font-medium">
                                {course.stats?.lessonCount ?? 0} Bài học
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                              <span className="font-medium">
                                {course.stats?.averageRating != null
                                  ? `${course.stats.averageRating.toFixed(1)} (${(course.stats.ratingCount ?? 0).toLocaleString("vi-VN")})`
                                  : "Chưa có đánh giá"}
                              </span>
                            </div>
                          </div>

                          <div className="mt-auto">
                            <hr className="border-slate-100 mb-4" />
                            <div className="flex items-center justify-between">
                              <div className="flex items-baseline gap-2">
                                {course.salePrice != null && course.price > course.salePrice ? (
                                  <>
                                    <span className="text-[1.3rem] text-slate-400 line-through">
                                      {formatPrice(course.price)}
                                    </span>
                                    <span className="text-[2rem] font-bold text-[#10b981]">
                                      {formatPrice(course.salePrice)}
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-[2rem] font-bold text-[#10b981]">
                                    {course.price === 0 ? "Miễn phí" : formatPrice(course.price)}
                                  </span>
                                )}
                              </div>
                              <span className="text-[1.4rem] font-bold text-[#111827] group-hover:text-[#ff782d] transition-colors">
                                Xem chi tiết
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  );
                })
              )}
            </div>

            {pagination && pagination.totalPages > 1 ? (
              <div className="mt-16 flex justify-center">
                <div className="flex select-none items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex h-[4.8rem] w-[4.8rem] items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-all hover:border-[#ff782d] hover:bg-[#ff782d] hover:text-white disabled:pointer-events-none disabled:opacity-30"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  
                  {[...Array(pagination.totalPages)].map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCurrentPage(i + 1)}
                      className={`flex h-[4.8rem] w-[4.8rem] items-center justify-center rounded-full text-[1.6rem] font-bold transition-all ${
                        currentPage === i + 1
                          ? "bg-[#111827] text-white"
                          : "bg-slate-100 text-[#111827] hover:bg-slate-200"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, pagination.totalPages))
                    }
                    disabled={currentPage === pagination.totalPages}
                    className="flex h-[4.8rem] w-[4.8rem] items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-all hover:border-[#ff782d] hover:bg-[#ff782d] hover:text-white disabled:pointer-events-none disabled:opacity-30"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
              </div>
            ) : null}

            {!isLoading && courses.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 py-24 text-center">
                <Sparkles className="mx-auto mb-4 h-10 w-10 text-slate-400" aria-hidden="true" />
                <h3 className="mb-2 text-[2rem] font-bold text-[#111827] font-heading">
                  Không tìm thấy khóa học nào
                </h3>
                <p className="text-[1.6rem] text-slate-500">Vui lòng thử chọn bộ lọc khác.</p>
              </div>
            ) : null}
          </div>

          {/* Sidebar Filters (Right) - Desktop Only */}
          <div className="hidden md:block w-full md:w-[240px] lg:w-[280px] shrink-0">
            {filterContent}
          </div>
        </div>
      </Container>

      {/* Mobile Filters Drawer */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="fixed inset-0 z-[100] bg-black/60 md:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed right-0 top-0 bottom-0 z-[101] w-[300px] max-w-[85vw] bg-white shadow-2xl md:hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <h2 className="text-[2.2rem] font-bold text-[#111827] font-heading">
                  Bộ lọc
                </h2>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-[#111827] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1 pb-safe">
                {filterContent}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}
