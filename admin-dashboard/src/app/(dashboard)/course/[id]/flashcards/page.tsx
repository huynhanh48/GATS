import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/Layouts/admin-surface";
import { getCourseDetail } from "../../actions";
import { CourseFlashcardManager } from "./_components/course-flashcard-manager";

export const metadata: Metadata = {
  title: "Flashcard khóa học",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CourseFlashcardsPage({ params }: PageProps) {
  const { id } = await params;
  const course = await getCourseDetail(id);
  if (!course) notFound();

  return (
    <div className="space-y-4">
      <div className="text-sm text-slate-500">
        <Link
          href={`/course/${id}`}
          className="hover:text-[#0070EB] hover:underline"
        >
          ← {course.title}
        </Link>
      </div>

      <AdminPageHeader
        eyebrow="Flashcard"
        title={course.title}
        description="Quản lý bộ thẻ, thẻ học, import CSV và xuất bản cho học viên mobile."
      />

      <CourseFlashcardManager courseId={id} />
    </div>
  );
}
