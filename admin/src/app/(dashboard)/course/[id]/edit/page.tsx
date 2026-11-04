import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCourseDetail } from "../../actions";
import { EditCourseForm } from "../../_components/edit-course-form";

export const metadata: Metadata = {
  title: "Sửa khóa học",
};

type EditCoursePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  const { id } = await params;
  const course = await getCourseDetail(id);

  if (!course) {
    notFound();
  }

  return (
    <>
      <Breadcrumb pageName="Sửa khóa học" />
      <div className="mx-auto w-full">
        <EditCourseForm course={course} />
      </div>
    </>
  );
}
