import { cn } from "@/lib/utils";
import type { CourseDetail } from "@/lib/api/types";
import Image from "next/image";
import Link from "next/link";

const STATUS_LABELS: Record<string, string> = {
  draft: "Nháp",
  published: "Đã xuất bản",
  archived: "Lưu trữ",
};

const LEVEL_LABELS: Record<string, string> = {
  beginner: "Cơ bản",
  intermediate: "Trung cấp",
  advanced: "Nâng cao",
};

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes} phút`;
}

type CourseDetailHeaderProps = {
  course: CourseDetail;
};

export function CourseDetailHeader({ course }: CourseDetailHeaderProps) {
  return (
    <div className="rounded-[10px] border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-1 gap-4">
          {course.thumbnail && (
            <Image
              src={course.thumbnail}
              alt={course.title}
              width={160}
              height={90}
              className="h-22.5 w-40 rounded-lg object-cover"
            />
          )}
          <div>
            <h2 className="text-xl font-bold text-dark dark:text-white">
              {course.title}
            </h2>
            <p className="mt-1 text-sm text-dark-4 dark:text-dark-6">
              {course.slug}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium",
                  course.status === "published"
                    ? "bg-[#219653]/8 text-[#219653]"
                    : course.status === "draft"
                      ? "bg-[#FFA70B]/8 text-[#FFA70B]"
                      : "bg-[#D34053]/8 text-[#D34053]",
                )}
              >
                {STATUS_LABELS[course.status]}
              </span>
              <span className="rounded-full bg-gray-2 px-3 py-1 text-xs font-medium text-dark dark:bg-dark-3 dark:text-white">
                {LEVEL_LABELS[course.level]}
              </span>
              {course.category && (
                <span className="rounded-full bg-gray-2 px-3 py-1 text-xs font-medium text-dark dark:bg-dark-3 dark:text-white">
                  {course.category.name}
                </span>
              )}
            </div>
          </div>
        </div>

        <Link
          href={`/course/${course.id}/edit`}
          className="rounded-lg border border-stroke px-4 py-2 text-sm font-medium text-dark transition hover:bg-gray-2 dark:border-dark-3 dark:text-white dark:hover:bg-dark-3"
        >
          Sửa khóa học
        </Link>
      </div>

      {course.description && (
        <p className="mb-4 text-sm text-dark-4 dark:text-dark-6">
          {course.description}
        </p>
      )}

      <div className="mb-4 flex flex-wrap gap-4 text-sm">
        <span className="text-dark dark:text-white">
          Giá:{" "}
          <strong>
            {(course.salePrice ?? course.price).toLocaleString("vi-VN")}đ
          </strong>
        </span>
        {course.author && (
          <span className="text-dark-4 dark:text-dark-6">
            Giảng viên: {course.author.userName}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Học viên" value={course.stats.enrollmentCount} />
        <StatCard label="Đánh giá" value={course.stats.averageRating ?? "—"} />
        <StatCard label="Chương" value={course.stats.sectionCount} />
        <StatCard label="Bài học" value={course.stats.lessonCount} />
        <StatCard
          label="Thời lượng"
          value={formatDuration(course.stats.totalDurationSeconds)}
        />
        <StatCard label="Tags" value={course.tags.length} />
      </div>

      {course.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {course.tags.map((tag) => (
            <span
              key={tag.id}
              className="rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary"
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-stroke px-3 py-2 dark:border-dark-3">
      <p className="text-xs text-dark-4 dark:text-dark-6">{label}</p>
      <p className="mt-1 font-semibold text-dark dark:text-white">{value}</p>
    </div>
  );
}
