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
  Layers3,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
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
      className: "bg-amber-400 text-slate-950",
      icon: Clock3,
    };
  }
  return {
    label: "Chưa bắt đầu",
    className: "bg-background/90 text-foreground",
    icon: BookOpen,
  };
}

function LearningSkeleton() {
  return (
    <main className="min-h-screen bg-background pt-24" aria-busy="true">
      <Header />
      <div className="mx-auto max-w-7xl animate-pulse space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <div className="h-56 rounded-[2rem] bg-muted" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="overflow-hidden rounded-3xl border border-border bg-card">
              <div className="aspect-video bg-muted" />
              <div className="space-y-4 p-5">
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
          setError(err instanceof Error ? err.message : "Không tải được danh sách khóa học");
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
        .filter((item) => item.progress.percent > 0 && item.progress.percent < 100)
        .toSorted((a, b) => b.progress.percent - a.progress.percent),
    [items],
  );
  const completedCount = items.filter((item) => item.progress.percent >= 100).length;
  const continueCourse = inProgress[0] ?? items.find((item) => item.progress.percent < 100);
  const filteredItems = items.filter((item) => {
    if (filter === "in_progress") return item.progress.percent < 100;
    if (filter === "completed") return item.progress.percent >= 100;
    return true;
  });

  if (status === "loading" || loading) return <LearningSkeleton />;

  return (
    <main className="relative min-h-screen overflow-hidden bg-background pt-24 text-foreground">
      <Header />

      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[36rem] overflow-hidden">
        <div className="absolute -left-32 top-28 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-24 top-10 h-96 w-96 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/.28)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/.28)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-20 pt-8 sm:px-6 sm:pt-12 lg:px-8">
        <section className="relative overflow-hidden rounded-[2rem] border border-primary/15 bg-gradient-to-br from-slate-950 via-slate-900 to-primary/80 px-6 py-8 text-white shadow-2xl shadow-primary/10 sm:px-10 sm:py-10 lg:px-12">
          <div aria-hidden="true" className="absolute -right-16 -top-24 h-72 w-72 rounded-full border-[48px] border-white/5" />
          <div aria-hidden="true" className="absolute bottom-0 right-1/4 h-32 w-32 translate-y-1/2 rounded-full bg-amber-300/20 blur-2xl" />
          <div className="relative grid items-end gap-8 lg:grid-cols-[1fr_auto]">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-amber-200 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Không gian học tập
              </div>
              <h1 className="text-balance text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Tiếp tục hành trình, chinh phục mục tiêu.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                Mọi khóa học và tiến độ của bạn được tập trung tại đây. Chọn một bài học và duy trì nhịp học mỗi ngày.
              </p>
              <Link
                href="/courses"
                className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
              >
                Khám phá khóa học
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { value: items.length, label: "Khóa học", icon: Layers3 },
                { value: inProgress.length, label: "Đang học", icon: Clock3 },
                { value: completedCount, label: "Hoàn thành", icon: Trophy },
              ].map((stat) => (
                <div key={stat.label} className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.08] p-3 backdrop-blur sm:min-w-28 sm:p-4">
                  <stat.icon className="mb-3 h-5 w-5 text-amber-300" aria-hidden="true" />
                  <p className="text-2xl font-black sm:text-3xl">{stat.value}</p>
                  <p className="mt-1 truncate text-[11px] font-medium text-slate-300 sm:text-xs">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {error ? (
          <section className="mt-8 flex flex-col items-center rounded-3xl border border-destructive/25 bg-destructive/5 px-6 py-12 text-center">
            <span className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-destructive/10 text-destructive">
              <CircleAlert className="h-6 w-6" aria-hidden="true" />
            </span>
            <h2 className="text-xl font-black">Không thể tải khóa học</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">{error}</p>
            <button
              type="button"
              onClick={() => setReloadKey((key) => key + 1)}
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Thử lại
            </button>
          </section>
        ) : null}

        {!error && continueCourse ? (
          <section aria-labelledby="continue-learning" className="mt-10">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Dành cho bạn</p>
                <h2 id="continue-learning" className="mt-1 text-2xl font-black sm:text-3xl">Tiếp tục học</h2>
              </div>
              <span className="hidden text-sm text-muted-foreground sm:block">Một bước nhỏ mỗi ngày</span>
            </div>

            <article className="group grid overflow-hidden rounded-[2rem] border border-border bg-card shadow-xl shadow-foreground/5 lg:grid-cols-[1.08fr_.92fr]">
              <div className="relative min-h-64 overflow-hidden bg-muted lg:min-h-[22rem]">
                <img
                  src={resolveMediaUrl(continueCourse.course.thumbnail)}
                  alt={`Ảnh bìa khóa học ${continueCourse.course.title}`}
                  className="absolute inset-0 h-full w-full bg-muted object-contain"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-slate-950/20" />
                <span className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1.5 text-xs font-black text-slate-950 shadow-lg">
                  <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                  Học tiếp
                </span>
              </div>

              <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Khóa học gần nhất</p>
                <h3 className="mt-3 text-balance text-2xl font-black leading-tight sm:text-3xl">{continueCourse.course.title}</h3>
                <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="h-4 w-4" aria-hidden="true" />
                  {continueCourse.progress.completedLessons}/{continueCourse.progress.totalLessons} bài học đã hoàn thành
                </p>

                <div className="mt-7">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-semibold text-muted-foreground">Tiến độ của bạn</span>
                    <span className="font-black text-primary">{clampProgress(continueCourse.progress.percent)}%</span>
                  </div>
                  <div
                    className="h-3 overflow-hidden rounded-full bg-muted"
                    role="progressbar"
                    aria-label={`Tiến độ khóa học ${continueCourse.course.title}`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={clampProgress(continueCourse.progress.percent)}
                  >
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-amber-400 transition-[width] duration-500"
                      style={{ width: `${clampProgress(continueCourse.progress.percent)}%` }}
                    />
                  </div>
                </div>

                <Link
                  href={`/learn/${continueCourse.course.slug}`}
                  className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 self-stretch rounded-2xl bg-primary px-6 py-3 text-sm font-black text-primary-foreground shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transform-none sm:self-start"
                >
                  <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                  Vào học ngay
                </Link>
              </div>
            </article>
          </section>
        ) : null}

        {!error && items.length === 0 ? (
          <section className="mt-10 overflow-hidden rounded-[2rem] border border-dashed border-primary/30 bg-card px-6 py-14 text-center shadow-sm">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-primary/10 text-primary">
              <GraduationCap className="h-8 w-8" aria-hidden="true" />
            </span>
            <h2 className="mt-5 text-2xl font-black">Sẵn sàng bắt đầu học?</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Bạn chưa có khóa học nào. Khám phá thư viện GATS và chọn hành trình phù hợp với mục tiêu của mình.
            </p>
            <Link
              href="/courses"
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Xem các khóa học
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </section>
        ) : null}

        {!error && items.length > 0 ? (
          <section aria-labelledby="course-library" className="mt-12">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Thư viện cá nhân</p>
                <h2 id="course-library" className="mt-1 text-2xl font-black sm:text-3xl">Khóa học của tôi</h2>
              </div>
              <div className="flex max-w-full gap-1 overflow-x-auto rounded-2xl border border-border bg-muted/60 p-1" role="group" aria-label="Lọc khóa học">
                {FILTERS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFilter(option.value)}
                    aria-pressed={filter === option.value}
                    className={`min-h-11 shrink-0 rounded-xl px-4 py-2 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      filter === option.value
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredItems.length > 0 ? (
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredItems.map((item) => {
                  const percent = clampProgress(item.progress.percent);
                  const courseStatus = getCourseStatus(percent);
                  const StatusIcon = courseStatus.icon;
                  return (
                    <Link
                      key={item.id}
                      href={`/learn/${item.course.slug}`}
                      className="group overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-xl hover:shadow-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transform-none"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                        <img
                          src={resolveMediaUrl(item.course.thumbnail)}
                          alt={`Ảnh bìa khóa học ${item.course.title}`}
                          className="absolute inset-0 h-full w-full bg-muted object-contain"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent" />
                        <span className={`absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold shadow-sm backdrop-blur ${courseStatus.className}`}>
                          <StatusIcon className="h-3.5 w-3.5" aria-hidden="true" />
                          {courseStatus.label}
                        </span>
                        <span className="absolute bottom-4 right-4 grid h-11 w-11 place-items-center rounded-full bg-white text-slate-950 shadow-lg transition group-hover:scale-105 group-hover:bg-amber-300">
                          <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                        </span>
                      </div>
                      <div className="p-5">
                        {item.course.level ? (
                          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">{item.course.level}</p>
                        ) : null}
                        <h3 className="mt-1 line-clamp-2 min-h-12 text-lg font-black leading-6 transition-colors group-hover:text-primary">{item.course.title}</h3>
                        <div className="mt-5">
                          <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                            <span className="text-muted-foreground">{item.progress.completedLessons}/{item.progress.totalLessons} bài học</span>
                            <span className="font-black text-foreground">{percent}%</span>
                          </div>
                          <div
                            className="h-2 overflow-hidden rounded-full bg-muted"
                            role="progressbar"
                            aria-label={`Tiến độ khóa học ${item.course.title}`}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={percent}
                          >
                            <div
                              className={`h-full rounded-full ${percent >= 100 ? "bg-emerald-500" : "bg-gradient-to-r from-primary to-amber-400"}`}
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
              <div className="mt-6 rounded-3xl border border-dashed border-border bg-card/60 px-6 py-10 text-center">
                <BookOpen className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
                <p className="mt-3 font-bold">Chưa có khóa học trong mục này</p>
                <p className="mt-1 text-sm text-muted-foreground">Hãy chọn bộ lọc khác để xem khóa học của bạn.</p>
              </div>
            )}
          </section>
        ) : null}
      </div>

      <Footer />
    </main>
  );
}
