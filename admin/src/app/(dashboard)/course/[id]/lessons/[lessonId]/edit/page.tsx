import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCourseDetail } from "@/app/(dashboard)/course/actions";
import { LessonFormPage } from "@/app/(dashboard)/course/_components/lesson-form-page";

export const metadata: Metadata = {
  title: "Sửa bài học",
};

type EditLessonPageProps = {
  params: Promise<{ id: string; lessonId: string }>;
};

export default async function EditLessonPage({ params }: EditLessonPageProps) {
  const { id, lessonId } = await params;
  const course = await getCourseDetail(id);

  if (!course) {
    notFound();
  }

  const section = course.sections.find((item) =>
    item.lessons.some((lesson) => lesson.id === lessonId),
  );
  const lesson = section?.lessons.find((item) => item.id === lessonId);

  if (!section || !lesson) {
    notFound();
  }

  return (
    <>
      <LessonFormPage
        mode="edit"
        courseId={course.id}
        courseTitle={course.title}
        sectionId={section.id}
        sectionTitle={section.title}
        lesson={lesson}
      />
    </>
  );
}
