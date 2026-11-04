"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, LayoutGrid, List, PlusCircle, Tag } from "lucide-react";
import type { CoursePublic } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { resolveCourseThumbnail } from "@/lib/landing/courses";
import { Button } from "@/components/ui/button";
import { CourseTable } from "./course-table";
import { CourseRowActions } from "./course-row-actions";

type ViewMode = "catalog" | "table";

type CourseCatalogProps = {
  courses: CoursePublic[];
  showAll?: boolean;
  mockCount?: number;
};

function formatPrice(price: number, salePrice: number | null) {
  if (price === 0) return "Miễn phí";
  if (price < 0) return "Liên hệ";
  if (salePrice !== null && salePrice < price) {
    return `${salePrice.toLocaleString("vi-VN")}đ`;
  }
  return `${price.toLocaleString("vi-VN")}đ`;
}

function hasSale(price: number, salePrice: number | null) {
  return salePrice !== null && salePrice > 0 && salePrice < price && price > 0;
}

function formatLevel(level: CoursePublic["level"]) {
  if (level === "beginner") return "Cơ bản";
  if (level === "intermediate") return "Trung cấp";
  return "Nâng cao";
}

function CourseCard({
  course,
  index = 0,
}: {
  course: CoursePublic;
  index?: number;
}) {
  const isFree = course.price <= 0;
  const onSale = hasSale(course.price, course.salePrice);
  const tag = course.tags?.[0]?.name ?? course.category?.name ?? "Khóa học";
  const lessonCount = (
    course as CoursePublic & {
      stats?: { lessonCount?: number; totalDurationSeconds?: number };
    }
  ).stats?.lessonCount;
  const thumb = resolveCourseThumbnail(course.thumbnail, index);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-950 dark:hover:border-blue-700">
      <Link
        href={`/course/${course.id}`}
        className="relative block aspect-video overflow-hidden bg-[#eaf2ff] dark:bg-[#0f2742]"
      >
        <Image
          src={thumb}
          alt={course.title}
          fill
          className="object-cover"
          sizes="(max-width:768px) 100vw, 33vw"
          unoptimized
        />
        {onSale ? (
          <span className="absolute top-3 left-3 rounded-full bg-[#FF7622] px-2.5 py-1 text-[10px] font-black text-white uppercase">
            Sale
          </span>
        ) : null}
        <span
          className={cn(
            "absolute top-3 right-3 rounded-full px-2.5 py-1 text-[10px] font-black text-white uppercase",
            isFree ? "bg-emerald-600" : "bg-[#0070EB]",
          )}
        >
          {isFree ? "Miễn phí" : "Trả phí"}
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center gap-1 text-[11px] font-black text-[#0070EB]">
          <Tag className="h-3 w-3" />
          <span className="truncate">{tag}</span>
        </div>

        <Link href={`/course/${course.id}`}>
          <h3 className="line-clamp-2 min-h-10 text-sm font-black text-slate-950 transition hover:text-[#0070EB] dark:text-white">
            {course.title}
          </h3>
        </Link>

        {course.description ? (
          <p className="line-clamp-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
            {course.description}
          </p>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 dark:bg-slate-800">
            <BookOpen className="h-3 w-3 text-[#0070EB]" />
            {typeof lessonCount === "number"
              ? `${lessonCount} bài`
              : formatLevel(course.level)}
          </span>
          {course.category?.name ? (
            <span className="truncate rounded-full bg-slate-100 px-2 py-0.5 dark:bg-slate-800">
              {course.category.name}
            </span>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-slate-200 pt-3 dark:border-slate-800">
          <div>
            {onSale ? (
              <>
                <p className="text-[10px] text-slate-400 line-through">
                  {course.price.toLocaleString("vi-VN")}đ
                </p>
                <p className="text-sm font-black text-[#FF7622]">
                  {formatPrice(course.price, course.salePrice)}
                </p>
              </>
            ) : (
              <span
                className={cn(
                  "text-sm font-black",
                  isFree ? "text-emerald-600" : "text-[#FF7622]",
                )}
              >
                {formatPrice(course.price, course.salePrice)}
              </span>
            )}
          </div>
          <CourseRowActions
            courseId={course.id}
            status={course.status}
            courseTitle={course.title}
          />
        </div>
      </div>
    </article>
  );
}

export function CourseCatalog({
  courses,
  showAll = false,
  mockCount,
}: CourseCatalogProps) {
  const router = useRouter();
  const [view, setView] = useState<ViewMode>("catalog");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Tất cả");

  const categories = useMemo(() => {
    const names = new Set<string>();
    for (const course of courses) {
      if (course.category?.name) names.add(course.category.name);
    }
    return ["Tất cả", ...Array.from(names).sort()];
  }, [courses]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return courses.filter((course) => {
      const matchCat =
        category === "Tất cả" || course.category?.name === category;
      const matchQ =
        !q ||
        course.title.toLowerCase().includes(q) ||
        (course.description ?? "").toLowerCase().includes(q) ||
        (course.category?.name ?? "").toLowerCase().includes(q) ||
        course.tags.some((tagItem) => tagItem.name.toLowerCase().includes(q));
      return matchCat && matchQ;
    });
  }, [courses, category, query]);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-black tracking-[0.18em] text-[#0070EB] uppercase">
              Course Catalog
            </p>
            <h2 className="mt-1 text-xl font-black text-slate-950 dark:text-white">
              Khóa học GATS
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Đang hiển thị {courses.length} khóa học từ hệ thống.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-900">
              <button
                type="button"
                onClick={() => setView("catalog")}
                className={cn(
                  "inline-flex cursor-pointer items-center gap-1 rounded px-3 py-1.5 text-xs font-bold transition",
                  view === "catalog"
                    ? "bg-[#0070EB] text-white"
                    : "text-slate-500 hover:text-[#0070EB] dark:text-slate-400",
                )}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                Catalog
              </button>
              <button
                type="button"
                onClick={() => setView("table")}
                className={cn(
                  "inline-flex cursor-pointer items-center gap-1 rounded px-3 py-1.5 text-xs font-bold transition",
                  view === "table"
                    ? "bg-[#0070EB] text-white"
                    : "text-slate-500 hover:text-[#0070EB] dark:text-slate-400",
                )}
              >
                <List className="h-3.5 w-3.5" />
                Bảng
              </button>
            </div>
            <Button
              size="sm"
              className="bg-[#FF7622] hover:bg-[#FF7622]/90"
              onClick={() => router.push("/course/new")}
            >
              <PlusCircle className="mr-1 h-4 w-4" />
              Thêm khóa học
            </Button>
          </div>
        </div>

        {view === "catalog" ? (
          <div className="mt-4 space-y-3">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm theo tên, mô tả, tag..."
              className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 transition outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
            />
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const selected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={cn(
                      "cursor-pointer rounded-full px-3 py-1 text-xs font-bold transition",
                      selected
                        ? "bg-[#eaf2ff] text-[#0070EB] ring-1 ring-[#0070EB]/30 dark:bg-[#0f2742]"
                        : "bg-slate-100 text-slate-600 hover:text-[#0070EB] dark:bg-slate-800 dark:text-slate-300",
                    )}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      {view === "table" ? (
        <CourseTable courses={courses} />
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400">
          Không có khóa học khớp bộ lọc.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((course, index) => (
            <CourseCard key={course.id} course={course} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
