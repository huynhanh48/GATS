import type { Metadata } from "next";
import { Suspense } from "react";
import { fetchCourses } from "./actions";
import { CoursePagination } from "./_components/course-pagination";
import { CourseCatalog } from "./_components/course-catalog";
import { filterAndSortLandingMockCourses } from "@/lib/landing/courses";

export const metadata: Metadata = {
  title: "Khóa học",
};

type CoursePageProps = {
  searchParams: Promise<{ page?: string; all?: string }>;
};

export default async function CoursePage({ searchParams }: CoursePageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const showAll = params.all === "1";
  const { data, pagination } = await fetchCourses(page, showAll ? 24 : 50);

  const courses = showAll
    ? data
    : filterAndSortLandingMockCourses(data);

  return (
    <div className="space-y-4">
      <CourseCatalog courses={courses} showAll={showAll} mockCount={courses.length} />
      {showAll ? (
        <Suspense fallback={null}>
          <CoursePagination pagination={pagination} />
        </Suspense>
      ) : null}
    </div>
  );
}
