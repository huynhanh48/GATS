import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileText,
  GraduationCap,
  HelpCircle,
  Layers3,
  LockKeyhole,
  PlayCircle,
  Sparkles,
  Star,
  Target,
  UserRound,
  UsersRound,
} from "lucide-react";
import { LandingNav } from "@/components/Landing/LandingNav";
import { BE_API_URL } from "@/lib/api/config";
import type { CourseDetail, CourseDetailSection } from "@/lib/api/types";
import {
  formatCourseLevel,
  formatDurationHours,
  LANDING_COURSES,
  resolveCourseThumbnail,
} from "@/lib/landing/courses";
import { CourseEnrollActions } from "./_components/enroll-actions";

type PageProps = {
  params: Promise<{ slug: string }>;
};

type CourseDetailTemplate = {
  eyebrow: string;
  shortSummary: string;
  outcomes: string[];
  includes: string[];
  audience: string[];
  requirements: string[];
  projects: string[];
  instructor: {
    name: string;
    role: string;
    bio: string;
  };
  sections: Array<{
    title: string;
    lessons: Array<{
      title: string;
      description: string;
      durationMinutes: number;
      preview?: boolean;
      type?: "video" | "quiz" | "assignment";
    }>;
  }>;
  faq: Array<{ question: string; answer: string }>;
};

const DEFAULT_TEMPLATE: CourseDetailTemplate = {
  eyebrow: "Khóa học thực chiến",
  shortSummary:
    "Một lộ trình học gọn, tập trung vào kỹ năng có thể áp dụng ngay sau từng buổi học.",
  outcomes: [
    "Nắm được tư duy nền tảng của chủ đề và cách áp dụng vào công việc.",
    "Hoàn thành các bài thực hành ngắn để biến kiến thức thành kỹ năng.",
    "Biết cách tự đánh giá tiến độ học và chọn bước tiếp theo phù hợp.",
    "Có bộ checklist để ôn tập sau khóa học.",
  ],
  includes: [
    "Video bài giảng theo từng module",
    "Tài liệu tóm tắt sau mỗi phần",
    "Quiz kiểm tra nhanh",
    "Cập nhật nội dung khi khóa học được bổ sung",
  ],
  audience: [
    "Người mới bắt đầu muốn học có lộ trình",
    "Người đi làm cần kỹ năng áp dụng nhanh",
    "Học viên muốn có bài tập thực hành thay vì chỉ xem lý thuyết",
  ],
  requirements: [
    "Có máy tính hoặc điện thoại để học online",
    "Dành 30-45 phút mỗi ngày để thực hành",
    "Không yêu cầu kinh nghiệm chuyên sâu trước đó",
  ],
  projects: [
    "Bộ ghi chú học tập cá nhân",
    "Checklist áp dụng sau từng module",
    "Bài tổng kết cuối khóa",
  ],
  instructor: {
    name: "GATS Academy Team",
    role: "Đội ngũ đào tạo",
    bio: "Đội ngũ giảng viên xây dựng khóa học theo hướng ngắn gọn, thực tế và dễ áp dụng cho người học bận rộn.",
  },
  sections: [
    {
      title: "Khởi động",
      lessons: [
        {
          title: "Tổng quan khóa học",
          description: "Hiểu mục tiêu, cách học và kết quả đầu ra.",
          durationMinutes: 12,
          preview: true,
        },
        {
          title: "Thiết lập lộ trình cá nhân",
          description: "Chọn nhịp học và mục tiêu phù hợp với thời gian của bạn.",
          durationMinutes: 18,
        },
      ],
    },
    {
      title: "Thực hành",
      lessons: [
        {
          title: "Bài thực hành nền tảng",
          description: "Áp dụng kiến thức chính vào một tình huống thực tế.",
          durationMinutes: 25,
        },
        {
          title: "Quiz kiểm tra nhanh",
          description: "Kiểm tra mức độ nắm bài trước khi chuyển module.",
          durationMinutes: 10,
          type: "quiz",
        },
      ],
    },
  ],
  faq: [
    {
      question: "Khóa học này có phù hợp với người mới không?",
      answer: "Có. Nội dung được chia nhỏ theo từng bước và có bài thực hành mẫu.",
    },
    {
      question: "Sau khi mua có học lại được không?",
      answer: "Có. Khóa học nằm trong tài khoản của bạn để xem lại khi cần.",
    },
  ],
};

const COURSE_TEMPLATES: Record<string, CourseDetailTemplate> = {
  "ai-cho-dan-van-phong": {
    eyebrow: "AI cho dân văn phòng",
    shortSummary:
      "Lộ trình thực chiến giúp bạn dùng AI để viết nhanh hơn, xử lý dữ liệu gọn hơn, tự động hóa việc lặp lại và tạo trợ lý cá nhân cho công việc hằng ngày.",
    outcomes: [
      "Biết cách dùng ChatGPT/Copilot để soạn email, báo cáo, kế hoạch và nội dung nội bộ.",
      "Tạo prompt rõ vai trò, mục tiêu, ngữ cảnh, ràng buộc và định dạng đầu ra.",
      "Tóm tắt tài liệu dài, trích insight và biến ghi chú rời rạc thành checklist hành động.",
      "Ứng dụng AI vào Excel/Google Sheets để phân loại, làm sạch và phân tích dữ liệu cơ bản.",
      "Thiết kế workflow tự động cho các tác vụ lặp lại trong công việc văn phòng.",
      "Xây dựng bộ prompt cá nhân để tái sử dụng cho team hoặc phòng ban.",
    ],
    includes: [
      "24 bài học ngắn theo tình huống văn phòng",
      "Prompt library cho email, báo cáo, phân tích và họp",
      "Mẫu checklist triển khai AI trong team",
      "Quiz và bài tập thực hành sau mỗi module",
      "Cập nhật nội dung khi công cụ AI thay đổi",
      "Chứng nhận hoàn thành khóa học",
    ],
    audience: [
      "Nhân sự văn phòng muốn tăng tốc xử lý công việc hằng ngày",
      "Quản lý/team lead muốn chuẩn hóa cách dùng AI trong nhóm",
      "Sinh viên, thực tập sinh chuẩn bị đi làm",
      "Người chưa biết kỹ thuật nhưng muốn dùng AI một cách an toàn và hiệu quả",
    ],
    requirements: [
      "Không cần biết lập trình",
      "Có tài khoản ChatGPT, Copilot hoặc công cụ AI tương đương",
      "Có laptop để thực hành với tài liệu, email và bảng tính",
      "Sẵn sàng mang một việc thật của bạn vào bài tập",
    ],
    projects: [
      "Bộ prompt cá nhân cho công việc hằng ngày",
      "Template tóm tắt họp và báo cáo tuần bằng AI",
      "Workflow phân tích dữ liệu văn phòng cơ bản",
      "Kế hoạch áp dụng AI cho một team nhỏ trong 14 ngày",
    ],
    instructor: {
      name: "GATS Academy AI Team",
      role: "Đội ngũ đào tạo AI ứng dụng",
      bio: "Nhóm xây dựng khóa học từ các tình huống thật trong văn phòng: viết, họp, báo cáo, phân tích dữ liệu và tự động hóa tác vụ lặp lại.",
    },
    sections: [
      {
        title: "Module 1: Nền tảng AI cho công việc",
        lessons: [
          {
            title: "AI có thể làm gì trong một ngày làm việc?",
            description: "Nhìn tổng quan các nhóm việc AI hỗ trợ tốt và giới hạn cần biết.",
            durationMinutes: 18,
            preview: true,
          },
          {
            title: "Cách đặt mục tiêu trước khi dùng AI",
            description: "Biến yêu cầu mơ hồ thành nhiệm vụ rõ đầu vào, đầu ra và tiêu chí.",
            durationMinutes: 16,
          },
          {
            title: "Nguyên tắc bảo mật dữ liệu khi dùng AI",
            description: "Những loại dữ liệu không nên đưa vào AI và cách ẩn danh thông tin.",
            durationMinutes: 20,
          },
        ],
      },
      {
        title: "Module 2: Prompt Engineering văn phòng",
        lessons: [
          {
            title: "Công thức prompt: Vai trò - Mục tiêu - Ngữ cảnh - Đầu ra",
            description: "Khung prompt đơn giản để kết quả ổn định hơn.",
            durationMinutes: 22,
          },
          {
            title: "Viết email, thông báo và tin nhắn chuyên nghiệp",
            description: "Tạo nội dung đúng giọng điệu, ngắn gọn và có cấu trúc.",
            durationMinutes: 26,
          },
          {
            title: "Biến ghi chú rời rạc thành kế hoạch hành động",
            description: "Từ bullet thô sang timeline, owner, deadline và checklist.",
            durationMinutes: 24,
          },
        ],
      },
      {
        title: "Module 3: Tài liệu, họp và báo cáo",
        lessons: [
          {
            title: "Tóm tắt tài liệu dài trong 5 phút",
            description: "Cách lấy ý chính, rủi ro, việc cần làm và câu hỏi còn mở.",
            durationMinutes: 25,
          },
          {
            title: "Tạo biên bản họp và follow-up tự động",
            description: "Chuẩn hóa nội dung họp thành quyết định, task và deadline.",
            durationMinutes: 20,
          },
          {
            title: "Viết báo cáo tuần/tháng bằng AI",
            description: "Tạo báo cáo có cấu trúc, insight và đề xuất hành động.",
            durationMinutes: 28,
            type: "assignment",
          },
        ],
      },
      {
        title: "Module 4: Dữ liệu và tự động hóa",
        lessons: [
          {
            title: "Làm sạch và phân loại dữ liệu bảng tính",
            description: "Dùng AI hỗ trợ chuẩn hóa tên, nhóm dữ liệu và phát hiện bất thường.",
            durationMinutes: 30,
          },
          {
            title: "Tạo công thức Excel/Sheets bằng ngôn ngữ tự nhiên",
            description: "Mô tả yêu cầu và kiểm tra công thức AI đề xuất.",
            durationMinutes: 22,
          },
          {
            title: "Thiết kế workflow tự động cho việc lặp lại",
            description: "Chọn trigger, action, kiểm tra lỗi và đo hiệu quả.",
            durationMinutes: 34,
          },
        ],
      },
      {
        title: "Module 5: Bộ công cụ cá nhân",
        lessons: [
          {
            title: "Xây prompt library cho riêng bạn",
            description: "Lưu, đặt tên, phiên bản hóa và chia sẻ prompt với team.",
            durationMinutes: 24,
          },
          {
            title: "Bài tổng kết: 14 ngày áp dụng AI vào team",
            description: "Lập kế hoạch triển khai nhỏ, đo hiệu quả và cải tiến.",
            durationMinutes: 32,
            type: "assignment",
          },
          {
            title: "Quiz cuối khóa",
            description: "Kiểm tra các nguyên tắc quan trọng trước khi hoàn thành.",
            durationMinutes: 12,
            type: "quiz",
          },
        ],
      },
    ],
    faq: [
      {
        question: "Tôi chưa từng dùng AI có học được không?",
        answer:
          "Có. Khóa học đi từ cách hiểu nhiệm vụ, viết prompt cơ bản rồi mới đến workflow và dữ liệu.",
      },
      {
        question: "Khóa học có cần biết lập trình không?",
        answer:
          "Không. Các bài học tập trung vào công cụ phổ biến trong văn phòng, tài liệu, email và bảng tính.",
      },
      {
        question: "Tôi có thể áp dụng ngay vào công việc thật không?",
        answer:
          "Có. Mỗi module đều có bài thực hành gắn với email, họp, báo cáo, tài liệu hoặc dữ liệu bạn đang xử lý.",
      },
      {
        question: "Sau khi mua có cập nhật nội dung không?",
        answer:
          "Có. Khi công cụ AI thay đổi, khóa học có thể được cập nhật thêm bài hoặc tài liệu mới.",
      },
    ],
  },
};

function templateFor(slug: string) {
  return COURSE_TEMPLATES[slug] ?? DEFAULT_TEMPLATE;
}

async function loadCourse(slug: string): Promise<CourseDetail | null> {
  try {
    const res = await fetch(`${BE_API_URL}/api/courses/slug/${slug}`, {
      next: { revalidate: 15 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { course: CourseDetail };
    return json.course ?? null;
  } catch {
    return null;
  }
}

function templateSectionsAsCourseSections(
  template: CourseDetailTemplate,
): CourseDetailSection[] {
  return template.sections.map((section, sectionIndex) => ({
    id: `template-section-${sectionIndex}`,
    title: section.title,
    order: sectionIndex + 1,
    lessonCount: section.lessons.length,
    totalDurationSeconds: section.lessons.reduce(
      (sum, lesson) => sum + lesson.durationMinutes * 60,
      0,
    ),
    lessons: section.lessons.map((lesson, lessonIndex) => ({
      id: `template-lesson-${sectionIndex}-${lessonIndex}`,
      title: lesson.title,
      description: lesson.description,
      type: lesson.type ?? "video",
      order: lessonIndex + 1,
      isPreview: lesson.preview ?? false,
      duration: lesson.durationMinutes * 60,
      locked: !(lesson.preview ?? false),
    })),
  }));
}

function mockAsDetail(slug: string): CourseDetail | null {
  const mock = LANDING_COURSES.find((c) => c.slug === slug);
  if (!mock) return null;
  const template = templateFor(slug);
  const sections = templateSectionsAsCourseSections(template);
  const lessonCount = sections.reduce((sum, section) => sum + section.lessonCount, 0);
  const totalDurationSeconds = sections.reduce(
    (sum, section) => sum + section.totalDurationSeconds,
    0,
  );

  return {
    id: mock.id,
    title: mock.title,
    slug: mock.slug,
    description: mock.description || template.shortSummary,
    thumbnail: mock.thumbnail,
    introVideo: null,
    price: mock.price,
    salePrice: mock.salePrice,
    level: mock.level,
    status: mock.status,
    category: null,
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    author: null,
    stats: {
      enrollmentCount: 2480,
      ratingCount: 326,
      averageRating: 4.8,
      sectionCount: sections.length,
      lessonCount,
      totalDurationSeconds,
    },
    learningOutcomes: template.outcomes.map((content, index) => ({
      id: `template-outcome-${index}`,
      content,
      order: index + 1,
    })),
    includes: template.includes.map((label, index) => ({
      id: `template-include-${index}`,
      key: `include_${index}`,
      label,
      value: null,
      unit: null,
      order: index + 1,
    })),
    sections,
  };
}

function looksGenericSection(section: CourseDetailSection) {
  return section.lessons.every((lesson) => /^Bài\s+\d+$/i.test(lesson.title.trim()));
}

function getDisplaySections(course: CourseDetail, template: CourseDetailTemplate) {
  if (course.sections.length === 0) return templateSectionsAsCourseSections(template);
  if (course.sections.every(looksGenericSection)) {
    return templateSectionsAsCourseSections(template);
  }
  return course.sections;
}

function formatLessonDuration(seconds: number | null | undefined) {
  if (!seconds || seconds <= 0) return "";
  const minutes = Math.max(1, Math.round(seconds / 60));
  return `${minutes} phút`;
}

function lessonTypeLabel(type: string) {
  if (type === "quiz") return "Quiz";
  if (type === "assignment") return "Bài tập";
  if (type === "text") return "Đọc";
  return "Video";
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = (await loadCourse(slug)) ?? mockAsDetail(slug);
  if (!course) return { title: "Khóa học | GATS Academy" };
  return {
    title: `${course.title} | GATS Academy`,
    description: course.description ?? undefined,
  };
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const fromBe = await loadCourse(slug);
  const course = fromBe ?? mockAsDetail(slug);
  if (!course) notFound();

  const template = templateFor(slug);
  const sections = getDisplaySections(course, template);
  const outcomes =
    course.learningOutcomes.length > 0
      ? course.learningOutcomes.map((item) => item.content)
      : template.outcomes;
  const includes =
    course.includes.length > 0
      ? course.includes.map((item) => item.label)
      : template.includes;
  const duration = formatDurationHours(
    Math.round((course.stats.totalDurationSeconds ?? 0) / 60),
  );
  const averageRating = course.stats.averageRating ?? 4.8;
  const enrollmentCount = course.stats.enrollmentCount || 2480;

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-950 dark:bg-black dark:text-white">
      <LandingNav active="course" tone="light" />

      <main>
        <section className="px-5 pt-8 pb-14 md:px-8 md:pt-12">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.3fr_0.7fr]">
            <div>
              <Link
                href="/course"
                className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
                Tất cả khóa học
              </Link>

              <div className="mt-6 inline-flex min-h-10 items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 text-sm font-semibold text-orange-700 dark:border-orange-900/60 dark:bg-orange-950/30 dark:text-orange-300">
                <Sparkles className="size-4" aria-hidden="true" />
                {template.eyebrow}
              </div>

              <h1 className="mt-5 max-w-4xl text-4xl leading-tight font-bold tracking-tight md:text-6xl">
                {course.title}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 dark:text-slate-300 md:text-lg">
                {course.description || template.shortSummary}
              </p>

              <div className="mt-7 flex flex-wrap gap-2 text-sm text-slate-600 dark:text-slate-300">
                <span className="inline-flex min-h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-[#111]">
                  <Star className="size-4 fill-orange-500 text-orange-500" aria-hidden="true" />
                  {averageRating.toFixed(1)} ({course.stats.ratingCount || 326} đánh giá)
                </span>
                <span className="inline-flex min-h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-[#111]">
                  <UsersRound className="size-4" aria-hidden="true" />
                  {enrollmentCount.toLocaleString("vi-VN")} học viên
                </span>
                <span className="inline-flex min-h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-[#111]">
                  <GraduationCap className="size-4" aria-hidden="true" />
                  {formatCourseLevel(course.level)}
                </span>
                <span className="inline-flex min-h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-[#111]">
                  <Clock3 className="size-4" aria-hidden="true" />
                  {course.stats.lessonCount} bài{duration ? ` · ${duration}` : ""}
                </span>
              </div>

              <div className="relative mt-8 aspect-video overflow-hidden rounded-[8px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#111]">
                <Image
                  src={resolveCourseThumbnail(course.thumbnail, 0)}
                  alt={course.title}
                  fill
                  className="object-cover"
                  sizes="(max-width:1024px) 100vw, 60vw"
                  unoptimized
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-white/95 px-4 text-sm font-bold text-slate-950 shadow-sm">
                  <PlayCircle className="size-5 text-orange-600" aria-hidden="true" />
                  Xem bài học preview
                </div>
              </div>
            </div>

            <aside className="lg:sticky lg:top-8 lg:self-start">
              <CourseEnrollActions course={course} />
              <div className="mt-4 rounded-[8px] border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-[#111] dark:text-slate-300">
                <p className="font-bold text-slate-950 dark:text-white">
                  Khóa này bao gồm
                </p>
                <ul className="mt-4 space-y-3">
                  {includes.slice(0, 5).map((item) => (
                    <li key={item} className="flex gap-2">
                      <CheckCircle2
                        className="mt-0.5 size-4 shrink-0 text-emerald-600"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </section>

        <section className="px-5 pb-16 md:px-8">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_0.8fr]">
            <div className="rounded-[8px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111] md:p-8">
              <div className="flex items-center gap-3">
                <Target className="size-6 text-orange-600" aria-hidden="true" />
                <h2 className="text-2xl font-bold">Bạn sẽ học được gì</h2>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {outcomes.map((item) => (
                  <div key={item} className="flex gap-3 text-sm leading-6 text-slate-700 dark:text-slate-300">
                    <CheckCircle2
                      className="mt-0.5 size-5 shrink-0 text-emerald-600"
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[8px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111] md:p-8">
              <div className="flex items-center gap-3">
                <UserRound className="size-6 text-orange-600" aria-hidden="true" />
                <h2 className="text-2xl font-bold">Giảng viên</h2>
              </div>
              <div className="mt-6 flex gap-4">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-700 dark:bg-orange-950/40 dark:text-orange-300">
                  G
                </div>
                <div>
                  <p className="font-bold text-slate-950 dark:text-white">
                    {course.author?.userName ?? template.instructor.name}
                  </p>
                  <p className="mt-1 text-sm font-medium text-orange-600">
                    {template.instructor.role}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    {template.instructor.bio}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 pb-16 md:px-8">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-3">
            <InfoPanel
              icon={<UsersRound className="size-5" aria-hidden="true" />}
              title="Khóa này dành cho ai"
              items={template.audience}
            />
            <InfoPanel
              icon={<FileText className="size-5" aria-hidden="true" />}
              title="Bạn cần chuẩn bị"
              items={template.requirements}
            />
            <InfoPanel
              icon={<Award className="size-5" aria-hidden="true" />}
              title="Sản phẩm sau khóa"
              items={template.projects}
            />
          </div>
        </section>

        <section className="px-5 pb-16 md:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-bold tracking-[0.2em] text-orange-600 uppercase">
                  Curriculum
                </p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight">
                  Chương trình học chi tiết
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                  Nội dung được chia theo module để bạn học tới đâu áp dụng được
                  tới đó.
                </p>
              </div>
              <div className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-[#111] dark:text-slate-300">
                <Layers3 className="size-4" aria-hidden="true" />
                {sections.length} module ·{" "}
                {sections.reduce((sum, item) => sum + item.lessonCount, 0)} bài
              </div>
            </div>

            <div className="space-y-4">
              {sections.map((section, sectionIndex) => (
                <details
                  key={section.id}
                  open={sectionIndex < 2}
                  className="overflow-hidden rounded-[8px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#111]"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-bold text-slate-950 dark:text-white">
                    <span>{section.title}</span>
                    <span className="shrink-0 text-xs font-medium text-slate-500 dark:text-slate-400">
                      {section.lessonCount} bài ·{" "}
                      {formatDurationHours(Math.round(section.totalDurationSeconds / 60))}
                    </span>
                  </summary>
                  <ul className="border-t border-slate-100 dark:border-slate-800">
                    {section.lessons.map((lesson) => (
                      <li
                        key={lesson.id}
                        className="grid gap-3 border-b border-slate-100 px-5 py-4 last:border-b-0 dark:border-slate-800 md:grid-cols-[1fr_auto]"
                      >
                        <div className="flex gap-3">
                          <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-[#222] dark:text-slate-300">
                            {lesson.locked ? (
                              <LockKeyhole className="size-4" aria-hidden="true" />
                            ) : (
                              <PlayCircle className="size-4" aria-hidden="true" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-950 dark:text-white">
                              {lesson.title}
                            </p>
                            {lesson.description ? (
                              <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                                {lesson.description}
                              </p>
                            ) : null}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 md:justify-end">
                          <span className="rounded-full border border-slate-200 px-2.5 py-1 dark:border-slate-700">
                            {lessonTypeLabel(lesson.type)}
                          </span>
                          {lesson.isPreview ? (
                            <span className="rounded-full bg-orange-100 px-2.5 py-1 font-semibold text-orange-700 dark:bg-orange-950/40 dark:text-orange-300">
                              Preview
                            </span>
                          ) : null}
                          {formatLessonDuration(lesson.duration) ? (
                            <span>{formatLessonDuration(lesson.duration)}</span>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 pb-20 md:px-8">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] text-orange-600 uppercase">
                FAQ
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight">
                Câu hỏi thường gặp
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                Những thông tin giúp bạn quyết định trước khi thêm khóa học vào
                giỏ hàng.
              </p>
            </div>
            <div className="space-y-3">
              {template.faq.map((item) => (
                <details
                  key={item.question}
                  className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#111]"
                >
                  <summary className="flex cursor-pointer list-none items-center gap-3 font-bold">
                    <HelpCircle className="size-5 text-orange-600" aria-hidden="true" />
                    {item.question}
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function InfoPanel({
  icon,
  title,
  items,
}: {
  icon: ReactNode;
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-[8px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111]">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300">
          {icon}
        </div>
        <h2 className="font-bold text-slate-950 dark:text-white">{title}</h2>
      </div>
      <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <CheckCircle2
              className="mt-0.5 size-4 shrink-0 text-emerald-600"
              aria-hidden="true"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
