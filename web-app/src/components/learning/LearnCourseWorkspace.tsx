"use client";

import {
  useCallback,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  HelpCircle,
  Lock,
  Menu,
  Moon,
  PlayCircle,
  RotateCcw,
  Sun,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { HlsVideoPlayer } from "@/components/common/HlsVideoPlayer";
import { LearnQuizPanel } from "@/components/learning/LearnQuizPanel";
import { LearnAssignmentPanel } from "@/components/learning/LearnAssignmentPanel";
import { LearnExtrasPanel } from "@/components/learning/LearnExtrasPanel";
import { resolveMediaUrl } from "@/lib/media/url";
import {
  fetchCourseBySlug,
  fetchCourseProgress,
  fetchLessonPlayback,
  fetchLessonProgress,
  fetchMyEnrollments,
  upsertLessonProgress,
  type CourseProgress,
} from "@/services/learning.service";

type LessonRow = {
  id: string;
  title: string;
  type?: string;
  duration?: number | null;
  preview?: boolean;
  locked?: boolean;
  content?: string | null;
  linkedPost?: {
    id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
  } | null;
};

type SectionRow = {
  id: string;
  title: string;
  lessons: LessonRow[];
};

function flattenLessons(sections: SectionRow[]): LessonRow[] {
  return sections.flatMap((s) => s.lessons ?? []);
}

function formatSeconds(total: number) {
  const s = Math.max(0, Math.floor(total));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

type Props = {
  slug: string;
  /** From `/learn/[slug]/[lessonId]` — preferred over query. */
  lessonId?: string | null;
};

export function LearnCourseWorkspace({ slug, lessonId: lessonIdProp }: Props) {
  const router = useRouter();
  const { status, user } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();

  const [course, setCourse] = useState<any>(null);
  const [sections, setSections] = useState<SectionRow[]>([]);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(
    lessonIdProp || null,
  );
  const [playbackUrl, setPlaybackUrl] = useState("");
  const [audioFlacUrl, setAudioFlacUrl] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [resumeAt, setResumeAt] = useState(0);
  const [resumePrompt, setResumePrompt] = useState<number | null>(null);
  const [courseProgress, setCourseProgress] = useState<CourseProgress>({
    completedLessons: 0,
    totalLessons: 0,
    percent: 0,
  });
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingLesson, setLoadingLesson] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openSections, setOpenSections] = useState<number[]>([]);
  const [reloadKey, setReloadKey] = useState(0);
  const [themeMounted, setThemeMounted] = useState(false);

  const lastSavedRef = useRef(0);
  const lastTickRef = useRef({ watched: 0, duration: 0 });
  const loadRequestRef = useRef(0);
  const pendingPlaybackUrlRef = useRef("");
  const lessons = useMemo(() => flattenLessons(sections), [sections]);
  const activeLesson = lessons.find((l) => l.id === activeLessonId) ?? null;
  const activeIndex = lessons.findIndex((l) => l.id === activeLessonId);
  const lessonType = (activeLesson?.type || "video").toLowerCase();

  useEffect(() => {
    if (status === "anonymous") router.push("/");
  }, [status, router]);

  useEffect(() => {
    setThemeMounted(true);
  }, []);

  useEffect(() => {
    if (lessonIdProp) setActiveLessonId(lessonIdProp);
  }, [lessonIdProp]);

  const refreshCourseProgress = useCallback(async (courseId: string) => {
    try {
      const progress = await fetchCourseProgress(courseId);
      setCourseProgress({
        completedLessons: progress.completedLessons,
        totalLessons: progress.totalLessons,
        percent: progress.percent,
      });
      if (Array.isArray(progress.completedLessonIds)) {
        setCompletedIds(new Set(progress.completedLessonIds));
      }
    } catch {
      // ignore
    }
  }, []);

  const navigateLesson = useCallback(
    (id: string) => {
      setActiveLessonId(id);
      router.replace(`/learn/${slug}/${id}`, { scroll: false });
    },
    [router, slug],
  );

  useEffect(() => {
    if (status !== "authenticated" || !slug) return;

    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const [courseData, enrollments] = await Promise.all([
          fetchCourseBySlug(slug),
          fetchMyEnrollments(),
        ]);
        if (cancelled) return;
        if (!courseData?.id) {
          setLoadError("Không tìm thấy khóa học");
          return;
        }

        const enrolled = enrollments.some(
          (e) =>
            e.courseId === courseData.id &&
            (e.status === "active" || e.status === "completed" || !e.status),
        );
        const canMentorCourse =
          Number(courseData?.author?.id) === Number(user?.id) ||
          Boolean(user?.roles?.includes("admin"));
        if (!enrolled && !canMentorCourse) {
          toast.error("Bạn chưa đăng ký khóa học này");
          router.push(`/courses/${slug}`);
          return;
        }

        const mappedSections: SectionRow[] = (courseData.sections ?? []).map(
          (s: any) => ({
            id: s.id,
            title: s.title,
            lessons: (s.lessons ?? []).map((l: any) => ({
              id: l.id,
              title: l.title,
              type: l.type,
              duration: l.duration,
              preview: l.preview ?? l.isPreview,
              locked: l.locked,
              content: l.content ?? null,
              linkedPost: l.linkedPost ?? null,
            })),
          }),
        );

        setCourse(courseData);
        setSections(mappedSections);
        const flat = flattenLessons(mappedSections);
        const preferred =
          (lessonIdProp && flat.find((l) => l.id === lessonIdProp)?.id) ||
          flat.find((l) => !l.locked)?.id ||
          flat[0]?.id ||
          null;
        const preferredSectionIdx = mappedSections.findIndex((s) =>
          (s.lessons ?? []).some((l) => l.id === preferred),
        );
        setOpenSections(preferredSectionIdx >= 0 ? [preferredSectionIdx] : [0]);
        await refreshCourseProgress(courseData.id);

        if (preferred) {
          setActiveLessonId(preferred);
          // Chỉ redirect khi URL chưa có đúng lessonId (tránh remount thừa → hủy HLS)
          if (lessonIdProp !== preferred) {
            router.replace(`/learn/${slug}/${preferred}`, { scroll: false });
          }
        }
      } catch (err: any) {
        console.error(err);
        setLoadError(err?.message || "Không tải được khóa học");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // lessonIdProp chỉ dùng cho lần load đầu — đổi bài không refetch khóa
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, slug, router, refreshCourseProgress, reloadKey]);

  const loadLesson = useEffectEvent(async (lesson: LessonRow) => {
    if (!course?.id || !lesson.id) return;
    const requestId = ++loadRequestRef.current;
    setLoadingLesson(true);
    // Không clear playbackUrl → tránh unmount HLS giữa chừng (canceled m3u8)
    setResumeAt(0);
    setResumePrompt(null);
    lastSavedRef.current = 0;
    lastTickRef.current = { watched: 0, duration: 0 };

    try {
      if ((lesson.type || "video").toLowerCase() === "video") {
        const [playback, progress] = await Promise.all([
          fetchLessonPlayback(course.id, lesson.id).catch(() => ({
            videoId: null,
            playbackUrl: "",
            audioFlacUrl: null,
          })),
          fetchLessonProgress(course.id, lesson.id).catch(() => null),
        ]);

        if (requestId !== loadRequestRef.current) return;

        const url = playback.playbackUrl
          ? resolveMediaUrl(playback.playbackUrl, "")
          : "";
        const flac = playback.audioFlacUrl
          ? resolveMediaUrl(playback.audioFlacUrl, "")
          : null;

        setVideoId(playback.videoId);
        setAudioFlacUrl(flac || null);
        if (progress?.isCompleted) {
          setCompletedIds((prev) => new Set(prev).add(lesson.id));
        }

        // Quyết định resume TRƯỚC khi gắn URL — tránh mount rồi unmount player
        if (
          progress?.watchedSeconds &&
          progress.watchedSeconds > 5 &&
          !progress.isCompleted
        ) {
          setResumePrompt(progress.watchedSeconds);
          setResumeAt(0);
          pendingPlaybackUrlRef.current = url;
          setPlaybackUrl("");
        } else {
          pendingPlaybackUrlRef.current = "";
          setResumeAt(
            progress?.watchedSeconds && !progress.isCompleted
              ? progress.watchedSeconds
              : 0,
          );
          setPlaybackUrl(url);
        }
      } else {
        setPlaybackUrl("");
        setAudioFlacUrl(null);
        pendingPlaybackUrlRef.current = "";
        const progress = await fetchLessonProgress(course.id, lesson.id).catch(
          () => null,
        );
        if (requestId !== loadRequestRef.current) return;
        if (progress?.isCompleted) {
          setCompletedIds((prev) => new Set(prev).add(lesson.id));
        }
      }
    } catch (err: any) {
      if (requestId !== loadRequestRef.current) return;
      toast.error(err?.message || "Không tải được bài học");
    } finally {
      if (requestId === loadRequestRef.current) {
        setLoadingLesson(false);
      }
    }
  });

  useEffect(() => {
    if (!course?.id || !activeLessonId || !activeLesson) return;
    void loadLesson(activeLesson);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLessonId, course?.id]);

  const saveProgress = useEffectEvent(
    async (watched: number, duration: number, force = false) => {
      if (!course?.id || !activeLessonId) return;
      if (!force && watched - lastSavedRef.current < 8) return;
      lastSavedRef.current = watched;
      try {
        const res: any = await upsertLessonProgress(course.id, activeLessonId, {
          watched_seconds: watched,
          duration_seconds: duration > 0 ? duration : undefined,
          video_id: videoId ?? undefined,
        });
        if (res?.data?.isCompleted) {
          setCompletedIds((prev) => new Set(prev).add(activeLessonId));
        }
        await refreshCourseProgress(course.id);
      } catch {
        // silent
      }
    },
  );

  useEffect(() => {
    return () => {
      const { watched, duration } = lastTickRef.current;
      if (watched > 0 && duration > 0) {
        void saveProgress(watched, duration, true);
      }
    };
  }, [activeLessonId, saveProgress]);

  const handleTimeUpdate = (watched: number, duration: number) => {
    lastTickRef.current = { watched, duration };
    void saveProgress(watched, duration, false);
  };

  const handlePauseSave = (watched: number, duration: number) => {
    lastTickRef.current = { watched, duration };
    void saveProgress(watched, duration, true);
  };

  const markComplete = async () => {
    if (!course?.id || !activeLessonId) return;
    try {
      const duration =
        activeLesson?.duration && activeLesson.duration > 0
          ? activeLesson.duration
          : Math.max(lastTickRef.current.duration, 100);
      await upsertLessonProgress(course.id, activeLessonId, {
        watched_seconds: duration,
        duration_seconds: duration,
        video_id: videoId ?? undefined,
      });
      setCompletedIds((prev) => new Set(prev).add(activeLessonId));
      await refreshCourseProgress(course.id);
      toast.success("Đã đánh dấu hoàn thành bài học");
    } catch (err: any) {
      toast.error(err?.message || "Không cập nhật được tiến độ");
    }
  };

  const goRelative = (delta: number) => {
    const next = lessons[activeIndex + delta];
    if (!next || next.locked) {
      toast.info(delta > 0 ? "Đây là bài cuối" : "Đây là bài đầu");
      return;
    }
    navigateLesson(next.id);
    setSidebarOpen(false);
  };

  useEffect(() => {
    if (!activeLessonId || sections.length === 0) return;
    const idx = sections.findIndex((s) =>
      (s.lessons ?? []).some((l) => l.id === activeLessonId),
    );
    if (idx < 0) return;
    setOpenSections((prev) => (prev.includes(idx) ? prev : [...prev, idx]));
  }, [activeLessonId, sections]);

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background font-sans">
        <div className="space-y-3 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Đang tải lớp học…</p>
        </div>
      </div>
    );
  }

  if (loadError || !course) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4 text-center font-sans">
        <p className="text-destructive font-semibold">
          {loadError || "Không tải được lớp học"}
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-bold"
          >
            <RotateCcw className="w-4 h-4" /> Thử lại
          </button>
          <Link
            href="/learning"
            className="rounded-xl border border-border px-4 py-2 text-sm font-semibold"
          >
            Về Học tập
          </Link>
        </div>
      </div>
    );
  }

  const hasContent =
    typeof activeLesson?.content === "string" &&
    activeLesson.content.trim().length > 0;

  const lessonTypeIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t === "quiz") return HelpCircle;
    if (t === "assignment") return ClipboardList;
    if (t === "text") return FileText;
    return PlayCircle;
  };

  const lessonList = (mobile: boolean) =>
    sections.map((section, sIdx) => {
      const open = openSections.includes(sIdx);
      return (
        <div
          key={section.id || sIdx}
          className={mobile ? "mb-3" : "border-b border-border/70 last:border-b-0"}
        >
          {mobile ? (
            <p className="mb-1 px-1 text-xs font-semibold text-muted-foreground">
              {section.title}
            </p>
          ) : (
            <button
              type="button"
              onClick={() =>
                setOpenSections((prev) =>
                  prev.includes(sIdx)
                    ? prev.filter((i) => i !== sIdx)
                    : [...prev, sIdx],
                )
              }
              className="flex min-h-12 w-full cursor-pointer items-center justify-between gap-2 px-4 py-2.5 text-left text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
            >
              <span className="line-clamp-2">{section.title}</span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
              />
            </button>
          )}
          {(mobile || open) && (
            <ul className={mobile ? "space-y-0.5" : "space-y-0.5 pb-2"}>
              {(section.lessons ?? []).map((lesson) => {
                const active = lesson.id === activeLessonId;
                const done = completedIds.has(lesson.id);
                const locked = Boolean(lesson.locked);
                const type = (lesson.type || "video").toLowerCase();
                const TypeIcon = lessonTypeIcon(type);
                return (
                  <li key={lesson.id}>
                    <button
                      type="button"
                      disabled={locked}
                      onClick={() => {
                        if (locked) return;
                        navigateLesson(lesson.id);
                        setSidebarOpen(false);
                      }}
                      className={`relative flex min-h-12 w-full cursor-pointer items-start gap-3 px-4 py-2.5 text-left text-sm transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary ${
                        active
                          ? mobile
                            ? "rounded-xl bg-primary/10 font-semibold text-primary"
                            : "bg-primary/[0.07] font-semibold text-primary before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:rounded-r-full before:bg-primary"
                          : locked
                            ? "cursor-not-allowed opacity-45"
                            : mobile
                              ? "rounded-xl text-foreground hover:bg-muted"
                              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      }`}
                    >
                      <span
                        className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md ${
                          done
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : active
                              ? "bg-primary/15 text-primary"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {locked ? (
                          <Lock className="h-3.5 w-3.5" />
                        ) : done ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          <TypeIcon className="h-3.5 w-3.5" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-2 block leading-5">
                          {lesson.title}
                        </span>
                        <span className="mt-0.5 block text-[11px] font-medium text-muted-foreground">
                          {type === "quiz"
                            ? "Quiz"
                            : type === "assignment"
                              ? "Bài tập"
                              : type === "text"
                                ? "Bài đọc"
                                : "Video"}
                          {lesson.duration
                            ? ` · ${Math.ceil(lesson.duration / 60)} phút`
                            : ""}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      );
    });

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1536px] items-center gap-3 px-3 sm:px-5">
          <Link
            href="/learning"
            className="inline-flex min-h-10 shrink-0 cursor-pointer items-center gap-2 rounded-lg px-2.5 text-sm font-medium text-muted-foreground transition duration-200 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Học tập</span>
          </Link>
          <div className="min-w-0 flex-1 border-l border-border pl-3 sm:pl-4">
            <h1 className="truncate text-sm font-semibold sm:text-[15px]">
              {course.title}
            </h1>
          </div>
          <div className="hidden items-center gap-2 rounded-full bg-muted/80 px-3 py-1.5 text-xs font-semibold text-foreground sm:flex">
            {courseProgress.percent}% · {courseProgress.completedLessons}/
            {courseProgress.totalLessons}
          </div>
          {themeMounted ? (
            <button
              type="button"
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
              className="grid min-h-10 min-w-10 cursor-pointer place-items-center rounded-lg text-muted-foreground transition duration-200 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label={
                resolvedTheme === "dark"
                  ? "Chuyển sang giao diện sáng"
                  : "Chuyển sang giao diện tối"
              }
            >
              {resolvedTheme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
          ) : null}
          <button
            type="button"
            className="grid min-h-10 min-w-10 cursor-pointer place-items-center rounded-lg border border-border transition duration-200 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Mở mục lục"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1536px] flex-1 items-start gap-6 px-3 py-4 sm:px-5 lg:py-6">
        <main className="flex min-w-0 flex-1 flex-col">
          {lessonType === "video" ? (
            <div className="w-full">
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-lg shadow-black/15">
                {playbackUrl && resumePrompt == null ? (
                  <HlsVideoPlayer
                    url={playbackUrl}
                    initialTime={resumeAt > 5 ? resumeAt : undefined}
                    onTimeUpdate={handleTimeUpdate}
                    onPlaybackPause={handlePauseSave}
                  />
                ) : resumePrompt != null ? (
                  <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-white/70">
                    Chọn tiếp tục hoặc xem từ đầu…
                  </div>
                ) : loadingLesson ? (
                  <div className="absolute inset-0 flex items-center justify-center text-sm text-white/70">
                    Đang tải bài học…
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-white/70">
                    {hasContent || activeLesson?.linkedPost
                      ? "Bài học chưa có video — xem nội dung bên dưới."
                      : "Video chưa sẵn sàng cho bài này."}
                  </div>
                )}

                {resumePrompt != null ? (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 p-4">
                    <div className="w-full max-w-sm space-y-4 rounded-2xl bg-card p-5 text-card-foreground shadow-xl">
                      <p className="font-semibold">Tiếp tục xem?</p>
                      <p className="text-sm text-muted-foreground">
                        Bạn đã xem đến {formatSeconds(resumePrompt)}. Muốn tiếp
                        tục hay xem từ đầu?
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="min-h-10 flex-1 cursor-pointer rounded-xl bg-primary py-2 text-sm font-semibold text-primary-foreground"
                          onClick={() => {
                            setResumeAt(resumePrompt);
                            setPlaybackUrl(pendingPlaybackUrlRef.current);
                            pendingPlaybackUrlRef.current = "";
                            setResumePrompt(null);
                          }}
                        >
                          Tiếp tục
                        </button>
                        <button
                          type="button"
                          className="min-h-10 flex-1 cursor-pointer rounded-xl border border-border py-2 text-sm font-medium"
                          onClick={() => {
                            setResumeAt(0);
                            setPlaybackUrl(pendingPlaybackUrlRef.current);
                            pendingPlaybackUrlRef.current = "";
                            setResumePrompt(null);
                          }}
                        >
                          Từ đầu
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
              {audioFlacUrl ? (
                <div className="mt-2 flex w-full justify-end">
                  <a
                    href={audioFlacUrl}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Tải audio FLAC
                  </a>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">
                Bài {activeIndex + 1} / {lessons.length}
              </p>
              <h2 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
                {activeLesson?.title ?? "Chọn bài học"}
              </h2>
              {activeLessonId && completedIds.has(activeLessonId) ? (
                <p className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Đã hoàn thành
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <button
                type="button"
                onClick={() => goRelative(-1)}
                disabled={activeIndex <= 0}
                className="inline-flex min-h-10 cursor-pointer items-center gap-1 rounded-xl border border-border bg-background px-3.5 py-2 text-sm font-medium text-muted-foreground transition duration-200 hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" /> Trước
              </button>
              <button
                type="button"
                onClick={() => goRelative(1)}
                disabled={activeIndex < 0 || activeIndex >= lessons.length - 1}
                className="inline-flex min-h-10 cursor-pointer items-center gap-1 rounded-xl border border-border bg-background px-3.5 py-2 text-sm font-medium text-muted-foreground transition duration-200 hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
              >
                Sau <ChevronRight className="h-4 w-4" />
              </button>
              {lessonType === "video" || lessonType === "text" ? (
                <button
                  type="button"
                  onClick={() => void markComplete()}
                  disabled={!activeLessonId}
                  className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition duration-200 hover:bg-primary/90 disabled:opacity-40"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Hoàn thành
                </button>
              ) : null}
            </div>
          </div>

          <div className="mt-6 space-y-6 border-t border-border/70 pt-6">
            {lessonType === "quiz" && course?.id && activeLessonId ? (
              <LearnQuizPanel
                courseId={course.id}
                lessonId={activeLessonId}
                onPassed={() => {
                  setCompletedIds((prev) => new Set(prev).add(activeLessonId));
                  void refreshCourseProgress(course.id);
                }}
              />
            ) : null}

            {lessonType === "assignment" && course?.id && activeLessonId ? (
              <LearnAssignmentPanel
                courseId={course.id}
                lessonId={activeLessonId}
                onSubmitted={() => void refreshCourseProgress(course.id)}
              />
            ) : null}

            {hasContent ? (
              <div
                className="prose dark:prose-invert mx-auto w-full max-w-4xl rounded-2xl bg-muted/25 px-4 py-5 text-[16px] leading-7 sm:px-6 sm:py-6"
                dangerouslySetInnerHTML={{ __html: activeLesson!.content! }}
              />
            ) : null}

            {activeLesson?.linkedPost ? (
              <Link
                href={`/posts/${activeLesson.linkedPost.slug}`}
                className="group mx-auto block max-w-4xl rounded-2xl border border-border/70 bg-muted/20 p-4 transition duration-200 hover:border-primary/35 hover:bg-muted/35"
              >
                <p className="mb-1 text-xs font-medium text-muted-foreground">
                  Bài viết liên quan
                </p>
                <p className="font-semibold text-foreground group-hover:text-primary">
                  {activeLesson.linkedPost.title}
                </p>
                {activeLesson.linkedPost.excerpt ? (
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {activeLesson.linkedPost.excerpt}
                  </p>
                ) : null}
              </Link>
            ) : null}

            {course?.id && activeLessonId ? (
              <LearnExtrasPanel
                courseId={course.id}
                lessonId={activeLessonId}
              />
            ) : null}
          </div>
        </main>

        <aside className="sticky top-16 hidden max-h-[calc(100vh-5rem)] w-[320px] shrink-0 flex-col self-start overflow-hidden rounded-2xl border border-border/80 bg-card xl:w-[340px] lg:flex">
          <div className="border-b border-border/70 p-4">
            <div className="flex items-end justify-between gap-3">
              <h3 className="text-sm font-semibold">Nội dung khóa học</h3>
              <span className="text-xs font-medium text-muted-foreground">
                {courseProgress.completedLessons}/{courseProgress.totalLessons}{" "}
                bài
              </span>
            </div>
            <div
              className="mt-3 h-1 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-label="Tiến độ khóa học"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={courseProgress.percent}
            >
              <div
                className="h-full rounded-full bg-primary transition-all duration-500 motion-reduce:transition-none"
                style={{ width: `${courseProgress.percent}%` }}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">{lessonList(false)}</div>
        </aside>
      </div>

      {sidebarOpen ? (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <button
            type="button"
            className="flex-1 bg-black/60 backdrop-blur-sm"
            aria-label="Đóng"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="flex h-full w-[88vw] max-w-sm flex-col border-l border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/70 p-4">
              <div>
                <h3 className="font-semibold">Nội dung khóa học</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {courseProgress.percent}% · {courseProgress.completedLessons}/
                  {courseProgress.totalLessons} bài
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="grid min-h-10 min-w-10 cursor-pointer place-items-center rounded-lg hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Đóng mục lục"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">{lessonList(true)}</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
