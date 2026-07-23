"use client";

import { useEffect, useState } from "react";
import type { ComponentProps } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { TedCourseCard } from "@/components/ted/course-card";
import { SectionHeader } from "@/components/ted/section-header";
import { ContentState } from "@/components/ui/content-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Surface } from "@/components/ui/surface";
import { PathApi } from "@/constants/PathApi";
import apiClient from "@/lib/apiClient";
import type { Course, CourseCategory, PaginationData } from "@/types/course";

type CourseListPayload = {
  data?: Course[];
  pagination?: PaginationData;
};

const levels = [
  { value: "all", label: "Tất cả cấp độ" },
  { value: "beginner", label: "Cơ bản" },
  { value: "intermediate", label: "Trung cấp" },
  { value: "advanced", label: "Nâng cao" },
];

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [level, setLevel] = useState("all");
  const [category, setCategory] = useState("all");
  const [price, setPrice] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    apiClient
      .get(`${PathApi.categories.list}?type=course`)
      .then((response) => {
        const payload = response as unknown as { data?: CourseCategory[] };
        setCategories(payload.data ?? []);
      })
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams({
      page: String(page),
      limit: "9",
      status: "published",
    });
    if (debouncedQuery) params.set("search", debouncedQuery);
    if (level !== "all") params.set("level", level);
    if (category !== "all") params.set("category", category);
    if (price === "free") params.set("maxPrice", "0");
    if (price === "paid") params.set("minPrice", "1");
    if (sort === "priceAsc") params.set("sort", "price_asc");
    if (sort === "priceDesc") params.set("sort", "price_desc");

    setIsLoading(true);
    setError(false);
    apiClient
      .get(`${PathApi.courses.list}?${params}`)
      .then((response) => {
        if (!active) return;
        const payload = response as unknown as CourseListPayload;
        setCourses(payload.data ?? []);
        setPagination(payload.pagination ?? null);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [category, debouncedQuery, level, page, price, sort]);

  const resetFilters = () => {
    setQuery("");
    setLevel("all");
    setCategory("all");
    setPrice("all");
    setSort("newest");
    setPage(1);
  };

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <section className="border-b border-divider bg-card px-4 pb-12 pt-32 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="GATS Academy"
            title="Khóa học AI thực tiễn"
            description="Chọn lộ trình phù hợp để phát triển kỹ năng, tự động hóa công việc và tạo kết quả đo lường được."
          />
          <div className="relative mt-8 max-w-2xl">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm khóa học..."
              aria-label="Tìm khóa học"
              className="h-12 pl-12"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[260px_1fr]">
        <Surface className="h-fit p-5 shadow-none">
          <div className="mb-5 flex items-center gap-2">
            <SlidersHorizontal className="size-5 text-brand-primary" aria-hidden="true" />
            <h2 className="font-semibold">Bộ lọc</h2>
          </div>
          <div className="space-y-5">
            <FilterSelect label="Cấp độ" value={level} onChange={setLevel} options={levels} />
            <FilterSelect
              label="Danh mục"
              value={category}
              onChange={setCategory}
              options={[
                { value: "all", label: "Tất cả danh mục" },
                ...categories.map((item) => ({
                  value: item.slug || item.id,
                  label: item.name,
                })),
              ]}
            />
            <FilterSelect
              label="Học phí"
              value={price}
              onChange={setPrice}
              options={[
                { value: "all", label: "Tất cả mức phí" },
                { value: "free", label: "Miễn phí" },
                { value: "paid", label: "Trả phí" },
              ]}
            />
          </div>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-5 min-h-11 w-full rounded-xl text-sm font-semibold text-brand-primary hover:bg-accent focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
          >
            Đặt lại bộ lọc
          </button>
        </Surface>

        <div>
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {pagination?.total ?? courses.length} khóa học phù hợp
            </p>
            <FilterSelect
              label="Sắp xếp"
              hideLabel
              value={sort}
              onChange={setSort}
              options={[
                { value: "newest", label: "Mới nhất" },
                { value: "priceAsc", label: "Giá thấp đến cao" },
                { value: "priceDesc", label: "Giá cao đến thấp" },
              ]}
            />
          </div>

          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3" aria-label="Đang tải khóa học">
              {Array.from({ length: 6 }, (_, index) => (
                <Skeleton key={index} className="aspect-[4/5] rounded-2xl" />
              ))}
            </div>
          ) : error ? (
            <ContentState
              tone="error"
              title="Không thể tải khóa học"
              description="Vui lòng kiểm tra kết nối và thử lại."
              actionLabel="Thử lại"
              onAction={() => window.location.reload()}
            />
          ) : courses.length === 0 ? (
            <ContentState
              title="Không tìm thấy khóa học"
              description="Hãy thử từ khóa hoặc bộ lọc khác."
              actionLabel="Đặt lại bộ lọc"
              onAction={resetFilters}
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {courses.map((course) => (
                <TedCourseCard key={course.id} course={course} />
              ))}
            </div>
          )}

          {pagination && pagination.totalPages > 1 ? (
            <nav className="mt-10 flex items-center justify-center gap-3" aria-label="Phân trang khóa học">
              <PaginationButton
                disabled={page === 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Trang trước
              </PaginationButton>
              <span className="px-3 text-sm text-muted-foreground">
                {page} / {pagination.totalPages}
              </span>
              <PaginationButton
                disabled={page === pagination.totalPages}
                onClick={() =>
                  setPage((current) => Math.min(pagination.totalPages, current + 1))
                }
              >
                Trang sau
              </PaginationButton>
            </nav>
          ) : null}
        </div>
      </section>
      <Footer />
    </main>
  );
}

function FilterSelect({
  label,
  hideLabel = false,
  value,
  onChange,
  options,
}: {
  label: string;
  hideLabel?: boolean;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="block">
      <span className={hideLabel ? "sr-only" : "mb-2 block text-sm font-semibold"}>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 w-full rounded-xl border border-input bg-card px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function PaginationButton({
  children,
  ...props
}: ComponentProps<"button">) {
  return (
    <button
      type="button"
      className="min-h-11 rounded-xl border border-border bg-card px-4 text-sm font-semibold text-brand-primary hover:bg-accent focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-40"
      {...props}
    >
      {children}
    </button>
  );
}
