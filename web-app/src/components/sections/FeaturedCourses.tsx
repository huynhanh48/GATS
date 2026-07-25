"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlayCircle, Star } from "lucide-react";

import { SectionHeader } from "@/components/ted/section-header";
import { ContentState } from "@/components/ui/content-state";
import { Skeleton } from "@/components/ui/skeleton";
import { PathApi } from "@/constants/PathApi";
import apiClient from "@/lib/apiClient";
import { resolveMediaUrl } from "@/lib/media/url";
import type { Course } from "@/types/course";
import { TiltedCard, AnimatedContent } from "@/components/react-bits";

const hoverGlows = [
  "from-brand-primary/15 via-brand-primary/5 to-transparent",
  "from-primary/15 via-primary/5 to-transparent",
  "from-accent via-brand-primary/5 to-transparent",
];

const levelLabels: Record<Course["level"], string> = {
  beginner: "Cơ bản",
  intermediate: "Trung cấp",
  advanced: "Nâng cao",
};

function formatPrice(price: number, salePrice?: number | null) {
  if (price <= 0) return "Miễn phí";
  if (salePrice != null && salePrice > 0 && salePrice < price) {
    return `${salePrice.toLocaleString("vi-VN")}đ`;
  }
  return `${price.toLocaleString("vi-VN")}đ`;
}

function hasSale(price: number, salePrice?: number | null) {
  return salePrice != null && salePrice > 0 && salePrice < price && price > 0;
}

export function FeaturedCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    apiClient
      .get(PathApi.courses.list, {
        params: { take: "3", skip: "0", status: "published" },
      })
      .then((response) => {
        if (!active) return;
        const payload = response as unknown as { data?: Course[] };
        setCourses(payload.data ?? []);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="relative z-20 w-full border-y border-border bg-card/60 py-20 backdrop-blur-xl sm:py-24">
      <div className="pointer-events-none absolute inset-0 dot-noise opacity-50" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <AnimatedContent distance={25} delay={0.1}>
          <SectionHeader
            eyebrow="Nổi bật"
            title="Chương trình đào tạo AI"
            description="Trang bị kỹ năng làm chủ Trí tuệ nhân tạo. Từ nền tảng cơ bản đến xây dựng ứng dụng AI thực chiến cho doanh nghiệp."
            href="/courses"
            linkLabel="Xem tất cả"
          />
        </AnimatedContent>

        <div className="mt-12">
          {loading ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }, (_, index) => (
                <Skeleton key={index} className="h-100 rounded-3xl" />
              ))}
            </div>
          ) : error ? (
            <ContentState
              tone="error"
              title="Chưa thể tải khóa học"
              description="Danh sách khóa học đang tạm thời không khả dụng."
            />
          ) : courses.length === 0 ? (
            <ContentState
              title="Khóa học đang được cập nhật"
              description="Vui lòng quay lại sau để xem các chương trình mới."
            />
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course, index) => {
                const isFree = course.price <= 0;
                const onSale = hasSale(course.price, course.salePrice);
                const tag =
                  course.tags?.[0]?.name ?? course.category?.name ?? "Khóa học AI";
                const glow = hoverGlows[index % hoverGlows.length];
                const thumbnail = resolveMediaUrl(
                  course.thumbnail,
                  "https://placehold.co/600x400/EAF3FE/0070EB?text=GATS+Academy",
                );

                return (
                  <AnimatedContent
                    key={course.id}
                    distance={35}
                    delay={index * 0.12}
                  >
                    <TiltedCard maxRotateX={6} maxRotateY={6} scaleOnHover={1.02} glareOpacity={0.12}>
                      <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-card)] transition-all duration-300 hover:border-brand-primary/50 hover:shadow-[var(--shadow-elevated)]">
                        <div
                          className={`absolute inset-0 bg-linear-to-br ${glow} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                        />

                        <Link
                          href={`/courses/${course.slug}`}
                          className="relative block aspect-16/10 overflow-hidden"
                        >
                          <img
                            src={thumbnail}
                            alt={course.title}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-linear-to-t from-foreground/70 via-foreground/15 to-transparent opacity-50 transition-opacity duration-300 group-hover:opacity-70" />
                          <div className="absolute inset-0 flex scale-90 items-center justify-center opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
                            <div className="rounded-full border border-primary-foreground/20 bg-primary p-4 text-primary-foreground shadow-[var(--shadow-elevated)]">
                              <PlayCircle className="size-8" fill="currentColor" aria-hidden="true" />
                            </div>
                          </div>
                          {onSale ? (
                            <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-[var(--shadow-card)]">
                              Hot Sale
                            </span>
                          ) : null}
                        </Link>

                        <div className="relative z-10 flex flex-1 flex-col p-6">
                          <div className="mb-4 flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center rounded-full border border-brand-primary/20 bg-accent px-3 py-1 text-xs font-bold text-brand-primary">
                              {tag}
                            </span>
                            <span className="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                              {levelLabels[course.level]}
                            </span>
                          </div>

                          <Link href={`/courses/${course.slug}`}>
                            <h3 className="mb-3 line-clamp-2 text-xl font-bold leading-tight font-heading transition-colors group-hover:text-brand-primary">
                              {course.title}
                            </h3>
                          </Link>

                          <p className="mb-6 flex-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground font-sans">
                            {course.description ||
                              "Khám phá khóa học chuyên sâu về Trí tuệ nhân tạo..."}
                          </p>

                          <div className="mt-auto flex items-center justify-between border-t border-border pt-5">
                            <div className="flex flex-col">
                              {onSale ? (
                                <span className="text-xs font-medium text-muted-foreground line-through">
                                  {course.price.toLocaleString("vi-VN")}đ
                                </span>
                              ) : null}
                              <span
                                className={`text-xl font-black tracking-tight font-heading transition-colors ${
                                  isFree
                                    ? "text-brand-primary"
                                    : "text-foreground group-hover:text-primary"
                                }`}
                              >
                                {formatPrice(course.price, course.salePrice)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 rounded-lg border border-brand-accent/20 bg-primary/10 px-2.5 py-1">
                              <Star
                                className="size-4 fill-brand-accent text-brand-accent"
                                aria-hidden="true"
                              />
                              <span className="text-sm font-bold text-foreground">
                                {course.stats?.averageRating
                                  ? Number(course.stats.averageRating).toFixed(1)
                                  : "5.0"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </article>
                    </TiltedCard>
                  </AnimatedContent>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
