import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  FileText,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { LandingNav } from "@/components/Landing/LandingNav";
import { BE_API_URL } from "@/lib/api/config";
import type { CourseListResponse, CoursePublic } from "@/lib/api/types";
import { LANDING_ARTICLES } from "@/lib/landing/articles";
import {
  LANDING_COURSES,
  filterAndSortLandingMockCourses,
  formatLandingPrice,
  formatVnd,
  hasActiveSale,
  resolveCourseThumbnail,
  type LandingCourse,
} from "@/lib/landing/courses";
import { CourseCatalogBrowser } from "./_components/course-catalog-browser";
import { CourseQuizBlock } from "./_components/course-quiz-block";

export const metadata: Metadata = {
  title: "Khóa học | GATS Academy",
  description:
    "Khám phá khóa học AI, lập trình, marketing và kỹ năng thực chiến tại GATS Academy.",
};

type CourseWithStats = CoursePublic & {
  stats?: {
    lessonCount?: number;
    totalDurationSeconds?: number;
  };
};

const TRUST_POINTS = [
  "Học theo lộ trình ngắn, có bài thực hành",
  "Thêm giỏ hàng trước khi thanh toán",
  "Có khóa miễn phí để thử chất lượng bài giảng",
] as const;

const LEARNING_PATHS = [
  {
    title: "Bắt đầu nhanh",
    description: "Chọn khóa miễn phí, làm quiz mẫu và xác định nền tảng cần học.",
    icon: Sparkles,
  },
  {
    title: "Học có dự án",
    description: "Theo từng bài ngắn, luyện prompt, automation hoặc kỹ năng nghề.",
    icon: GraduationCap,
  },
  {
    title: "Mua khóa phù hợp",
    description: "Xem giá, ưu đãi, thời lượng và thêm khóa trả phí vào giỏ hàng.",
    icon: CreditCard,
  },
] as const;

function mapBeCourse(course: CourseWithStats, index: number): LandingCourse {
  const price = course.price ?? 0;
  const salePrice = course.salePrice;
  const isFree = price <= 0;
  const totalDurationSeconds = course.stats?.totalDurationSeconds ?? 0;

  return {
    id: course.id,
    title: course.title,
    slug: course.slug,
    description: course.description ?? "",
    tag: course.tags?.[0]?.name ?? course.category?.name ?? "Khóa học",
    categoryId: course.category?.id ?? "",
    lessonCount: course.stats?.lessonCount ?? 0,
    durationMinutes: Math.round(totalDurationSeconds / 60),
    isPublished: course.status === "published",
    isFree,
    price,
    salePrice,
    thumbnail: resolveCourseThumbnail(course.thumbnail, index),
    level: course.level,
    status: course.status,
  };
}

async function loadCourses(): Promise<LandingCourse[]> {
  try {
    const res = await fetch(`${BE_API_URL}/api/courses?limit=50&page=1`, {
      next: { revalidate: 15 },
    });
    if (!res.ok) return LANDING_COURSES;

    const json = (await res.json()) as CourseListResponse;
    const published = ((json.data ?? []) as CourseWithStats[]).filter(
      (course) => course.status === "published",
    );
    const mockOnly = filterAndSortLandingMockCourses(published);
    if (mockOnly.length === 0) return LANDING_COURSES;

    return mockOnly.map(mapBeCourse);
  } catch {
    return LANDING_COURSES;
  }
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

export default async function CoursePage() {
  const courses = await loadCourses();
  const paidCount = courses.filter((course) => !course.isFree).length;
  const freeCount = courses.length - paidCount;
  const saleCount = courses.filter(hasActiveSale).length;
  const featuredCourse =
    courses.find((course) => !course.isFree && hasActiveSale(course)) ??
    courses.find((course) => !course.isFree) ??
    courses[0];

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-950 dark:bg-black dark:text-white">
      <LandingNav active="course" tone="light" />

      <main>
        <section className="px-5 pt-8 pb-16 md:px-8 md:pt-14 md:pb-20">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <div className="inline-flex min-h-10 items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 text-sm font-semibold text-orange-700">
                <Sparkles className="size-4" aria-hidden="true" />
                Khám phá chương trình học tại GATS Academy
              </div>
              <h1 className="mt-5 max-w-3xl text-4xl leading-tight font-bold tracking-tight text-slate-950 dark:text-white md:text-6xl">
                Tìm khóa học phù hợp với mục tiêu của bạn.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300 md:text-lg">
                Xem lộ trình, nội dung bài học, mức độ phù hợp và học phí trước
                khi đăng ký. Bạn có thể lọc theo chủ đề, học thử khóa miễn phí
                hoặc thêm khóa cần học vào giỏ hàng.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#catalog"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-orange-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-700"
                >
                  Xem khóa học
                  <ArrowRight className="size-4" aria-hidden="true" />
                </a>
                <a
                  href="#articles"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-950 dark:border-slate-700 dark:bg-[#111] dark:text-slate-200 dark:hover:border-white"
                >
                  Đọc bài viết
                  <FileText className="size-4" aria-hidden="true" />
                </a>
              </div>

              <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
                {[
                  { label: "Khóa mở", value: courses.length },
                  { label: "Miễn phí", value: freeCount },
                  { label: "Ưu đãi", value: saleCount },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[8px] border border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-[#111]"
                  >
                    <p className="text-2xl font-bold text-slate-950 dark:text-white">
                      {item.value}
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {featuredCourse ? (
              <div className="relative">
                <div className="absolute -inset-3 rounded-[12px] bg-orange-200/50 blur-2xl" />
                <div className="relative overflow-hidden rounded-[8px] border border-slate-200 bg-white shadow-2xl shadow-slate-200 dark:border-slate-800 dark:bg-[#111] dark:shadow-none">
                  <div className="relative aspect-[16/10] bg-slate-100 dark:bg-[#222]">
                    <Image
                      src={featuredCourse.thumbnail}
                      alt={featuredCourse.title}
                      fill
                      priority
                      className="object-cover"
                      sizes="(max-width:1024px) 100vw, 45vw"
                      unoptimized
                    />
                    <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-orange-700 shadow-sm">
                      Khóa nên bắt đầu
                    </div>
                  </div>
                  <div className="grid gap-6 p-6 md:grid-cols-[1fr_0.8fr]">
                    <div>
                      <p className="text-xs font-semibold tracking-wide text-orange-600 uppercase">
                        {featuredCourse.tag}
                      </p>
                      <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
                        {featuredCourse.title}
                      </h2>
                      <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                        {featuredCourse.description}
                      </p>
                    </div>
                    <div className="rounded-[8px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-[#222]/70">
                      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                        Gói học
                      </p>
                      <CoursePrice course={featuredCourse} />
                      <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                        {TRUST_POINTS.map((point) => (
                          <li key={point} className="flex gap-2">
                            <CheckCircle2
                              className="mt-0.5 size-4 shrink-0 text-emerald-600"
                              aria-hidden="true"
                            />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                      <Link
                        href={`/course/${featuredCourse.slug}`}
                        className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600 dark:bg-white dark:text-slate-950 dark:hover:bg-orange-500 dark:hover:text-white"
                      >
                        Xem chi tiết mua
                        <ArrowRight className="size-4" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white px-5 py-10 dark:border-slate-800 dark:bg-[#111] md:px-8">
          <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
            {LEARNING_PATHS.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex gap-4 rounded-[8px] p-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-950 dark:text-white">{item.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <CourseCatalogBrowser courses={courses} />

        <section id="articles" className="px-5 py-16 md:px-8 md:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-bold tracking-[0.2em] text-orange-600 uppercase">
                  Bài viết
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 dark:text-white md:text-4xl">
                  Đọc nhanh trước khi chọn khóa
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                  Cụm bài viết giúp người học hiểu nên bắt đầu từ đâu, giảm mơ
                  hồ trước khi bấm mua.
                </p>
              </div>
              <Link
                href="/posts"
                className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-950 dark:border-slate-700 dark:bg-[#111] dark:text-slate-200 dark:hover:border-white"
              >
                Xem tất cả bài viết
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {LANDING_ARTICLES.map((article) => (
                <article
                  key={article.id}
                  id={article.slug}
                  className="overflow-hidden rounded-[8px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#111]"
                >
                  <div className="relative aspect-[16/9] bg-slate-100 dark:bg-[#222]">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover"
                      sizes="(max-width:768px) 100vw, 33vw"
                      unoptimized
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      <span>{article.category}</span>
                      <span className="size-1 rounded-full bg-slate-300" />
                      <span>{article.readMinutes} phút đọc</span>
                    </div>
                    <h3 className="mt-3 text-xl leading-snug font-bold text-slate-950 dark:text-white">
                      {article.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                      {article.excerpt}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <CourseQuizBlock />
      </main>

      <footer className="border-t border-slate-200 bg-white px-8 py-10 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-[#111] dark:text-slate-400">
        © {new Date().getFullYear()} GATS Academy · Học thực chiến, cập nhật liên tục.
      </footer>
    </div>
  );
}
