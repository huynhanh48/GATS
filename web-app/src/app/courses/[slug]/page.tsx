"use client";

import React, { useState, useEffect, useMemo, useEffectEvent } from "react";
import { Course } from "@/types/course";
import { PathApi } from "@/constants/PathApi";
import apiClient from "@/lib/apiClient";
import { useAuth, useAuthModal } from "@/hooks/useAuth";
import { useCart } from "@/components/providers/CartProvider";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/layout/Container";
import { theme as designTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Play,
  Monitor,
  FileText,
  Download,
  Smartphone,
  Trophy,
  ChevronDown,
  ChevronUp,
  Clock,
  Users,
  BarChart3,
  BookOpen,
  Star,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { VideoPlayerModal } from "@/components/common/VideoPlayerModal";
import { resolveMediaUrl } from "@/lib/media/url";

type TabId = "overview" | "curriculum" | "instructor" | "faqs" | "reviews";

const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Tổng quan" },
  { id: "curriculum", label: "Giáo trình" },
  { id: "instructor", label: "Giảng viên" },
  { id: "faqs", label: "FAQs" },
  { id: "reviews", label: "Đánh giá" },
];

const LEVEL_LABELS: Record<Course["level"], string> = {
  beginner: "Cơ bản",
  intermediate: "Trung cấp",
  advanced: "Nâng cao",
};

function effectiveCoursePrice(price: number, salePrice?: number | null) {
  if (salePrice != null && salePrice > 0 && salePrice < price) return salePrice;
  return price;
}

function formatDuration(totalSeconds: number) {
  if (!totalSeconds || totalSeconds <= 0) return null;
  if (totalSeconds >= 604800) {
    const weeks = Math.max(1, Math.round(totalSeconds / 604800));
    return `${weeks} tuần`;
  }
  if (totalSeconds >= 3600) {
    const hours = Math.round(totalSeconds / 3600);
    return `${hours} giờ`;
  }
  const minutes = Math.max(1, Math.round(totalSeconds / 60));
  return `${minutes} phút`;
}

function formatPrice(value: number) {
  return `${value.toLocaleString("vi-VN")}đ`;
}

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const unwrappedParams = React.use(params);
  const { isAuthenticated } = useAuth();
  const { openAuthModal } = useAuthModal();
  const [courseData, setCourseData] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const { addToCart, clearCart } = useCart();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabId>("curriculum");
  const [selectedVideoUrl, setSelectedVideoUrl] = useState("");
  const [selectedVideoTitle, setSelectedVideoTitle] = useState("");
  const [selectedLessonContent, setSelectedLessonContent] = useState<
    string | null
  >(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedLinkedPost, setSelectedLinkedPost] = useState<{
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    thumbnail: string | null;
  } | null>(null);

  const [openChapters, setOpenChapters] = useState<number[]>([0]);
  const [showAllLearning, setShowAllLearning] = useState(false);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [commentName, setCommentName] = useState("");
  const [commentEmail, setCommentEmail] = useState("");
  const [commentBody, setCommentBody] = useState("");
  const [saveCommentInfo, setSaveCommentInfo] = useState(false);

  const loadCourse = useEffectEvent(async (slug: string) => {
    setIsLoading(true);
    try {
      const res: any = await apiClient.get(PathApi.courses.detailBySlug(slug));
      if (res.course) setCourseData(res.course);
    } catch (err) {
      console.error(err);
      setCourseData(null);
    } finally {
      setIsLoading(false);
    }
  });

  const syncEnrollment = useEffectEvent(async (courseId: string) => {
    try {
      const enrollRes: any = await apiClient.get(PathApi.enrollment.listMine);
      const rows: any[] = enrollRes?.data ?? [];
      const enrolled = rows.some(
        (row) =>
          (row.courseId === courseId || row.course?.id === courseId) &&
          (row.status === "active" || !row.status),
      );
      setIsEnrolled(enrolled);
    } catch {
      setIsEnrolled(false);
    }
  });

  useEffect(() => {
    void loadCourse(unwrappedParams.slug);
  }, [unwrappedParams.slug, isAuthenticated]);

  useEffect(() => {
    if (!courseData?.id) return;
    if (!isAuthenticated) {
      setIsEnrolled(false);
      return;
    }
    void syncEnrollment(courseData.id);
  }, [isAuthenticated, courseData?.id]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }
    if (!courseData) return;
    setEnrolling(true);
    try {
      await apiClient.post(PathApi.enrollment.enroll(courseData.id));
      setIsEnrolled(true);
      toast.success("Đăng ký khóa học thành công!");
      void loadCourse(unwrappedParams.slug);
    } catch (err: any) {
      const msg = err?.message || "Không thể đăng ký, vui lòng thử lại!";
      if (
        msg.toLowerCase().includes("already") ||
        msg.toLowerCase().includes("enrolled")
      ) {
        setIsEnrolled(true);
        toast.info("Bạn đã đăng ký khóa học này rồi.");
        void loadCourse(unwrappedParams.slug);
      } else {
        toast.error(msg);
      }
    } finally {
      setEnrolling(false);
    }
  };

  const handlePlayLesson = async (lesson: any) => {
    if (!lesson.id) {
      toast.info("Bài giảng này chưa sẵn sàng.");
      return;
    }

    const canAccess =
      Boolean(lesson.preview) || isEnrolled || lesson.locked === false;

    if (!canAccess) {
      toast.error("Bạn cần đăng ký khóa học để xem bài giảng này.");
      return;
    }

    // Preview = video only (no lesson article / linked post), regardless of auth.
    const isPreviewPlay = Boolean(lesson.preview);
    const linkedPost = isPreviewPlay ? null : (lesson.linkedPost ?? null);
    const lessonContent = isPreviewPlay
      ? null
      : typeof lesson.content === "string" && lesson.content.trim()
        ? lesson.content
        : null;

    setSelectedLinkedPost(linkedPost);
    setSelectedLessonContent(lessonContent);
    setSelectedVideoTitle(lesson.title);
    setSelectedVideoUrl("");

    if (!courseData?.id) return;

    const openModal = (videoUrl = "") => {
      setSelectedVideoUrl(videoUrl);
      setIsVideoModalOpen(true);
    };

    try {
      const res: any = await apiClient.get(
        PathApi.video.lessonVideo(courseData.id, lesson.id),
      );
      if (!res?.data?.videoId) {
        if (lessonContent || linkedPost) {
          openModal("");
          return;
        }
        toast.info("Video chưa khả dụng hoặc chưa được tải lên.");
        return;
      }

      const playbackRes: any = await apiClient.get(
        PathApi.video.playback(courseData.id, res.data.videoId),
      );
      if (playbackRes?.data?.playbackUrl) {
        openModal(playbackRes.data.playbackUrl);
      } else if (lessonContent || linkedPost) {
        openModal("");
      } else {
        toast.info("Video chưa sẵn sàng để phát.");
      }
    } catch (err: any) {
      if (lessonContent || linkedPost) {
        openModal("");
      } else {
        toast.error(err?.message || "Không thể tải video bài giảng.");
      }
    }
  };

  const toggleChapter = (index: number) => {
    setOpenChapters((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const course = useMemo(() => {
    if (!courseData) return null;

    const ratingCount = courseData.stats?.ratingCount ?? 0;
    const averageRating = courseData.stats?.averageRating ?? null;
    const enrollmentCount = courseData.stats?.enrollmentCount ?? 0;
    const lessonCount = courseData.stats?.lessonCount ?? 0;
    const totalDurationSeconds = courseData.stats?.totalDurationSeconds ?? 0;

    return {
      title: courseData.title,
      price: courseData.price,
      salePrice: courseData.salePrice,
      thumbnail: courseData.thumbnail,
      level: courseData.level,
      levelLabel: LEVEL_LABELS[courseData.level] ?? "Tất cả cấp độ",
      categoryName: courseData.category?.name || "Khóa học",
      description: courseData.description || "",
      tags: courseData.tags,
      author: courseData.author?.userName || "Giảng viên GATS",
      rating: averageRating,
      ratingCount,
      students: enrollmentCount,
      studentsLabel:
        enrollmentCount > 0
          ? `${enrollmentCount.toLocaleString("vi-VN")} học viên`
          : "0 học viên",
      lessonCount,
      lessonsLabel: `${lessonCount} bài học`,
      durationLabel: formatDuration(totalDurationSeconds) || "Linh hoạt",
      whatYouWillLearn: courseData.learningOutcomes?.length
        ? courseData.learningOutcomes.map((item: any) =>
            typeof item === "string" ? item : item.content,
          )
        : [],
      features: courseData.includes?.length
        ? courseData.includes.map((item: any) => {
            let text = item.label;
            if (item.value) {
              const unit = item.unit ? ` ${item.unit}` : "";
              text = `${item.value}${unit} ${item.label.toLowerCase()}`;
            }

            const lucideIconMap: Record<string, any> = {
              Monitor,
              FileText,
              Download,
              Smartphone,
              Trophy,
              Check,
            };
            const Icon = lucideIconMap[item.key] || Check;

            return { icon: Icon, text };
          })
        : [],
      curriculumStats: courseData.stats
        ? `${courseData.stats.sectionCount} phần • ${courseData.stats.lessonCount} bài giảng • ${
            courseData.stats.totalDurationSeconds > 3600
              ? `${Math.round(courseData.stats.totalDurationSeconds / 3600)} giờ`
              : `${Math.round(courseData.stats.totalDurationSeconds / 60)} phút`
          } tổng thời lượng`
        : null,
      curriculum: courseData.sections?.length
        ? courseData.sections.map((sec: any) => {
            const lessonCountSec = sec.lessons?.length || 0;
            const totalSec =
              sec.lessons?.reduce(
                (acc: number, cur: any) => acc + (cur.duration || 0),
                0,
              ) || 0;
            const totalMin = Math.round(totalSec / 60);

            return {
              title: sec.title,
              lectures: lessonCountSec,
              duration: `${totalMin} phút`,
              lessons:
                sec.lessons?.map((les: any) => ({
                  id: les.id,
                  title: les.title,
                  preview: les.isPreview || les.is_preview || les.preview,
                  locked: les.locked === true,
                  duration:
                    typeof les.duration === "number"
                      ? `${Math.floor(les.duration / 60)}:${String(les.duration % 60).padStart(2, "0")}`
                      : les.duration || "0:00",
                  content: les.content ?? null,
                  linkedPost: les.linkedPost ?? null,
                })) || [],
            };
          })
        : [],
    };
  }, [courseData]);

  const firstPreviewLesson = useMemo(() => {
    if (!course) return null;
    for (const chapter of course.curriculum) {
      const lesson = chapter.lessons?.find((l: any) => l.preview && l.id);
      if (lesson) return lesson;
    }
    return null;
  }, [course]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-[#111827] font-bold text-[1.6rem]">
        Đang tải...
      </div>
    );
  }

  if (!courseData || !course) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center text-[#111827] font-bold text-[1.6rem]">
          Không tìm thấy khóa học
        </div>
        <Footer />
      </div>
    );
  }

  const displayPrice = effectiveCoursePrice(course.price, course.salePrice);
  const isFreeCourse = displayPrice === 0;
  const hasSale =
    course.salePrice != null &&
    course.salePrice > 0 &&
    course.price > course.salePrice;

  const handlePrimaryCta = async () => {
    if (isFreeCourse) {
      if (isEnrolled) {
        router.push(`/learn/${unwrappedParams.slug}`);
        return;
      }
      await handleEnroll();
      return;
    }

    if (isEnrolled) {
      router.push(`/learn/${unwrappedParams.slug}`);
      return;
    }

    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }

    try {
      await clearCart();
      await addToCart(courseData.id);
      router.push("/checkout");
    } catch (err: any) {
      if (
        err?.message?.includes("already enrolled") ||
        err?.message?.includes("already in cart")
      ) {
        router.push("/checkout");
      } else {
        toast.error(err?.message || "Không thể mua ngay");
      }
    }
  };

  const primaryCtaLabel = isFreeCourse
    ? isEnrolled
      ? "Vào học ngay"
      : enrolling
        ? "Đang xử lý..."
        : "Bắt đầu ngay"
    : isEnrolled
      ? "Vào học ngay"
      : "Bắt đầu ngay";

  const metaItems = [
    { icon: Clock, label: course.durationLabel },
    { icon: Users, label: course.studentsLabel },
    { icon: BarChart3, label: course.levelLabel },
    { icon: BookOpen, label: course.lessonsLabel },
  ];

  return (
    <main className="relative flex min-h-screen flex-col justify-between bg-white overflow-hidden">
      <Header />

      {/* Breadcrumb — flush under fixed header */}
      <div
        className="w-full bg-[#f8f9fa] py-4 border-b border-border/10"
        style={{
          marginTop: `calc(${designTheme.layout.headerHeight} + 1px)`,
        }}
      >
        <Container size="xl">
          <div className="text-[1.3rem] font-medium text-slate-500 flex items-center gap-2 flex-wrap">
            <Link href="/" className="hover:text-[#ff782d] transition-colors">
              Trang chủ
            </Link>
            <span>›</span>
            <Link
              href="/courses"
              className="hover:text-[#ff782d] transition-colors"
            >
              Khóa học
            </Link>
            <span>›</span>
            <span className="text-slate-800 truncate max-w-[40rem]">
              {course.title}
            </span>
          </div>
        </Container>
      </div>

      {/* Dark hero */}
      <section className="w-full bg-[#111827] text-white pt-12 pb-28 md:pb-32">
        <Container size="xl">
          <div className="lg:w-[62%] flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-3 text-[1.3rem]">
              <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-slate-200 font-medium">
                {course.categoryName}
              </span>
              <span className="text-slate-400">
                bởi{" "}
                <span className="text-white font-semibold">{course.author}</span>
              </span>
            </div>

            <h1 className="text-[2.8rem] md:text-[3.6rem] lg:text-[4rem] font-bold leading-[1.35] font-heading tracking-tight">
              {course.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[1.35rem] text-slate-200">
              {metaItems.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon className="size-4 text-[#ff782d] shrink-0" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Main content + overlapping sidebar */}
      <Container size="xl" className="relative flex-1 pb-24 -mt-[5.4rem]">
        <div className="lg:flex lg:gap-10 lg:items-start">
          {/* Left column */}
          <div className="lg:w-[62%] min-w-0">
            {/* Tabs */}
            <div className="overflow-hidden rounded-t-xl border border-slate-200 bg-white">
              <div className="grid grid-cols-3 sm:grid-cols-5" role="tablist">
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "relative min-h-11 min-w-0 px-2 py-3 text-[1.35rem] font-semibold whitespace-nowrap transition-colors focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#ff782d] sm:px-3 sm:py-4 sm:text-[1.45rem]",
                        isActive
                          ? "text-[#ff782d]"
                          : "text-slate-600 hover:text-[#111827]",
                      )}
                    >
                      {tab.label}
                      {isActive ? (
                        <span className="absolute left-0 right-0 bottom-0 h-[3px] bg-[#ff782d]" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab panels */}
            <div className="border border-t-0 border-slate-200 bg-[#f8f9fa] rounded-b-xl p-6 md:p-8 mb-12">
              {activeTab === "overview" ? (
                <div className="flex flex-col gap-8">
                  <div>
                    <h2 className="text-[2rem] font-bold text-[#111827] mb-4 font-heading">
                      Giới thiệu khóa học
                    </h2>
                    <p className="text-[1.5rem] leading-relaxed text-slate-600 whitespace-pre-wrap">
                      {course.description ||
                        "Nội dung giới thiệu đang được cập nhật."}
                    </p>
                  </div>

                  {course.whatYouWillLearn.length > 0 ? (
                    <div>
                      <h3 className="text-[1.8rem] font-bold text-[#111827] mb-4">
                        Bạn sẽ học được gì
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(showAllLearning
                          ? course.whatYouWillLearn
                          : course.whatYouWillLearn.slice(0, 6)
                        ).map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-3 text-[1.4rem] text-slate-700"
                          >
                            <Check className="size-4 mt-1 text-[#ff782d] shrink-0" />
                            <span className="leading-relaxed">{item}</span>
                          </div>
                        ))}
                      </div>
                      {course.whatYouWillLearn.length > 6 ? (
                        <button
                          type="button"
                          onClick={() => setShowAllLearning((v) => !v)}
                          className="mt-4 flex items-center gap-1 text-[1.4rem] font-bold text-[#ff782d] hover:opacity-80"
                        >
                          {showAllLearning ? "Thu gọn" : "Hiển thị thêm"}
                          {showAllLearning ? (
                            <ChevronUp className="size-4" />
                          ) : (
                            <ChevronDown className="size-4" />
                          )}
                        </button>
                      ) : null}
                    </div>
                  ) : null}

                  {course.features.length > 0 ? (
                    <div>
                      <h3 className="text-[1.8rem] font-bold text-[#111827] mb-4">
                        Khóa học bao gồm
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {course.features.map((feat, idx) => {
                          const Icon = feat.icon;
                          return (
                            <div
                              key={idx}
                              className="flex items-center gap-3 text-[1.4rem] text-slate-700"
                            >
                              <Icon className="size-4 text-slate-500 shrink-0" />
                              <span>{feat.text}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {activeTab === "curriculum" ? (
                <div className="flex flex-col gap-5">
                  {(course.description || course.curriculumStats) ? (
                    <p className="text-[1.5rem] leading-relaxed text-slate-600">
                      {course.description ||
                        course.curriculumStats ||
                        "Nội dung khóa học được tổ chức theo từng phần bài giảng."}
                    </p>
                  ) : null}

                  {selectedLinkedPost ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-[1.1rem] font-semibold uppercase tracking-wide text-[#ff782d] mb-2">
                        Bài viết liên quan
                      </p>
                      <div className="flex gap-4">
                        {selectedLinkedPost.thumbnail ? (
                          <img
                            src={resolveMediaUrl(
                              selectedLinkedPost.thumbnail,
                              "",
                            )}
                            alt=""
                            className="h-20 w-28 shrink-0 rounded-lg object-cover"
                          />
                        ) : null}
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-[#111827] text-[1.5rem] line-clamp-2">
                            {selectedLinkedPost.title}
                          </h3>
                          {selectedLinkedPost.excerpt ? (
                            <p className="mt-1 text-[1.3rem] text-slate-500 line-clamp-2">
                              {selectedLinkedPost.excerpt}
                            </p>
                          ) : null}
                          <Link
                            href={`/posts/${selectedLinkedPost.slug}`}
                            className="mt-2 inline-flex text-[1.3rem] font-semibold text-[#ff782d] hover:underline"
                          >
                            Đọc bài viết →
                          </Link>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {course.curriculum.length === 0 ? (
                    <p className="rounded-2xl bg-white px-6 py-8 text-[1.4rem] text-slate-500">
                      Giáo trình chưa được công bố. Vui lòng quay lại sau.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {course.curriculum.map((chapter, idx) => {
                        const isOpen = openChapters.includes(idx);
                        return (
                          <div
                            key={idx}
                            className="rounded-2xl overflow-hidden bg-white shadow-sm"
                          >
                            <button
                              type="button"
                              onClick={() => toggleChapter(idx)}
                              className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left bg-white hover:bg-slate-50/80 transition-colors"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                {isOpen ? (
                                  <ChevronUp className="size-4 shrink-0 text-[#ff782d]" />
                                ) : (
                                  <ChevronDown className="size-4 shrink-0 text-slate-400" />
                                )}
                                <span
                                  className={cn(
                                    "font-bold text-[1.5rem] truncate",
                                    isOpen ? "text-[#ff782d]" : "text-[#111827]",
                                  )}
                                >
                                  {chapter.title}
                                </span>
                              </div>
                              <span className="text-[1.3rem] text-slate-500 whitespace-nowrap shrink-0">
                                {chapter.lectures} bài học
                                <span className="mx-1.5 text-slate-300">·</span>
                                {chapter.duration}
                              </span>
                            </button>

                            <AnimatePresence initial={false}>
                              {isOpen ? (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="bg-[#eef0f2] px-3 py-2 flex flex-col gap-1">
                                    {chapter.lessons.map(
                                      (lesson: any, lIdx: number) => {
                                        const canAccess =
                                          Boolean(lesson.preview) ||
                                          isEnrolled ||
                                          lesson.locked === false;
                                        const isActive =
                                          activeLessonId === lesson.id;
                                        return (
                                          <div
                                            key={lesson.id ?? lIdx}
                                            className="flex items-center gap-3 rounded-xl px-3 py-3 text-[1.4rem] hover:bg-white/60 transition-colors"
                                          >
                                            <FileText
                                              className={cn(
                                                "size-4 shrink-0",
                                                isActive
                                                  ? "text-[#ff782d]"
                                                  : "text-slate-400",
                                              )}
                                            />
                                            <button
                                              type="button"
                                              onClick={() => {
                                                if (lesson.id) {
                                                  setActiveLessonId(lesson.id);
                                                }
                                                void handlePlayLesson(lesson);
                                              }}
                                              className={cn(
                                                "min-w-0 flex-1 text-left font-medium truncate transition-colors",
                                                isActive || lesson.preview
                                                  ? "text-[#ff782d]"
                                                  : "text-[#111827] hover:text-[#ff782d]",
                                              )}
                                            >
                                              {lesson.title}
                                            </button>

                                            <div className="flex items-center gap-3 shrink-0">
                                              {lesson.preview ? (
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    if (lesson.id) {
                                                      setActiveLessonId(lesson.id);
                                                    }
                                                    void handlePlayLesson(lesson);
                                                  }}
                                                  className="hidden sm:inline-flex h-8 items-center rounded-full bg-[#0070EB] px-4 text-[1.2rem] font-semibold text-white hover:bg-[#005BC4] transition-colors"
                                                >
                                                  Xem trước
                                                </button>
                                              ) : null}
                                              <span className="text-slate-500 tabular-nums min-w-[4.5rem] text-right">
                                                {lesson.duration}
                                              </span>
                                              {canAccess ? (
                                                <Check className="size-4 text-emerald-500 shrink-0" />
                                              ) : (
                                                <Lock className="size-4 text-slate-400 shrink-0" />
                                              )}
                                            </div>
                                          </div>
                                        );
                                      },
                                    )}
                                  </div>
                                </motion.div>
                              ) : null}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : null}

              {activeTab === "instructor" ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="size-16 rounded-full bg-[#ff782d]/10 border border-[#ff782d]/20 flex items-center justify-center font-bold text-[2rem] text-[#ff782d] uppercase">
                      {course.author.slice(0, 2)}
                    </div>
                    <div>
                      <h2 className="text-[2rem] font-bold text-[#111827] font-heading">
                        {course.author}
                      </h2>
                      <p className="text-[1.4rem] text-slate-500">
                        Giảng viên tại GATS Academy
                      </p>
                    </div>
                  </div>
                  <p className="text-[1.5rem] leading-relaxed text-slate-600">
                    Thông tin chi tiết về giảng viên sẽ được cập nhật sớm.
                  </p>
                </div>
              ) : null}

              {activeTab === "faqs" ? (
                <div className="flex flex-col gap-3 text-[1.5rem] text-slate-600">
                  <p>
                    Các câu hỏi thường gặp về khóa học sẽ được bổ sung tại đây.
                  </p>
                  <p className="text-slate-500 text-[1.35rem]">
                    Nếu bạn cần hỗ trợ, vui lòng liên hệ đội ngũ GATS Academy.
                  </p>
                </div>
              ) : null}

              {activeTab === "reviews" ? (
                <div className="flex flex-col gap-4">
                  {course.rating != null && course.ratingCount > 0 ? (
                    <div className="flex items-center gap-3 text-[1.6rem]">
                      <span className="font-bold text-[#111827]">
                        {Number(course.rating).toFixed(1)}
                      </span>
                      <Star className="size-5 fill-amber-400 text-amber-400" />
                      <span className="text-slate-500">
                        ({course.ratingCount} đánh giá)
                      </span>
                    </div>
                  ) : (
                    <p className="text-[1.5rem] text-slate-500">
                      Chưa có đánh giá cho khóa học này.
                    </p>
                  )}
                </div>
              ) : null}
            </div>

            {/* Leave a comment — template block */}
            <div className="mb-8">
              <h2 className="text-[2.2rem] font-bold text-[#111827] mb-2 font-heading">
                Để lại bình luận
              </h2>
              <p className="text-[1.3rem] text-slate-500 mb-6">
                Địa chỉ email của bạn sẽ không được công khai. Các trường bắt
                buộc được đánh dấu *
              </p>

              <form
                className="flex flex-col gap-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  toast.info("Tính năng bình luận đang được phát triển.");
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <input
                    type="text"
                    required
                    placeholder="Họ tên *"
                    value={commentName}
                    onChange={(e) => setCommentName(e.target.value)}
                    className="h-[4.8rem] rounded-xl border border-slate-200 bg-white px-5 text-[1.4rem] text-slate-700 outline-none focus:border-[#ff782d]/50 transition-colors"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Email *"
                    value={commentEmail}
                    onChange={(e) => setCommentEmail(e.target.value)}
                    className="h-[4.8rem] rounded-xl border border-slate-200 bg-white px-5 text-[1.4rem] text-slate-700 outline-none focus:border-[#ff782d]/50 transition-colors"
                  />
                </div>
                <textarea
                  required
                  placeholder="Nội dung bình luận *"
                  rows={5}
                  value={commentBody}
                  onChange={(e) => setCommentBody(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-4 text-[1.4rem] text-slate-700 outline-none focus:border-[#ff782d]/50 transition-colors resize-y min-h-[12rem]"
                />
                <label className="flex items-center gap-3 text-[1.35rem] text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={saveCommentInfo}
                    onChange={(e) => setSaveCommentInfo(e.target.checked)}
                    className="size-4 accent-[#ff782d]"
                  />
                  Lưu tên và email của tôi trên trình duyệt này cho lần bình
                  luận sau
                </label>
                <button
                  type="submit"
                  className="self-start h-[4.8rem] px-8 rounded-full bg-[#ff782d] hover:bg-[#e0661a] text-white text-[1.5rem] font-bold transition-colors"
                >
                  Gửi bình luận
                </button>
              </form>
            </div>
          </div>

          {/* Right sidebar — overlaps dark hero */}
          <div className="lg:w-[38%] relative z-20 mt-8 lg:mt-0">
            <div className="lg:absolute lg:top-[-14rem] lg:right-0 lg:w-full bg-white shadow-xl border border-slate-100 rounded-2xl overflow-hidden flex flex-col">
              <button
                type="button"
                onClick={() => {
                  if (firstPreviewLesson) {
                    void handlePlayLesson(firstPreviewLesson);
                  } else {
                    toast.info("Khóa học chưa có bài xem trước.");
                  }
                }}
                className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden group cursor-pointer"
              >
                <img
                  src={
                    resolveMediaUrl(course.thumbnail, "") ||
                    "https://placehold.co/640x480"
                  }
                  alt={`Ảnh bìa khóa học ${course.title}`}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="size-14 bg-white/95 text-[#111827] rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="size-5 fill-current translate-x-[1px]" />
                  </div>
                </div>
              </button>

              <div className="p-6 flex flex-col gap-5">
                <div className="flex items-baseline gap-3 flex-wrap">
                  {hasSale ? (
                    <span className="text-[1.6rem] text-slate-400 line-through">
                      {formatPrice(course.price)}
                    </span>
                  ) : null}
                  <span className="text-[2.8rem] font-extrabold text-[#ff782d] font-heading">
                    {isFreeCourse ? "Miễn phí" : formatPrice(displayPrice)}
                  </span>
                </div>

                <button
                  type="button"
                  disabled={enrolling && isFreeCourse && !isEnrolled}
                  onClick={() => void handlePrimaryCta()}
                  className="w-full h-[5.2rem] rounded-full bg-[#ff782d] hover:bg-[#e0661a] text-white text-[1.6rem] font-bold transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {primaryCtaLabel}
                </button>

                {!isFreeCourse && !isEnrolled ? (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await addToCart(courseData.id);
                      } catch {
                        // CartProvider already toasts
                      }
                    }}
                    className="w-full h-[4.8rem] rounded-full border-2 border-[#ff782d] text-[#ff782d] text-[1.5rem] font-bold hover:bg-[#ff782d]/5 transition-colors"
                  >
                    Thêm vào giỏ hàng
                  </button>
                ) : null}

                <div className="pt-2 border-t border-slate-100 flex flex-col gap-2 text-[1.3rem] text-slate-500">
                  <p className="flex items-center gap-2">
                    <Check className="size-4 text-emerald-500 shrink-0" />
                    Truy cập trọn đời
                  </p>
                  <p className="flex items-center gap-2">
                    <Check className="size-4 text-emerald-500 shrink-0" />
                    Học trên mọi thiết bị
                  </p>
                  <p className="flex items-center gap-2">
                    <Check className="size-4 text-emerald-500 shrink-0" />
                    Cam kết chất lượng từ GATS Academy
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>

      <Footer />

      <VideoPlayerModal
        isOpen={isVideoModalOpen}
        onClose={() => {
          setIsVideoModalOpen(false);
          setSelectedVideoUrl("");
          setSelectedLessonContent(null);
        }}
        url={selectedVideoUrl}
        title={selectedVideoTitle}
        content={selectedLessonContent}
        linkedPost={selectedLinkedPost}
      />
    </main>
  );
}
