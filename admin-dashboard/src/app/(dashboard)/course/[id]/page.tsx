import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCourseDetail } from "../actions";
import { CourseDetailHeader } from "../_components/course-detail-header";
import { CurriculumManager } from "../_components/curriculum-manager";

export const metadata: Metadata = {
  title: "Chi tiết khóa học",
};

type CourseDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CourseDetailPage({
  params,
}: CourseDetailPageProps) {
  const { id } = await params;
  const course = await getCourseDetail(id);

  if (!course) {
    notFound();
  }

  return (
    <>
      <div className="space-y-6">
        <CourseDetailHeader course={course} />
        <CurriculumManager course={course} />
      </div>
    </>
  );
}
