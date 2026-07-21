import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchPublishReadiness, getCourseDetail } from "../actions";
import { CourseDetailHeader } from "../_components/course-detail-header";
import { CurriculumManager } from "../_components/curriculum-manager";
import { PublishReadinessPanel } from "../_components/publish-readiness-panel";

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

  const readiness = await fetchPublishReadiness(id);

  return (
    <>
      <div className="space-y-6">
        <CourseDetailHeader course={course} />
        <PublishReadinessPanel
          courseId={course.id}
          status={course.status}
          readiness={readiness}
        />
        <CurriculumManager course={course} />
      </div>
    </>
  );
}
