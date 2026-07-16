import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Clock3,
  GraduationCap,
  ShoppingCart,
} from "lucide-react";
import { LandingNav } from "@/components/Landing/LandingNav";
import { beFetch } from "@/lib/api/server";
import type {
  CoursePublic,
  EnrollmentListResponse,
  EnrollmentRecord,
} from "@/lib/api/types";
import {
  LANDING_COURSES,
  formatCourseLevel,
  formatDurationHours,
  formatLandingPrice,
  hasActiveSale,
  resolveCourseThumbnail,
  type LandingCourse,
} from "@/lib/landing/courses";

export const metadata: Metadata = {
  title: "Khóa học của tôi | GATS Academy",
};

type EnrollmentWithCourse = EnrollmentRecord & {
  course: CoursePublic | null;
};

async function loadMyCourses(): Promise<EnrollmentWithCourse[]> {
  const result = await beFetch<EnrollmentListResponse>("/me/enrollments");
  if (!result.ok || !result.data?.data) return [];

  const enrollments = result.data.data.filter((e) => e.status === "active");

  return Promise.all(
    enrollments.map(async (enrollment) => {
      const courseRes = await beFetch<{ course: CoursePublic }>(
        `/courses/${enrollment.courseId}`,
      );
      return {
        ...enrollment,
        course: courseRes.data?.course ?? null,
      };
    }),
  );
}

function SuggestedCourseCard({
  course,
  index,
}: {
  course: LandingCourse;
  index: number;
}) {
  const duration = formatDurationHours(course.durationMinutes);
  const content =
    course.lessonCount > 0
      ? `${course.lessonCount} bài${duration ? ` · ${duration}` : ""}`
      : formatCourseLevel(course.level);

  return (
    <article className="group overflow-hidden rounded-[8px] border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/70 dark:border-slate-800 dark:bg-[#111] dark:hover:border-slate-600 dark:hover:shadow-none">
      <Link
        href={`/course/${course.slug}`}
        className="relative block aspect-[16/10] bg-slate-100 dark:bg-[#222]"
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
          {hasActiveSale(course) ? (
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

      <div className="p-5">
        <p className="text-xs font-semibold tracking-wide text-orange-600 uppercase">
          {course.tag}
        </p>
        <h3 className="mt-2 text-xl leading-snug font-bold text-slate-950 dark:text-white">
          {course.title}
        </h3>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
          {course.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-300">
          <span className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 dark:border-slate-700 dark:bg-[#222]">
            <GraduationCap className="size-3.5" aria-hidden="true" />
            {formatCourseLevel(course.level)}
          </span>
          <span className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 dark:border-slate-700 dark:bg-[#222]">
            <Clock3 className="size-3.5" aria-hidden="true" />
            {content}
          </span>
        </div>

        <div className="mt-5 flex items-center justify-between gap-4 border-t border-slate-100 pt-4 dark:border-slate-800">
          <p
            className={
              course.isFree
                ? "text-lg font-bold text-emerald-600"
                : "text-lg font-bold text-slate-950 dark:text-white"
            }
          >
            {formatLandingPrice(course)}
          </p>
          <Link
            href={`/course/${course.slug}`}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 dark:bg-white dark:text-slate-950 dark:hover:bg-orange-500 dark:hover:text-white"
          >
            Xem khóa
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default async function MyCoursesPage() {
  const items = await loadMyCourses();
  const suggestedCourses = LANDING_COURSES.slice(0, 6);

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-950 dark:bg-black dark:text-white">
      <LandingNav active="my-courses" tone="light" />

      <main className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
        <section className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <div className="inline-flex min-h-10 items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 text-sm font-semibold text-orange-700">
              <BookOpen className="size-4" aria-hidden="true" />
              Không gian học tập cá nhân
            </div>
            <h1 className="mt-5 text-4xl leading-tight font-bold tracking-tight md:text-5xl">
              Khóa học của tôi
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300">
              Khu vực này chỉ hiện các khóa bạn đã ghi danh hoặc mua thành công.
              Nếu chưa có khóa nào, bạn có thể chọn ngay từ catalog bên dưới.
            </p>
          </div>

          <div className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#111]">
            <div className="flex items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                <ShoppingCart className="size-5" aria-hidden="true" />
              </div>
              <div>
                <p className="font-bold text-slate-950 dark:text-white">
                  {items.length > 0
                    ? `${items.length} khóa đang học`
                    : "Bạn chưa có khóa trong tài khoản"}
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  Bấm vào một khóa ở catalog để xem chi tiết, học miễn phí hoặc
                  thêm vào giỏ hàng.
                </p>
              </div>
            </div>
          </div>
        </section>

        {items.length > 0 ? (
          <section className="mt-12">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold tracking-[0.2em] text-orange-600 uppercase">
                  Đang học
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
                  Các khóa đã ghi danh
                </h2>
              </div>
              <Link
                href="/course"
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-950 dark:border-slate-700 dark:bg-[#111] dark:text-slate-200 dark:hover:border-white"
              >
                Xem catalog
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item, index) => {
                const course = item.course;
                if (!course) {
                  return (
                    <div
                      key={item.id}
                      className="rounded-[8px] border border-slate-200 bg-white p-5 text-sm text-slate-500 dark:border-slate-800 dark:bg-[#111] dark:text-slate-400"
                    >
                      Khóa học không còn khả dụng ({item.courseId})
                    </div>
                  );
                }
                return (
                  <Link
                    key={item.id}
                    href={`/course/${course.slug}`}
                    className="group overflow-hidden rounded-[8px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/70 dark:border-slate-800 dark:bg-[#111] dark:hover:shadow-none"
                  >
                    <div className="relative aspect-video bg-slate-100 dark:bg-[#222]">
                      <Image
                        src={resolveCourseThumbnail(course.thumbnail, index)}
                        alt={course.title}
                        fill
                        className="object-cover transition duration-300 group-hover:scale-[1.03]"
                        unoptimized
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-slate-950 dark:text-white">{course.title}</h3>
                      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                        Nguồn: {item.source} · Đăng ký{" "}
                        {new Date(item.enrolledAt).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : null}

        <section className="mt-12">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] text-orange-600 uppercase">
                Catalog
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
                Khóa học đang mở
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                Đây là danh sách khóa có thể xem/mua/ghi danh. Sau khi ghi danh
                thành công, khóa sẽ xuất hiện ở phần “Đang học”.
              </p>
            </div>
            <Link
              href="/course"
              className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full bg-slate-950 px-5 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 dark:bg-white dark:text-slate-950 dark:hover:bg-orange-500 dark:hover:text-white"
            >
              Mở trang course
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {suggestedCourses.map((course, index) => (
              <SuggestedCourseCard
                key={course.id}
                course={course}
                index={index}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
