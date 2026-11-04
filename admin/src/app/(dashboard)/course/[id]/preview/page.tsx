import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { LessonType } from "@/lib/api/types";
import { resolveCourseThumbnail } from "@/lib/landing/courses";
import Image from "next/image";
import { getCourseDetail } from "../../actions";

export const metadata: Metadata = {
  title: "Xem trước như học viên",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

const LESSON_TYPE_LABELS: Record<LessonType, string> = {
  video: "Video",
  text: "Văn bản",
  quiz: "Quiz",
  assignment: "Bài tập",
};

export default async function CoursePreviewPage({ params }: PageProps) {
  const { id } = await params;
  const course = await getCourseDetail(id);
  if (!course) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-16">
      <div className="text-sm text-slate-500">
        <Link
          href={`/course/${id}`}
          className="hover:text-[#0070EB] hover:underline"
        >
          ← {course.title}
        </Link>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
        Đây là chế độ xem trước dành cho quản trị/giảng viên. Nội dung tương tác
        (video, quiz, bài tập) chỉ hiển thị đầy đủ trên trang học viên.
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#0b1220]">
        <Image
          src={resolveCourseThumbnail(course.thumbnail, 0)}
          alt={course.title}
          width={960}
          height={360}
          className="h-56 w-full bg-slate-100 object-cover dark:bg-slate-900"
          unoptimized
        />
        <div className="p-6">
          <h1 className="text-2xl font-black text-slate-950 dark:text-white">
            {course.title}
          </h1>
          {course.description ? (
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {course.description}
            </p>
          ) : null}

          {course.learningOutcomes.length > 0 ? (
            <div className="mt-4">
              <h2 className="text-sm font-bold text-slate-950 dark:text-white">
                Bạn sẽ học được gì
              </h2>
              <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                {course.learningOutcomes.map((outcome) => (
                  <li
                    key={outcome.id}
                    className="flex gap-2 text-sm text-slate-600 dark:text-slate-300"
                  >
                    <span className="text-emerald-600">✓</span>
                    {outcome.content}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>

      <div className="space-y-3">
        {course.sections.map((section) => (
          <div
            key={section.id}
            className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800"
          >
            <div className="bg-slate-50 px-4 py-3 dark:bg-slate-900/50">
              <h3 className="font-bold text-slate-950 dark:text-white">
                {section.title}
              </h3>
              <p className="text-xs text-slate-500">
                {section.lessonCount} bài học ·{" "}
                {Math.floor(section.totalDurationSeconds / 60)} phút
              </p>
            </div>
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {section.lessons.map((lesson) => (
                <li key={lesson.id} className="px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {lesson.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        {LESSON_TYPE_LABELS[lesson.type]}
                        {lesson.isPreview ? " · Preview" : ""}
                        {lesson.locked ? " · Đã khóa" : ""}
                      </p>
                    </div>
                  </div>
                  {lesson.type === "text" && lesson.content ? (
                    <div
                      className="prose prose-sm mt-2 max-w-none text-slate-700 dark:text-slate-300"
                      dangerouslySetInnerHTML={{ __html: lesson.content }}
                    />
                  ) : lesson.type !== "text" ? (
                    <p className="mt-1 text-xs text-slate-400">
                      Nội dung {LESSON_TYPE_LABELS[lesson.type].toLowerCase()}{" "}
                      hiển thị đầy đủ trên trang học viên.
                    </p>
                  ) : null}
                </li>
              ))}
              {section.lessons.length === 0 ? (
                <li className="px-4 py-3 text-sm text-slate-500">
                  Chưa có bài học.
                </li>
              ) : null}
            </ul>
          </div>
        ))}
        {course.sections.length === 0 ? (
          <p className="text-sm text-slate-500">
            Khóa học chưa có chương trình học.
          </p>
        ) : null}
      </div>
    </div>
  );
}
