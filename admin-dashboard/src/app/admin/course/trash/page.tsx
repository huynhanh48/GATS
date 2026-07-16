import type { Metadata } from "next";
import { Suspense } from "react";
import { fetchTrashCourses } from "../actions";
import { CoursePagination } from "../_components/course-pagination";
import { CourseTrashTable } from "../_components/course-trash-table";

export const metadata: Metadata = {
  title: "Thùng rác khóa học",
};

type CourseTrashPageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function CourseTrashPage({
  searchParams,
}: CourseTrashPageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const { data, pagination } = await fetchTrashCourses(page, 10);

  return (
    <div className="space-y-4">
      <CourseTrashTable courses={data} />
      <Suspense fallback={null}>
        <CoursePagination pagination={pagination} basePath="/course/trash" />
      </Suspense>
    </div>
  );
}
