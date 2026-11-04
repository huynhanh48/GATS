import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCourseDetail } from "@/app/(dashboard)/course/actions";
import { LessonFormPage } from "@/app/(dashboard)/course/_components/lesson-form-page";

export const metadata: Metadata = {
  title: "Thêm bài học",
};

type NewLessonPageProps = {
  params: Promise<{ id: string; sectionId: string }>;
};

export default async function NewLessonPage({ params }: NewLessonPageProps) {
  const { id, sectionId } = await params;
  const course = await getCourseDetail(id);

  if (!course) {
    notFound();
  }

  const section = course.sections.find((item) => item.id === sectionId);
  if (!section) {
    notFound();
  }

  return (
    <>
      <Breadcrumb pageName="Thêm bài học" />
      <LessonFormPage
        mode="create"
        courseId={course.id}
        courseTitle={course.title}
        sectionId={section.id}
        sectionTitle={section.title}
      />
    </>
  );
}
