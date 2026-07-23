"use client";

import React, { useState, useEffect, useMemo, useEffectEvent } from "react";
import { Course } from "@/types/course";
import { PathApi } from "@/constants/PathApi";
import apiClient from "@/lib/apiClient";
import { useAuth } from "@/hooks/useAuth";
import { useAuthModal } from "@/hooks/useAuth";
import { useCart } from "@/components/providers/CartProvider";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  Globe,
  Calendar,
  Check,
  Play,
  PlayCircle,
  Monitor,
  FileText,
  Download,
  Smartphone,
  Trophy,
  Share,
  Gift,
  ChevronDown,
  ChevronUp,
  Tag,
  Star,
  Users
} from "lucide-react";
import Link from "next/link";
import { VideoPlayerModal } from "@/components/common/VideoPlayerModal";
import { resolveMediaUrl } from "@/lib/media/url";

function effectiveCoursePrice(price: number, salePrice?: number | null) {
  if (salePrice != null && salePrice > 0 && salePrice < price) return salePrice;
  return price;
}

export default function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const unwrappedParams = React.use(params);
  const { isAuthenticated } = useAuth();
  const { openAuthModal } = useAuthModal();
  const [courseData, setCourseData] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const { addToCart, clearCart } = useCart();
  const router = useRouter();

  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string>("");
  const [selectedVideoTitle, setSelectedVideoTitle] = useState<string>("");
  const [selectedLessonContent, setSelectedLessonContent] = useState<string | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedLinkedPost, setSelectedLinkedPost] = useState<{
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    thumbnail: string | null;
  } | null>(null);

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
      openAuthModal('login');
      return;
    }
    if (!courseData) return;
    setEnrolling(true);
    try {
      await apiClient.post(PathApi.enrollment.enroll(courseData.id));
      setIsEnrolled(true);
      toast.success('Đăng ký khóa học thành công!');
      void loadCourse(unwrappedParams.slug);
    } catch (err: any) {
      const msg = err?.message || 'Không thể đăng ký, vui lòng thử lại!';
      // Already enrolled is treated as success
      if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('enrolled')) {
        setIsEnrolled(true);
        toast.info('Bạn đã đăng ký khóa học này rồi.');
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
      Boolean(lesson.preview) ||
      isEnrolled ||
      lesson.locked === false;

    if (!canAccess) {
      toast.error("Bạn cần đăng ký khóa học để xem bài giảng này.");
      return;
    }

    const linkedPost = lesson.linkedPost ?? null;
    const lessonContent =
      typeof lesson.content === "string" && lesson.content.trim()
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

  const [openChapters, setOpenChapters] = useState<number[]>([0]);
  const [showAllLearning, setShowAllLearning] = useState(false);

  const toggleChapter = (index: number) => {
    setOpenChapters(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  // Map API payload only — no marketing mock fallbacks
  const course = useMemo(() => {
    if (!courseData) return null;

    const ratingCount = courseData.stats?.ratingCount ?? 0;
    const averageRating = courseData.stats?.averageRating ?? null;
    const enrollmentCount = courseData.stats?.enrollmentCount ?? 0;

    return {
      title: courseData.title,
      price: courseData.price,
      salePrice: courseData.salePrice,
      thumbnail: courseData.thumbnail,
      categoryName: courseData.category?.name || "Khóa học",
      description: courseData.description || "",
      tags: courseData.tags,
      author: courseData.author?.userName || "Giảng viên",
      rating: averageRating,
      ratingCount,
      reviews:
        ratingCount > 0 ? `${ratingCount} xếp hạng` : null,
      students:
        enrollmentCount > 0
          ? `${enrollmentCount.toLocaleString("vi-VN")} học viên`
          : null,
      updated: courseData.updatedAt
        ? new Date(courseData.updatedAt).toLocaleDateString("vi-VN", {
            month: "2-digit",
            year: "numeric",
          })
        : null,
      language: "Tiếng Việt",
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
            const lessonCount = sec.lessons?.length || 0;
            const totalSec =
              sec.lessons?.reduce(
                (acc: number, cur: any) => acc + (cur.duration || 0),
                0,
              ) || 0;
            const totalMin = Math.round(totalSec / 60);

            return {
              title: sec.title,
              lectures: lessonCount,
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
      const lesson = chapter.lessons?.find(
        (l: any) => l.preview && l.id,
      );
      if (lesson) return lesson;
    }
    return null;
  }, [course]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-foreground font-bold">
        Đang tải...
      </div>
    );
  }
  if (!courseData || !course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-foreground font-bold">
        Không tìm thấy khóa học
      </div>
    );
  }

  const displayPrice = effectiveCoursePrice(course.price, course.salePrice);
  const isFreeCourse = displayPrice === 0;


  return (
    <main className="min-h-screen bg-background relative flex flex-col justify-between">
      <Header />

      {/* Light hero aligned with the mobile design system. */}
      <div className="w-full border-b border-divider bg-card pb-12 pt-32 text-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full lg:flex lg:gap-12 relative">

          {/* Left Side (Banner Content) */}
          <div className="lg:w-2/3 lg:pr-8 space-y-5">
            {/* Breadcrumbs */}
            <div className="mb-4">
              <Breadcrumb>
                <BreadcrumbList className="text-muted-foreground">
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link href="/" className="transition-colors hover:text-brand-primary">
                        Trang chủ
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="text-muted-foreground [&>svg]:size-3" />
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link href="/courses" className="transition-colors hover:text-brand-primary">
                        Khóa học
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  {courseData?.category && courseData.category.slug !== "course" && courseData.category.name.toLowerCase() !== "khóa học" && (
                    <>
                      <BreadcrumbSeparator className="text-muted-foreground [&>svg]:size-3" />
                      <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                          <Link href={`/courses?category=${courseData.category.slug}`} className="transition-colors hover:text-brand-primary">
                            {courseData.category.name}
                          </Link>
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                    </>
                  )}
                  <BreadcrumbSeparator className="text-muted-foreground [&>svg]:size-3" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="max-w-[200px] truncate font-bold text-brand-primary sm:max-w-none">
                      {course.title}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            {/* Title & Subtitle */}
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-foreground md:text-4xl">
              {course.title}
            </h1>
            <p className="text-lg leading-8 text-muted-foreground">
              {course.description}
            </p>

            {/* Badges & Meta */}
            <div className="flex flex-wrap items-center gap-3">
              {course.tags && course.tags.length > 0 ? (
                course.tags.map((tag) => {
                  return (
                    <Badge key={tag.id} className="rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase text-brand-primary">
                      {tag.name}
                    </Badge>
                  );
                })
              ) : (
                <Badge className="rounded-full px-3 py-1 text-xs font-bold uppercase">
                  Khóa học
                </Badge>
              )}
            </div>

            {/* Ratings & Students */}
            {(course.rating != null && course.ratingCount > 0) || course.students ? (
              <div className="flex flex-wrap items-center gap-4 text-sm">
                {course.rating != null && course.ratingCount > 0 ? (
                  <div className="flex items-center gap-1.5 text-yellow-500 font-bold">
                    <span>{Number(course.rating).toFixed(1)}</span>
                    <div className="flex text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                    </div>
                    {course.reviews ? (
                      <span className="cursor-pointer font-normal text-brand-primary underline">
                        ({course.reviews})
                      </span>
                    ) : null}
                  </div>
                ) : null}
                {course.students ? <span>{course.students}</span> : null}
              </div>
            ) : null}

            <div className="text-sm">
              Được tạo bởi <span className="cursor-pointer font-bold text-brand-primary underline">{course.author}</span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm pt-2">
              {course.updated ? (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>Lần cập nhật gần đây nhất {course.updated}</span>
                </div>
              ) : null}
              <div className="flex items-center gap-1.5">
                <Globe className="w-4 h-4" />
                <span>{course.language}</span>
              </div>
            </div>

            {/* Mobile/Tablet Card Anchor (Appears only on smaller screens, hiding the sidebar logic) */}
            <div className="lg:hidden mt-8 block">
              {/* Mobile Sidebar rendering could go here, but omitted for brevity. We assume right sidebar drops down on mobile. */}
            </div>
          </div>

          {/* Right Side Empty Space for Desktop (The sidebar is absolute over this) */}
          <div className="hidden lg:block lg:w-1/3"></div>
        </div>
      </div>

      {/* BOTTOM WHITE SECTION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full flex-1 lg:flex lg:gap-12 relative pb-24 text-foreground">

        {/* Left Main Content */}
        <div className="lg:w-2/3 py-8 space-y-10">

          {/* What you'll learn Box */}
          {course.whatYouWillLearn.length > 0 ? (
            <div className="border border-border p-6 shadow-sm bg-card text-card-foreground rounded-2xl">
              <h2 className="text-2xl font-bold mb-6">Bạn sẽ học được gì</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                {(showAllLearning ? course.whatYouWillLearn : course.whatYouWillLearn.slice(0, 6)).map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm">
                    <Check className="w-4 h-4 mt-0.5 shrink-0" />
                    <span className="leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
              {course.whatYouWillLearn.length > 6 && (
                <button
                  onClick={() => setShowAllLearning(!showAllLearning)}
                  className="text-primary font-bold text-sm mt-4 flex items-center gap-1 hover:text-primary/80"
                >
                  {showAllLearning ? "Thu gọn" : "Hiển thị thêm"}
                  {showAllLearning ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              )}
            </div>
          ) : null}


          {/* Features */}
          {course.features.length > 0 ? (
            <div>
              <h2 className="text-xl font-bold mb-4">Khóa học này bao gồm:</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 text-sm">
                {course.features.map((feat, idx) => {
                  const Icon = feat.icon;
                  return (
                    <div key={idx} className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-foreground/70 shrink-0" />
                      <span>{feat.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* Curriculum Accordion */}
          <div>
            <h2 className="text-2xl font-bold mb-2">Nội dung khóa học</h2>
            <div className="flex justify-between items-center text-sm mb-4">
              <span className="text-muted-foreground">
                {course.curriculumStats || "Nội dung đang được cập nhật"}
              </span>
              {course.curriculum.length > 0 ? (
                <button onClick={() => setOpenChapters(course.curriculum.map((_, i) => i))} className="text-primary font-bold hover:text-primary/80">
                  Mở rộng tất cả các phần
                </button>
              ) : null}
            </div>

            {selectedLinkedPost ? (
              <div className="mb-4 rounded-2xl border border-border bg-card p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-2">
                  Bài viết liên quan
                </p>
                <div className="flex gap-4">
                  {selectedLinkedPost.thumbnail ? (
                    <img
                      src={resolveMediaUrl(selectedLinkedPost.thumbnail, "")}
                      alt=""
                      className="h-20 w-28 shrink-0 rounded-lg object-cover"
                    />
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-foreground line-clamp-2">
                      {selectedLinkedPost.title}
                    </h3>
                    {selectedLinkedPost.excerpt ? (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {selectedLinkedPost.excerpt}
                      </p>
                    ) : null}
                    <Link
                      href={`/posts/${selectedLinkedPost.slug}`}
                      className="mt-2 inline-flex text-sm font-semibold text-primary hover:underline"
                    >
                      Đọc bài viết →
                    </Link>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="border border-border bg-card rounded-2xl overflow-hidden">
              {course.curriculum.length === 0 ? (
                <p className="p-6 text-sm text-muted-foreground">
                  Giáo trình chưa được công bố. Vui lòng quay lại sau.
                </p>
              ) : (
                course.curriculum.map((chapter, idx) => (
                <div key={idx} className={`border-b border-border last:border-b-0`}>
                  <button
                    onClick={() => toggleChapter(idx)}
                    className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-4">
                      {openChapters.includes(idx) ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
                      <span className="font-bold">{chapter.title}</span>
                    </div>
                    <span className="text-sm text-muted-foreground whitespace-nowrap hidden sm:block">
                      {chapter.lectures} bài giảng • {chapter.duration}
                    </span>
                  </button>

                  <AnimatePresence>
                    {openChapters.includes(idx) && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 space-y-4">
                          {chapter.lessons.map((lesson: any, lIdx: number) => (
                            <div key={lIdx} onClick={() => handlePlayLesson(lesson)} className="flex items-start justify-between text-sm group cursor-pointer hover:bg-muted/50 p-2 -mx-2 rounded-lg transition-colors">
                              <div className="flex items-start gap-4">
                                <PlayCircle className="w-4 h-4 mt-0.5 text-foreground/50 group-hover:text-primary shrink-0 transition-colors" />
                                <span className={`${lesson.preview ? 'text-primary underline' : 'text-foreground'}`}>
                                  {lesson.title}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-muted-foreground whitespace-nowrap">
                                {lesson.preview && (
                                  <span className="text-primary underline hidden sm:block text-xs">Xem trước</span>
                                )}
                                <span>{lesson.duration}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR (Floating) */}
        <div className="lg:w-1/3 relative z-30">
          <div className="lg:absolute lg:top-[-300px] lg:right-0 lg:w-full bg-card text-card-foreground shadow-2xl border border-border/40 shadow-black/20 flex flex-col rounded-2xl overflow-hidden">

            {/* Video Thumbnail area */}
            <div
              role={firstPreviewLesson ? "button" : undefined}
              tabIndex={firstPreviewLesson ? 0 : undefined}
              onClick={() => {
                if (firstPreviewLesson) {
                  void handlePlayLesson(firstPreviewLesson);
                } else {
                  toast.info("Khóa học chưa có bài xem trước.");
                }
              }}
              onKeyDown={(e) => {
                if (!firstPreviewLesson) return;
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  void handlePlayLesson(firstPreviewLesson);
                }
              }}
              className="relative aspect-video w-full border-b border-border bg-black overflow-hidden flex items-center justify-center cursor-pointer group"
            >
              <img src={course.thumbnail || "/auth-bg.jpg"} alt={`Ảnh bìa khóa học ${course.title}`} className="absolute inset-0 h-full w-full object-contain opacity-70 transition-opacity group-hover:opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="relative z-10 w-14 h-14 bg-white/90 text-black rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:bg-white transition-all duration-300">
                <Play className="w-5 h-5 fill-current translate-x-[2px]" />
              </div>
              <span className="absolute bottom-4 left-0 right-0 text-center text-white font-bold tracking-wide text-sm">
                Xem trước khóa học này
              </span>
            </div>

            {/* Sidebar Body */}
            <div className="p-6 space-y-6">
              {/* Price & Checkout */}
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Học phí khóa học</span>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-black text-foreground">
                      {displayPrice.toLocaleString('vi-VN')} đ
                    </span>
                    {course.salePrice != null && course.price > course.salePrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        {course.price.toLocaleString('vi-VN')} đ
                      </span>
                    )}
                  </div>
                </div>

                {isFreeCourse ? (
                  isEnrolled ? (
                    <button
                      type="button"
                      onClick={() => router.push(`/learn/${unwrappedParams.slug}`)}
                      className="w-full font-bold py-3.5 px-4 rounded-2xl transition-all shadow-lg bg-emerald-500 hover:bg-emerald-500/90 text-white shadow-emerald-500/25 cursor-pointer text-center text-base"
                    >
                      Vào học ngay
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleEnroll}
                      disabled={enrolling}
                      className="w-full font-bold py-3.5 px-4 rounded-2xl transition-all shadow-lg cursor-pointer text-center text-base disabled:opacity-70 disabled:cursor-not-allowed bg-primary hover:bg-primary/90 text-white shadow-primary/25"
                    >
                      {enrolling ? 'Đang xử lý...' : 'Đăng ký miễn phí'}
                    </button>
                  )
                ) : isEnrolled ? (
                  <button
                    type="button"
                    onClick={() => router.push(`/learn/${unwrappedParams.slug}`)}
                    className="w-full font-bold py-3.5 px-4 rounded-2xl transition-all shadow-lg bg-emerald-500 hover:bg-emerald-500/90 text-white shadow-emerald-500/25 cursor-pointer text-center text-base"
                  >
                    Vào học ngay
                  </button>
                ) : (
                  <div className="relative z-10 flex flex-col gap-3 isolate">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await addToCart(courseData?.id || "");
                          toast.success("Đã thêm vào giỏ hàng");
                        } catch (err: any) {
                          toast.error(err?.message || "Không thêm được vào giỏ");
                        }
                      }}
                      className="w-full font-bold py-3.5 px-4 rounded-2xl transition-all border-2 border-primary text-primary bg-card hover:bg-primary/5 cursor-pointer text-center text-base"
                    >
                      Thêm vào giỏ hàng
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!isAuthenticated) {
                          openAuthModal('login');
                          return;
                        }
                        try {
                          // Buy now = chỉ khóa này, tránh cộng dồn giỏ cũ
                          await clearCart();
                          await addToCart(courseData?.id || "");
                          router.push("/checkout");
                        } catch (err: any) {
                          if (err?.message?.includes("already enrolled") || err?.message?.includes("already in cart")) {
                             router.push("/checkout");
                          } else {
                            toast.error(err?.message || "Không thể mua ngay");
                          }
                        }
                      }}
                      className="w-full font-bold py-3.5 px-4 rounded-2xl transition-all shadow-lg bg-primary hover:bg-primary/90 text-white shadow-primary/25 cursor-pointer text-center text-base"
                    >
                      Mua ngay
                    </button>
                  </div>
                )}

                <div className="text-center text-xs text-muted-foreground space-y-2 pt-4 border-t border-border/40">
                  <p className="flex items-center justify-center gap-1.5 text-muted-foreground">
                    <span className="text-emerald-500 font-bold">✓</span> Quyền truy cập đầy đủ trọn đời
                  </p>
                  <p className="flex items-center justify-center gap-1.5 text-muted-foreground">
                    <span className="text-emerald-500 font-bold">✓</span> Học trực tuyến trên mọi thiết bị di động & máy tính
                  </p>
                  <p className="flex items-center justify-center gap-1.5 text-muted-foreground">
                    <span className="text-emerald-500 font-bold">✓</span> Cam kết chất lượng đào tạo từ GATS Academy
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
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
