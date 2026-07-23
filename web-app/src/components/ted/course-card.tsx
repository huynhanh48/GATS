import Link from "next/link";
import { BookOpen, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Surface } from "@/components/ui/surface";
import { resolveMediaUrl } from "@/lib/media/url";
import type { Course } from "@/types/course";

const priceFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const levelLabels: Record<Course["level"], string> = {
  beginner: "Cơ bản",
  intermediate: "Trung cấp",
  advanced: "Nâng cao",
};

function TedCourseCard({ course }: { course: Course }) {
  const currentPrice = course.salePrice ?? course.price;
  const rating = course.stats?.averageRating;

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group block h-full rounded-2xl outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
    >
      <Surface className="h-full overflow-hidden transition-[transform,box-shadow] duration-200 group-hover:-translate-y-1 group-hover:shadow-[var(--shadow-elevated)]">
        <div className="relative aspect-[16/10] overflow-hidden bg-accent/70 p-2">
          {course.thumbnail ? (
            <img
              src={resolveMediaUrl(course.thumbnail)}
              alt=""
              loading="lazy"
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-brand-primary">
              <BookOpen className="size-10" aria-hidden="true" />
            </div>
          )}
          <Badge className="absolute left-3 top-3">{levelLabels[course.level]}</Badge>
        </div>

        <div className="flex min-h-48 flex-col p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-primary">
            {course.category?.name ?? "Khóa học"}
          </p>
          <h3 className="mt-2 line-clamp-2 text-lg font-semibold leading-6 group-hover:text-brand-primary">
            {course.title}
          </h3>
          <div className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
            {rating ? (
              <span className="inline-flex items-center gap-1">
                <Star className="size-4 fill-brand-accent text-brand-accent" aria-hidden="true" />
                {rating.toFixed(1)}
              </span>
            ) : null}
            {course.stats?.lessonCount ? <span>{course.stats.lessonCount} bài học</span> : null}
          </div>
          <div className="mt-auto flex items-end gap-2 pt-5">
            <span className="text-lg font-bold text-brand-primary">
              {currentPrice === 0 ? "Miễn phí" : priceFormatter.format(currentPrice)}
            </span>
            {course.salePrice != null && course.salePrice < course.price ? (
              <span className="pb-0.5 text-sm text-muted-foreground line-through">
                {priceFormatter.format(course.price)}
              </span>
            ) : null}
          </div>
        </div>
      </Surface>
    </Link>
  );
}

export { TedCourseCard };
