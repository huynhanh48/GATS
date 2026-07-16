import type { Metadata } from "next";
import { Suspense } from "react";
import { fetchCourses } from "./actions";
import { CoursePagination } from "./_components/course-pagination";
import { CourseTable } from "./_components/course-table";

export const metadata: Metadata = {
  title: "Khóa học",
};

type CoursePageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function CoursePage({ searchParams }: CoursePageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const { data, pagination } = await fetchCourses(page, 10);

  return (
    <div className="space-y-4">

      <CourseTable courses={data} />
      <Suspense fallback={null}>
        <CoursePagination pagination={pagination} />
      </Suspense>
    </div>
  );
}
