"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  Clock3,
  GraduationCap,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Tags,
} from "lucide-react";
import type { CourseLevel } from "@/lib/api/types";
import {
  formatCourseLevel,
  formatDurationHours,
  formatLandingPrice,
  formatVnd,
  hasActiveSale,
  resolveCourseThumbnail,
  type LandingCourse,
} from "@/lib/landing/courses";

type SortMode = "recommended" | "price-asc" | "price-desc" | "duration-desc";
type PriceMode = "all" | "free" | "paid" | "sale";
type LevelMode = "all" | CourseLevel;

type Props = {
  courses: LandingCourse[];
};

const selectClassName =
  "h-12 w-full appearance-none rounded-full border border-slate-200 bg-slate-50 px-4 pr-11 text-sm font-semibold text-slate-800 outline-none transition focus:border-orange-500 dark:border-slate-700 dark:bg-[#222] dark:text-slate-100";

function normalized(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function effectivePrice(course: LandingCourse) {
  if (course.isFree || course.price <= 0) return 0;
  if (course.salePrice != null && course.salePrice > 0) return course.salePrice;
  return course.price;
}

function CourseMeta({ course }: { course: LandingCourse }) {
  const duration = formatDurationHours(course.durationMinutes);
  const content =
    course.lessonCount > 0
      ? `${course.lessonCount} bài${duration ? ` · ${duration}` : ""}`
      : formatCourseLevel(course.level);

  return (
    <div className="flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-300">
      <span className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 dark:border-slate-700 dark:bg-[#222]">
        <GraduationCap className="size-3.5" aria-hidden="true" />
        {formatCourseLevel(course.level)}
      </span>
      <span className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 dark:border-slate-700 dark:bg-[#222]">
        <Clock3 className="size-3.5" aria-hidden="true" />
        {content}
      </span>
    </div>
  );
}

function CoursePrice({ course }: { course: LandingCourse }) {
  const onSale = hasActiveSale(course);

  if (onSale) {
    return (
      <div>
        <p className="text-xs text-slate-400 line-through dark:text-slate-500">
          {formatVnd(course.price)}
        </p>
        <p className="text-lg font-bold text-orange-600">
          {formatLandingPrice(course)}
        </p>
      </div>
    );
  }

  return (
    <p
      className={
        course.isFree
          ? "text-lg font-bold text-emerald-600"
          : "text-lg font-bold text-slate-950 dark:text-white"
      }
    >
      {formatLandingPrice(course)}
    </p>
  );
}

function CourseCard({
  course,
  index,
}: {
  course: LandingCourse;
  index: number;
}) {
  const onSale = hasActiveSale(course);

  return (
    <article className="group flex min-h-full flex-col overflow-hidden rounded-[8px] border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/70 dark:border-slate-800 dark:bg-[#111] dark:hover:border-slate-600 dark:hover:shadow-none">
      <Link
        href={`/course/${course.slug}`}
        className="relative block aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-[#222]"
      >
        <Image
          src={course.thumbnail || resolveCourseThumbnail(null, index)}
          alt={course.title}
          fill
          className="object-cover transition duration-300 group-hover:scale-[1.03]"
          sizes="(max-width:768px) 100vw, 33vw"
          unoptimized
        />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3">
          {onSale ? (
            <span className="rounded-full bg-orange-600 px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-white uppercase">
              Ưu đãi
            </span>
          ) : (
            <span />
          )}
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold text-white uppercase ${
              course.isFree ? "bg-emerald-600" : "bg-blue-600"
            }`}
          >
            {course.isFree ? "Free" : "Paid"}
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <p className="text-xs font-semibold tracking-wide text-orange-600 uppercase">
            {course.tag}
          </p>
          <h3 className="mt-2 text-xl leading-snug font-bold text-slate-950 dark:text-white">
            {course.title}
          </h3>
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
            {course.description || "Khóa học đang được cập nhật mô tả."}
          </p>
        </div>

        <CourseMeta course={course} />

        <div className="mt-auto flex items-center justify-between gap-4 border-t border-slate-100 pt-4 dark:border-slate-800">
          <CoursePrice course={course} />
          <Link
            href={`/course/${course.slug}`}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 dark:bg-white dark:text-slate-950 dark:hover:bg-orange-500 dark:hover:text-white"
          >
            {course.isFree ? "Học thử" : "Mua khóa"}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function CourseCatalogBrowser({ courses }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [level, setLevel] = useState<LevelMode>("all");
  const [price, setPrice] = useState<PriceMode>("all");
  const [sort, setSort] = useState<SortMode>("recommended");

  const categories = useMemo(
    () => Array.from(new Set(courses.map((course) => course.tag))).sort(),
    [courses],
  );

  const filteredCourses = useMemo(() => {
    const term = normalized(query.trim());
    const result = courses.filter((course) => {
      const matchesSearch =
        term.length === 0 ||
        normalized(
          `${course.title} ${course.description} ${course.tag} ${formatCourseLevel(course.level)}`,
        ).includes(term);
      const matchesCategory = category === "all" || course.tag === category;
      const matchesLevel = level === "all" || course.level === level;
      const matchesPrice =
        price === "all" ||
        (price === "free" && course.isFree) ||
        (price === "paid" && !course.isFree) ||
        (price === "sale" && hasActiveSale(course));

      return matchesSearch && matchesCategory && matchesLevel && matchesPrice;
    });

    return result.sort((a, b) => {
      if (sort === "price-asc") return effectivePrice(a) - effectivePrice(b);
      if (sort === "price-desc") return effectivePrice(b) - effectivePrice(a);
      if (sort === "duration-desc") return b.durationMinutes - a.durationMinutes;
      return courses.indexOf(a) - courses.indexOf(b);
    });
  }, [category, courses, level, price, query, sort]);

  const hasFilters =
    query.trim().length > 0 ||
    category !== "all" ||
    level !== "all" ||
    price !== "all" ||
    sort !== "recommended";

  function resetFilters() {
    setQuery("");
    setCategory("all");
    setLevel("all");
    setPrice("all");
    setSort("recommended");
  }

  return (
    <section id="catalog" className="px-5 py-16 md:px-8 md:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-orange-600 uppercase">
              Catalog
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 dark:text-white md:text-4xl">
              Khóa học đang mở
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
              Tìm khóa học theo danh mục, cấp độ, giá hoặc từ khóa bạn đang cần.
            </p>
          </div>
          <div className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:bg-[#111] dark:text-slate-300">
            <Tags className="size-4 text-orange-600" aria-hidden="true" />
            {filteredCourses.length}/{courses.length} khóa
          </div>
        </div>

        <div className="mb-6 rounded-[8px] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#111] md:p-5">
          <div className="grid gap-3 lg:grid-cols-[1.4fr_0.8fr_0.7fr_0.7fr_0.8fr_auto]">
            <label className="relative block">
              <span className="sr-only">Tìm kiếm khóa học</span>
              <Search
                className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm AI, marketing, Flutter..."
                className="h-12 w-full rounded-full border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-950 outline-none transition focus:border-orange-500 dark:border-slate-700 dark:bg-[#222] dark:text-white dark:placeholder:text-slate-500"
              />
            </label>

            <label className="relative block">
              <span className="sr-only">Danh mục</span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className={selectClassName}
              >
                <option value="all">Tất cả danh mục</option>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-slate-500 dark:text-slate-400"
                aria-hidden="true"
              />
            </label>

            <label className="relative block">
              <span className="sr-only">Cấp độ</span>
              <select
                value={level}
                onChange={(event) => setLevel(event.target.value as LevelMode)}
                className={selectClassName}
              >
                <option value="all">Mọi cấp độ</option>
                <option value="beginner">Cơ bản</option>
                <option value="intermediate">Trung cấp</option>
                <option value="advanced">Nâng cao</option>
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-slate-500 dark:text-slate-400"
                aria-hidden="true"
              />
            </label>

            <label className="relative block">
              <span className="sr-only">Loại giá</span>
              <select
                value={price}
                onChange={(event) => setPrice(event.target.value as PriceMode)}
                className={selectClassName}
              >
                <option value="all">Tất cả giá</option>
                <option value="free">Miễn phí</option>
                <option value="paid">Trả phí</option>
                <option value="sale">Đang ưu đãi</option>
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-slate-500 dark:text-slate-400"
                aria-hidden="true"
              />
            </label>

            <label className="relative block">
              <span className="sr-only">Sắp xếp</span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as SortMode)}
                className={selectClassName}
              >
                <option value="recommended">Gợi ý</option>
                <option value="price-asc">Giá thấp trước</option>
                <option value="price-desc">Giá cao trước</option>
                <option value="duration-desc">Thời lượng nhiều</option>
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-slate-500 dark:text-slate-400"
                aria-hidden="true"
              />
            </label>

            <button
              type="button"
              onClick={resetFilters}
              disabled={!hasFilters}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-950 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-200 dark:hover:border-white"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              Reset
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex min-h-9 items-center gap-2 rounded-full bg-slate-100 px-3 text-xs font-semibold text-slate-600 dark:bg-[#222] dark:text-slate-300">
              <SlidersHorizontal className="size-3.5" aria-hidden="true" />
              Bộ lọc nhanh
            </span>
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`min-h-9 rounded-full border px-3 text-xs font-semibold transition ${
                  category === item
                    ? "border-orange-600 bg-orange-600 text-white"
                    : "border-slate-200 text-slate-600 hover:border-slate-950 dark:border-slate-700 dark:text-slate-300 dark:hover:border-white"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="rounded-[8px] border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-[#111]">
            <p className="text-lg font-bold text-slate-950 dark:text-white">
              Không tìm thấy khóa phù hợp
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Thử bỏ bớt bộ lọc hoặc dùng từ khóa ngắn hơn.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-orange-600 px-5 text-sm font-bold text-white transition hover:bg-orange-700"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                index={courses.findIndex((item) => item.id === course.id)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
