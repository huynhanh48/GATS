import type { CourseLevel, CourseStatus } from "@/lib/api/types";

export type LandingCourse = {
  id: string;
  title: string;
  slug: string;
  description: string;
  tag: string;
  categoryId: string;
  lessonCount: number;
  durationMinutes: number;
  isPublished: boolean;
  isFree: boolean;
  price: number;
  /** Sale price in VND; null = no sale */
  salePrice: number | null;
  thumbnail: string;
  level: CourseLevel;
  status: CourseStatus;
};

/** Match BE `slugify` closely enough for catalog ↔ detail links. */
export function slugifyTitle(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Temporary thumbnails copied from mobile-app/assets/images */
export const COURSE_THUMB_PATHS = [
  "/images/courses/thumb-a.jpg",
  "/images/courses/thumb-b.jpg",
  "/images/courses/thumb-c.jpg",
] as const;

export function courseThumbAt(index: number) {
  return COURSE_THUMB_PATHS[index % COURSE_THUMB_PATHS.length]!;
}

/** Normalize title for matching BE ↔ landing mock (case / diacritics tolerant enough). */
export function normalizeCourseKey(title: string) {
  return title
    .normalize("NFC")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Canonical mock catalog — titles must match BE Bootstrap MOBILE_COURSE_FIXTURES
 * and mobile-app/assets/data/courses.json (synced set for /course + /admin/course).
 */
export const LANDING_COURSES: LandingCourse[] = [
  {
    id: "course-1",
    title: "AI cho Dân văn phòng",
    slug: slugifyTitle("AI cho Dân văn phòng"),
    description: "Từ zero đến thành thạo AI trong công việc hàng ngày",
    tag: "AI cho công sở",
    categoryId: "ai-office",
    lessonCount: 24,
    durationMinutes: 480,
    isPublished: true,
    isFree: false,
    price: 299000,
    salePrice: 199000,
    thumbnail: courseThumbAt(0),
    level: "beginner",
    status: "published",
  },
  {
    id: "course-2",
    title: "Prompt Engineering",
    slug: slugifyTitle("Prompt Engineering"),
    description: "Viết prompt chuyên nghiệp cho mọi tình huống",
    tag: "AI cho công sở",
    categoryId: "ai-office",
    lessonCount: 18,
    durationMinutes: 360,
    isPublished: true,
    isFree: true,
    price: 0,
    salePrice: null,
    thumbnail: courseThumbAt(1),
    level: "intermediate",
    status: "published",
  },
  {
    id: "course-3",
    title: "Tự động hóa với AI",
    slug: slugifyTitle("Tự động hóa với AI"),
    description: "Workflow và agent cho team nhỏ",
    tag: "Automation",
    categoryId: "automation",
    lessonCount: 12,
    durationMinutes: 240,
    isPublished: true,
    isFree: false,
    price: 499000,
    salePrice: 399000,
    thumbnail: courseThumbAt(2),
    level: "intermediate",
    status: "published",
  },
  {
    id: "course-4",
    title: "Nhập môn Lập trình Flutter",
    slug: slugifyTitle("Nhập môn Lập trình Flutter"),
    description: "Tạo ứng dụng di động đa nền tảng nhanh chóng",
    tag: "Lập trình",
    categoryId: "programming",
    lessonCount: 40,
    durationMinutes: 1200,
    isPublished: true,
    isFree: false,
    price: 899000,
    salePrice: null,
    thumbnail: courseThumbAt(0),
    level: "beginner",
    status: "published",
  },
  {
    id: "course-5",
    title: "Digital Marketing Thực chiến",
    slug: slugifyTitle("Digital Marketing Thực chiến"),
    description: "Tối ưu quảng cáo và tăng tỷ lệ chuyển đổi",
    tag: "Marketing",
    categoryId: "marketing",
    lessonCount: 20,
    durationMinutes: 600,
    isPublished: true,
    isFree: true,
    price: 0,
    salePrice: null,
    thumbnail: courseThumbAt(1),
    level: "beginner",
    status: "published",
  },
  {
    id: "course-6",
    title: "Tiếng Anh Giao tiếp cơ bản",
    slug: slugifyTitle("Tiếng Anh Giao tiếp cơ bản"),
    description: "Tự tin giao tiếp tiếng Anh trong 30 ngày",
    tag: "Ngoại ngữ",
    categoryId: "language",
    lessonCount: 30,
    durationMinutes: 900,
    isPublished: true,
    isFree: false,
    price: 149000,
    salePrice: 99000,
    thumbnail: courseThumbAt(2),
    level: "beginner",
    status: "published",
  },
  {
    id: "course-7",
    title: "Kỹ năng thuyết trình trước đám đông",
    slug: slugifyTitle("Kỹ năng thuyết trình trước đám đông"),
    description: "Nói trước đám đông không còn là nỗi sợ",
    tag: "Kỹ năng mềm",
    categoryId: "soft-skills",
    lessonCount: 15,
    durationMinutes: 450,
    isPublished: true,
    isFree: true,
    price: 0,
    salePrice: null,
    thumbnail: courseThumbAt(0),
    level: "beginner",
    status: "published",
  },
];

export const LANDING_COURSE_KEYS = new Set(
  LANDING_COURSES.map((c) => normalizeCourseKey(c.title)),
);

export function isLandingMockCourse(title: string) {
  return LANDING_COURSE_KEYS.has(normalizeCourseKey(title));
}

/** Keep only mock catalog courses, ordered like LANDING_COURSES. */
export function filterAndSortLandingMockCourses<T extends { title: string }>(
  courses: T[],
): T[] {
  const byKey = new Map(
    courses
      .filter((c) => isLandingMockCourse(c.title))
      .map((c) => [normalizeCourseKey(c.title), c] as const),
  );

  const ordered: T[] = [];
  for (const mock of LANDING_COURSES) {
    const hit = byKey.get(normalizeCourseKey(mock.title));
    if (hit) ordered.push(hit);
  }
  return ordered;
}

export function formatVnd(amount: number) {
  return `${amount.toLocaleString("vi-VN")}đ`;
}

export function formatLandingPrice(
  course: Pick<LandingCourse, "isFree" | "price" | "salePrice">,
) {
  if (course.isFree || course.price <= 0) return "Miễn phí";
  if (course.salePrice != null && course.salePrice < course.price) {
    return formatVnd(course.salePrice);
  }
  return formatVnd(course.price);
}

export function hasActiveSale(
  course: Pick<LandingCourse, "price" | "salePrice" | "isFree">,
) {
  if (course.isFree || course.price <= 0) return false;
  return course.salePrice != null && course.salePrice > 0 && course.salePrice < course.price;
}

export function formatDurationHours(minutes: number) {
  if (minutes <= 0) return "";
  if (minutes < 60) return `${minutes} phút`;
  return `${Math.round(minutes / 60)} giờ`;
}

export function formatCourseLevel(level: CourseLevel) {
  if (level === "beginner") return "Cơ bản";
  if (level === "intermediate") return "Trung cấp";
  return "Nâng cao";
}

export function resolveCourseThumbnail(
  thumbnail: string | null | undefined,
  index: number,
) {
  if (thumbnail && thumbnail.trim().length > 0) {
    // Prefer relative path so /course and admin share same origin assets
    if (thumbnail.includes("/images/courses/")) {
      const path = thumbnail.slice(thumbnail.indexOf("/images/courses/"));
      return path;
    }
    // Keep absolute URLs as-is (picsum seed, MinIO, CDN) so list + detail match
    return thumbnail;
  }
  return courseThumbAt(index);
}
