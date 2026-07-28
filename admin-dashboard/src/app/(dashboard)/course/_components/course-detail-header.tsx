import { cn } from "@/lib/utils";
import type { CourseDetail } from "@/lib/api/types";
import { resolveCourseThumbnail } from "@/lib/landing/courses";
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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-[#0b1220]">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 gap-4">
          <Image
            src={resolveCourseThumbnail(course.thumbnail, 0)}
            alt={course.title}
            width={160}
            height={90}
            className="h-22.5 w-40 shrink-0 rounded-xl bg-slate-100 object-contain p-1 dark:bg-slate-900"
            unoptimized
          />
          <div className="min-w-0">
            <h2 className="text-xl font-black text-slate-950 dark:text-white">
              {course.title}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {course.slug}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-bold",
                  course.status === "published"
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                    : course.status === "draft"
                      ? "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
                      : "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
                )}
              >
                {STATUS_LABELS[course.status]}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {LEVEL_LABELS[course.level]}
              </span>
              {course.category && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {course.category.name}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Link
            href={`/course/${course.id}/learners`}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-[#0070EB]/40 hover:bg-[#eaf2ff] hover:text-[#0070EB] dark:border-slate-700 dark:text-slate-200 dark:hover:bg-[#0f2742]"
          >
            Học viên
          </Link>
          <Link
            href={`/course/${course.id}/flashcards`}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-[#0070EB]/40 hover:bg-[#eaf2ff] hover:text-[#0070EB] dark:border-slate-700 dark:text-slate-200 dark:hover:bg-[#0f2742]"
          >
            Flashcard
          </Link>
          <Link
            href={`/course/${course.id}/preview`}
            target="_blank"
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-[#0070EB]/40 hover:bg-[#eaf2ff] hover:text-[#0070EB] dark:border-slate-700 dark:text-slate-200 dark:hover:bg-[#0f2742]"
          >
            Xem như học viên
          </Link>
          <Link
            href={`/course/${course.id}/edit`}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-[#0070EB]/40 hover:bg-[#eaf2ff] hover:text-[#0070EB] dark:border-slate-700 dark:text-slate-200 dark:hover:bg-[#0f2742]"
          >
            Sửa khóa học
          </Link>
        </div>
      </div>

      {course.description && (
        <p className="mb-5 max-w-4xl text-sm leading-6 text-slate-600 dark:text-slate-300">
          {course.description}
        </p>
      )}

      <div className="mb-5 flex flex-wrap gap-4 text-sm">
        <span className="text-slate-700 dark:text-slate-200">
          Giá:{" "}
          <strong>
            {(course.salePrice ?? course.price).toLocaleString("vi-VN")}đ
          </strong>
        </span>
        {course.author && (
          <span className="text-slate-500 dark:text-slate-400">
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
              className="rounded-full bg-[#eaf2ff] px-2.5 py-1 text-xs font-bold text-[#0070EB] dark:bg-[#0f2742] dark:text-[#7ab8ff]"
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
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-[#111827]">
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-1 font-black text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}
