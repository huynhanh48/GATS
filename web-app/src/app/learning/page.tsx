"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Check,
  CircleAlert,
  Clock3,
  GraduationCap,
  Play,
  RotateCcw,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/hooks/useAuth";
import { resolveMediaUrl } from "@/lib/media/url";
import {
  fetchCourseProgress,
  fetchMyEnrollments,
  type CourseProgress,
  type EnrollmentWithCourse,
} from "@/services/learning.service";

type LearningCard = EnrollmentWithCourse & {
  progress: CourseProgress;
};

type CourseFilter = "all" | "in_progress" | "completed";

const FILTERS: Array<{ value: CourseFilter; label: string }> = [
  { value: "all", label: "Tất cả" },
  { value: "in_progress", label: "Đang học" },
  { value: "completed", label: "Hoàn thành" },
];

function clampProgress(value: number) {
  return Math.min(100, Math.max(0, Math.round(value || 0)));
}

function getCourseStatus(percent: number) {
  if (percent >= 100) {
    return {
      label: "Đã hoàn thành",
      className: "bg-emerald-500/90 text-white",
      icon: Check,
    };
  }
  if (percent > 0) {
    return {
      label: "Đang học",
      className: "bg-primary text-primary-foreground",
      icon: Clock3,
    };
  }
  return {
    label: "Chưa bắt đầu",
    className: "bg-background/90 text-foreground border border-border",
    icon: BookOpen,
  };
}

function LearningSkeleton() {
  return (
    <main className="min-h-screen bg-background pt-24" aria-busy="true">
      <Header />
      <div className="mx-auto max-w-6xl animate-pulse space-y-10 px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-3">
          <div className="h-4 w-40 rounded bg-muted" />
          <div className="h-9 w-64 rounded bg-muted" />
        </div>
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="grid lg:grid-cols-[1.2fr_1fr]">
            <div className="aspect-video bg-muted lg:aspect-auto lg:min-h-72" />
            <div className="space-y-4 p-6 sm:p-8">
              <div className="h-4 w-28 rounded bg-muted" />
              <div className="h-8 w-4/5 rounded bg-muted" />
              <div className="h-2 w-full rounded-full bg-muted" />
              <div className="h-11 w-36 rounded-xl bg-muted" />
            </div>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="overflow-hidden rounded-2xl border border-border bg-card"
            >
              <div className="aspect-video bg-muted" />
              <div className="space-y-3 p-4">
                <div className="h-5 w-4/5 rounded bg-muted" />
                <div className="h-2 rounded-full bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only">Đang tải khóa học...</span>
    </main>
  );
}

export default function LearningHubPage() {
  const { status } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<LearningCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [filter, setFilter] = useState<CourseFilter>("all");

  useEffect(() => {
    if (status === "anonymous") router.push("/");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const enrollments = await fetchMyEnrollments();
        const active = enrollments.filter(
          (enrollment) =>
            enrollment.status === "active" ||
            enrollment.status === "completed" ||
            !enrollment.status,
        );
        const withProgress = await Promise.all(
          active.map(async (enrollment) => {
            try {
              const progress = await fetchCourseProgress(enrollment.courseId);
              return { ...enrollment, progress };
            } catch {
              return {
                ...enrollment,
                progress: { completedLessons: 0, totalLessons: 0, percent: 0 },
              };
            }
          }),
        );
        if (!cancelled) setItems(withProgress);
      } catch (err: unknown) {
        console.error(err);
        if (!cancelled) {
          setItems([]);
          setError(
            err instanceof Error
              ? err.message
              : "Không tải được danh sách khóa học",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [status, reloadKey]);

  const inProgress = useMemo(
    () =>
      items
        .filter(
          (item) => item.progress.percent > 0 && item.progress.percent < 100,
        )
        .toSorted((a, b) => b.progress.percent - a.progress.percent),
    [items],
  );
  const continueCourse =
    inProgress[0] ?? items.find((item) => item.progress.percent < 100);
  const filteredItems = items.filter((item) => {
    if (filter === "in_progress") return item.progress.percent < 100;
    if (filter === "completed") return item.progress.percent >= 100;
    return true;
  });

  if (status === "loading" || loading) return <LearningSkeleton />;

  return (
    <main className="min-h-screen bg-background pt-24 text-foreground">
      <Header />

      <div className="mx-auto w-full max-w-6xl px-4 pb-20 pt-8 sm:px-6 sm:pt-10 lg:px-8">
        <header className="mb-8 sm:mb-10">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Học tập của tôi
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">
            Tiếp tục bài đang học hoặc chọn khóa trong thư viện của bạn.
          </p>
        </header>

        {error ? (
          <section className="mb-10 flex flex-col items-center rounded-2xl border border-destructive/25 bg-destructive/5 px-6 py-12 text-center">
            <span className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-destructive/10 text-destructive">
              <CircleAlert className="h-6 w-6" aria-hidden="true" />
            </span>
            <h2 className="text-lg font-bold">Không thể tải khóa học</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              {error}
            </p>
            <button
              type="button"
              onClick={() => setReloadKey((key) => key + 1)}
              className="mt-5 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition duration-200 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Thử lại
            </button>
          </section>
        ) : null}

        {!error && continueCourse ? (
          <section aria-labelledby="continue-learning" className="mb-12">
            <h2
              id="continue-learning"
              className="mb-4 text-lg font-semibold sm:text-xl"
            >
              Tiếp tục học
            </h2>

            <article className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition duration-200 hover:border-primary/30 hover:shadow-md motion-reduce:transition-none">
              <div className="grid lg:grid-cols-[1.25fr_1fr]">
                <div className="relative aspect-video overflow-hidden bg-muted lg:aspect-auto lg:min-h-72">
                  <img
                    src={resolveMediaUrl(continueCourse.course.thumbnail)}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.03] motion-reduce:transform-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-black/10" />
                </div>

                <div className="flex flex-col justify-center p-5 sm:p-7 lg:p-8">
                  <p className="text-xs font-medium text-primary">
                    Khóa đang học
                  </p>
                  <h3 className="mt-2 text-balance text-xl font-bold leading-snug sm:text-2xl">
                    {continueCourse.course.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {continueCourse.progress.completedLessons}/
                    {continueCourse.progress.totalLessons} bài ·{" "}
                    {clampProgress(continueCourse.progress.percent)}%
                  </p>

                  <div className="mt-5">
                    <div
                      className="h-1.5 overflow-hidden rounded-full bg-muted"
                      role="progressbar"
                      aria-label={`Tiến độ khóa học ${continueCourse.course.title}`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={clampProgress(
                        continueCourse.progress.percent,
                      )}
                    >
                      <div
                        className="h-full rounded-full bg-primary transition-[width] duration-500 motion-reduce:transition-none"
                        style={{
                          width: `${clampProgress(continueCourse.progress.percent)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <Link
                    href={`/learn/${continueCourse.course.slug}`}
                    className="mt-6 inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 self-stretch rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition duration-200 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:self-start"
                  >
                    <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                    Vào học
                  </Link>
                </div>
              </div>
            </article>
          </section>
        ) : null}

        {!error && items.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
              <GraduationCap className="h-7 w-7" aria-hidden="true" />
            </span>
            <h2 className="mt-5 text-xl font-bold">Chưa có khóa học nào</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Khám phá thư viện GATS và bắt đầu hành trình học phù hợp với mục
              tiêu của bạn.
            </p>
            <Link
              href="/courses"
              className="mt-6 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition duration-200 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Khám phá khóa học
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </section>
        ) : null}

        {!error && items.length > 0 ? (
          <section aria-labelledby="course-library">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 id="course-library" className="text-lg font-semibold sm:text-xl">
                Khóa học của tôi
              </h2>
              <div
                className="flex max-w-full gap-1 overflow-x-auto rounded-xl bg-muted/70 p-1"
                role="group"
                aria-label="Lọc khóa học"
              >
                {FILTERS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFilter(option.value)}
                    aria-pressed={filter === option.value}
                    className={`min-h-10 shrink-0 cursor-pointer rounded-lg px-3.5 py-2 text-sm font-medium transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      filter === option.value
                        ? "bg-primary/10 text-primary shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredItems.length > 0 ? (
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filteredItems.map((item) => {
                  const percent = clampProgress(item.progress.percent);
                  const courseStatus = getCourseStatus(percent);
                  const StatusIcon = courseStatus.icon;
                  return (
                    <Link
                      key={item.id}
                      href={`/learn/${item.course.slug}`}
                      className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition duration-200 hover:border-primary/35 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                    >
                      <div className="relative aspect-video overflow-hidden bg-muted">
                        <img
                          src={resolveMediaUrl(item.course.thumbnail)}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.04] motion-reduce:transform-none"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                        <span
                          className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm backdrop-blur ${courseStatus.className}`}
                        >
                          <StatusIcon
                            className="h-3 w-3"
                            aria-hidden="true"
                          />
                          {courseStatus.label}
                        </span>
                        <span className="absolute bottom-3 right-3 rounded-lg bg-background/95 px-2.5 py-1 text-[11px] font-semibold text-foreground opacity-0 shadow-sm transition duration-200 group-hover:opacity-100 motion-reduce:opacity-100">
                          Vào học
                        </span>
                      </div>
                      <div className="p-4">
                        <h3 className="line-clamp-2 text-base font-semibold leading-snug transition-colors group-hover:text-primary">
                          {item.course.title}
                        </h3>
                        <div className="mt-4">
                          <div className="mb-1.5 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                            <span>
                              {item.progress.completedLessons}/
                              {item.progress.totalLessons} bài
                            </span>
                            <span className="font-semibold text-foreground">
                              {percent}%
                            </span>
                          </div>
                          <div
                            className="h-1.5 overflow-hidden rounded-full bg-muted"
                            role="progressbar"
                            aria-label={`Tiến độ khóa học ${item.course.title}`}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={percent}
                          >
                            <div
                              className={`h-full rounded-full ${percent >= 100 ? "bg-emerald-500" : "bg-primary"}`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
                <BookOpen
                  className="mx-auto h-8 w-8 text-muted-foreground"
                  aria-hidden="true"
                />
                <p className="mt-3 font-semibold">
                  Chưa có khóa học trong mục này
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Chọn bộ lọc khác để xem khóa học của bạn.
                </p>
              </div>
            )}
          </section>
        ) : null}
      </div>

      <Footer />
    </main>
  );
}
