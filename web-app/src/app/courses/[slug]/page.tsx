"use client";

import React, { useState } from "react";
import { useEffect } from "react";
import { Course } from "@/types/course";
import { PathApi } from "@/constants/PathApi";
import apiClient from "@/lib/apiClient";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ParticlesBackground } from "@/components/common/ParticlesBackground";
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


export default function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const unwrappedParams = React.use(params);
  const [courseData, setCourseData] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiClient.get(PathApi.courses.detailBySlug(unwrappedParams.slug))
      .then((res: any) => {
        if (res.course) setCourseData(res.course);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [unwrappedParams.slug]);

  // Fallback mock data matching the new template for fields not yet in API
  const mockCourse = {
    subtitle: "Chinh Phục Python Trong 30 Ngày: Từ Cơ Bản Đến Nâng Cao (Tiếng Việt) - Lập trình Python",
    rating: 4.6,
    reviews: "1.102 xếp hạng",
    students: "10.391 học viên",
    author: "AI Coding",
    updated: "6/2026",
    language: "Tiếng Việt",
    breadcrumbs: ["CNTT & Phần mềm", "CNTT & Phần mềm khác", "Python"],
    badges: ["Bán chạy nhất", "Nhập vai"],
    whatYouWillLearn: [
      "Nền tảng Python vững chắc để học tiếp AI, Data Science hay lập trình Web",
      "Kiến thức toàn diện về Python, bắt đầu với biến, kiểu dữ liệu, chuỗi, các phép toán",
      "Khám phá cách sử dụng cấu trúc điều khiển, vòng lặp, hàm, xử lý file",
      "Quản lý môi trường lập trình với virtual environment, quản lý các gói trong Python",
      "Các khái niệm nâng cao như xử lý lỗi, biểu thức chính quy, giúp tối ưu hóa quá trình viết code.",
      "Lập trình hướng đối tượng trong Python",
      "Sử dụng các công cụ mạnh mẽ như Numpy, Matplotlib, Pandas để phục cho cho trí tuệ nhân tạo.",
      "Thực hành với cơ sở dữ liệu như SQLite3 giúp lưu trữ dữ liệu"
    ],
    relatedTopics: ["Python", "CNTT & Phần mềm khác", "CNTT & Phần mềm"],
    features: [
      { icon: Monitor, text: "24 giờ video theo yêu cầu" },
      { icon: Download, text: "20 tài nguyên có thể tải xuống" },
      { icon: FileText, text: "8 bài viết" },
      { icon: Smartphone, text: "Truy cập trên thiết bị di động và TV" },
      { icon: Trophy, text: "Giấy chứng nhận hoàn thành" },
    ],
    curriculumStats: "35 phần • 189 bài giảng • 23 giờ 51 phút tổng thời lượng",
    curriculum: [
      {
        title: "Introduction",
        lectures: 6,
        duration: "16 phút",
        lessons: [
          { title: "Introduction - Giới thiệu giảng viên", duration: "0:54", preview: true },
          { title: "Khóa học này dành cho ai", duration: "2:12", preview: true },
          { title: "Lộ trình chinh phục Python trong 30 ngày", duration: "4:12", preview: true },
          { title: "Thông tin về additional sections", duration: "2:32", preview: false },
          { title: "Cách học hiệu quả trên Udemy", duration: "5:05", preview: false },
          { title: "Vấn đề bản quyền khóa học - Quan trọng", duration: "0:55", preview: false },
        ]
      },
      {
        title: "Cài đặt môi trường lập trình Python",
        lectures: 4,
        duration: "35 phút",
        lessons: [
          { title: "Cài đặt Python trên Windows", duration: "10:20", preview: false },
          { title: "Cài đặt VS Code", duration: "12:15", preview: false },
        ]
      }
    ]
  };

  const [openChapters, setOpenChapters] = useState<number[]>([0]);
  const [showAllLearning, setShowAllLearning] = useState(false);

  const toggleChapter = (index: number) => {
    setOpenChapters(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center text-foreground font-bold">Đang tải...</div>;
  if (!courseData) return <div className="min-h-screen bg-background flex items-center justify-center text-foreground font-bold">Không tìm thấy khóa học</div>;

  // Merge API data with mock data
  const course = {
    ...mockCourse,
    title: courseData.title,
    price: courseData.price,
    salePrice: courseData.salePrice,
    thumbnail: courseData.thumbnail,
    categoryName: courseData.category?.name || "Khóa học",
    description: courseData.description || mockCourse.subtitle,
    tags: courseData.tags,
    author: courseData.author?.userName || mockCourse.author,
    rating: courseData.stats?.averageRating || mockCourse.rating,
    reviews: courseData.stats?.ratingCount ? `${courseData.stats.ratingCount} xếp hạng` : mockCourse.reviews,
    students: courseData.stats?.enrollmentCount ? `${courseData.stats.enrollmentCount} học viên` : mockCourse.students,
    updated: courseData.updatedAt
      ? new Date(courseData.updatedAt).toLocaleDateString("vi-VN", { month: "2-digit", year: "numeric" })
      : mockCourse.updated,
    whatYouWillLearn: courseData.learningOutcomes?.length
      ? courseData.learningOutcomes.map((item: any) => typeof item === 'string' ? item : item.content)
      : mockCourse.whatYouWillLearn,
    features: courseData.includes?.length
      ? courseData.includes.map((item: any) => {
        let text = item.label;
        if (item.value) {
          if (item.unit === 'hour') {
            text = `${item.value} giờ ${item.label.toLowerCase()}`;
          } else if (item.unit === 'resource') {
            text = `${item.value} tài liệu tải về`;
          } else if (item.unit === 'article') {
            text = `${item.value} bài viết`;
          } else {
            text = `${item.value} ${item.unit} ${item.label.toLowerCase()}`;
          }
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
      : mockCourse.features,
    curriculumStats: courseData.stats
      ? `${courseData.stats.sectionCount} phần • ${courseData.stats.lessonCount} bài giảng • ${courseData.stats.totalDurationSeconds > 3600
        ? `${Math.round(courseData.stats.totalDurationSeconds / 3600)} giờ`
        : `${Math.round(courseData.stats.totalDurationSeconds / 60)} phút`
      } tổng thời lượng`
      : mockCourse.curriculumStats,
    curriculum: courseData.sections?.length
      ? courseData.sections.map((sec: any) => {
        const lessonCount = sec.lessons?.length || 0;
        const totalSec = sec.lessons?.reduce((acc: number, cur: any) => acc + (cur.duration || 0), 0) || 0;
        const totalMin = Math.round(totalSec / 60);

        return {
          title: sec.title,
          lectures: lessonCount,
          duration: `${totalMin} phút`,
          lessons: sec.lessons?.map((les: any) => ({
            title: les.title,
            preview: les.preview,
            duration: typeof les.duration === 'number'
              ? `${Math.floor(les.duration / 60)}:${String(les.duration % 60).padStart(2, '0')}`
              : les.duration || "0:00"
          })) || []
        };
      })
      : mockCourse.curriculum,
  };


  return (
    <main className="min-h-screen bg-background relative flex flex-col justify-between">
      <Header />

      {/* TOP DARK BANNER (Full width) */}
      <div className="bg-[#1C1D1F] pt-32 pb-12 w-full text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full lg:flex lg:gap-12 relative">

          {/* Left Side (Banner Content) */}
          <div className="lg:w-2/3 lg:pr-8 space-y-5">
            {/* Breadcrumbs */}
            <div className="mb-4">
              <Breadcrumb>
                <BreadcrumbList className="text-slate-300">
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link href="/" className="hover:text-white transition-colors">
                        Trang chủ
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="text-slate-500 [&>svg]:size-3" />
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link href="/courses" className="hover:text-white transition-colors">
                        Khóa học
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  {courseData?.category && courseData.category.slug !== "course" && courseData.category.name.toLowerCase() !== "khóa học" && (
                    <>
                      <BreadcrumbSeparator className="text-slate-500 [&>svg]:size-3" />
                      <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                          <Link href={`/courses?category=${courseData.category.slug}`} className="hover:text-white transition-colors">
                            {courseData.category.name}
                          </Link>
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                    </>
                  )}
                  <BreadcrumbSeparator className="text-slate-500 [&>svg]:size-3" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-blue-300 font-bold max-w-[200px] truncate sm:max-w-none">
                      {course.title}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            {/* Title & Subtitle */}
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight">
              {course.title}
            </h1>
            <p className="text-lg text-slate-200">
              {course.description}
            </p>

            {/* Badges & Meta */}
            <div className="flex flex-wrap items-center gap-3">
              {course.tags && course.tags.length > 0 ? (
                course.tags.map((tag, idx) => {
                  const badgeColors = [
                    "bg-[#ECEB98] text-[#3D3C0A] hover:bg-[#ECEB98]/80", // Yellowish
                    "bg-[#D3E5FE] text-[#1D3B6A] hover:bg-[#D3E5FE]/80", // Blueish
                    "bg-fuchsia-100 text-fuchsia-800 hover:bg-fuchsia-200",
                    "bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
                    "bg-amber-100 text-amber-900 hover:bg-amber-200"
                  ];
                  const colorClass = badgeColors[idx % badgeColors.length];

                  return (
                    <Badge key={tag.id} className={`${colorClass} px-3 py-1 font-bold text-xs uppercase border-none rounded-sm`}>
                      {tag.name}
                    </Badge>
                  );
                })
              ) : (
                <Badge className="bg-[#ECEB98] text-[#3D3C0A] hover:bg-[#ECEB98]/80 px-3 py-1 font-bold text-xs uppercase border-none rounded-sm">
                  Khóa học
                </Badge>
              )}
            </div>

            {/* Ratings & Students */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-yellow-500 font-bold">
                <span>{course.rating}</span>
                <div className="flex text-yellow-500">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <span className="text-blue-300 font-normal underline cursor-pointer hover:text-white">
                  ({course.reviews})
                </span>
              </div>
              <span>{course.students}</span>
            </div>

            <div className="text-sm">
              Được tạo bởi <span className="text-blue-300 underline cursor-pointer hover:text-white font-bold">{course.author}</span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm pt-2">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>Lần cập nhật gần đây nhất {course.updated}</span>
              </div>
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
          <div className="border border-border p-6 shadow-sm bg-card text-card-foreground rounded-2xl">
            <h2 className="text-2xl font-bold mb-6">Nội dung bài học</h2>
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


          {/* Features */}
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

          {/* Curriculum Accordion */}
          <div>
            <h2 className="text-2xl font-bold mb-2">Nội dung khóa học</h2>
            <div className="flex justify-between items-center text-sm mb-4">
              <span className="text-muted-foreground">{course.curriculumStats}</span>
              <button onClick={() => setOpenChapters(course.curriculum.map((_, i) => i))} className="text-primary font-bold hover:text-primary/80">
                Mở rộng tất cả các phần
              </button>
            </div>

            <div className="border border-border bg-card rounded-2xl overflow-hidden">
              {course.curriculum.map((chapter, idx) => (
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
                            <div key={lIdx} className="flex items-start justify-between text-sm group cursor-pointer">
                              <div className="flex items-start gap-4">
                                <PlayCircle className="w-4 h-4 mt-0.5 text-foreground/50 shrink-0" />
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
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR (Floating) */}
        <div className="lg:w-1/3 relative z-30">
          <div className="lg:absolute lg:top-[-300px] lg:right-0 lg:w-full bg-card text-card-foreground shadow-2xl border border-border/40 shadow-black/20 flex flex-col rounded-2xl overflow-hidden">

            {/* Video Thumbnail area */}
            <div className="relative aspect-video w-full border-b border-border bg-black overflow-hidden flex items-center justify-center cursor-pointer group">
              <img src={course.thumbnail || "https://images.unsplash.com/photo-1526379095098-d400fd0bfce8?auto=format&fit=crop&q=80&w=600"} alt="Video Preview" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
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
                      {course.salePrice ? course.salePrice.toLocaleString('vi-VN') : course.price.toLocaleString('vi-VN')} đ
                    </span>
                    {course.salePrice && course.price > course.salePrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        {course.price.toLocaleString('vi-VN')} đ
                      </span>
                    )}
                  </div>
                </div>

                <button className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 px-4 rounded-2xl transition-all shadow-lg shadow-primary/25 cursor-pointer text-center text-base">
                  Đăng ký khóa học
                </button>

                <div className="text-center text-xs text-muted-foreground space-y-2 pt-2 border-t border-border/40">
                  <p className="flex items-center justify-center gap-1.5 text-slate-300">
                    <span className="text-emerald-500">✓</span> Quyền truy cập đầy đủ trọn đời
                  </p>
                  <p className="flex items-center justify-center gap-1.5 text-slate-300">
                    <span className="text-emerald-500">✓</span> Học trực tuyến trên mọi thiết bị di động & máy tính
                  </p>
                  <p className="flex items-center justify-center gap-1.5 text-slate-300">
                    <span className="text-emerald-500">✓</span> Cam kết chất lượng đào tạo từ GATS Academy
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
      <Footer />
    </main>
  );
}
