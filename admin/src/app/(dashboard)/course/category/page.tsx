import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/Layouts/admin-surface";
import { fetchCategories } from "@/app/(dashboard)/category/actions";
import { fetchCourseTags } from "@/app/(dashboard)/course/tag-actions";
import { beFetch } from "@/lib/api/server";
import type { CourseListResponse } from "@/lib/api/types";
import { CourseCategoryManager } from "./_components/course-category-manager";
import { fetchLevels } from "./level-actions";

export const metadata: Metadata = {
  title: "Danh mục khóa học",
};

export default async function CourseCategoryPage() {
  const [categories, tags, levels, beginnerRes, intermediateRes, advancedRes] =
    await Promise.all([
      fetchCategories("course"),
      fetchCourseTags(),
      fetchLevels(),
      beFetch<CourseListResponse>("/courses?level=beginner&take=1"),
      beFetch<CourseListResponse>("/courses?level=intermediate&take=1"),
      beFetch<CourseListResponse>("/courses?level=advanced&take=1"),
    ]);

  const levelCounts: Record<string, number> = {
    beginner: beginnerRes.ok ? (beginnerRes.data?.pagination.total ?? 0) : 0,
    intermediate: intermediateRes.ok
      ? (intermediateRes.data?.pagination.total ?? 0)
      : 0,
    advanced: advancedRes.ok ? (advancedRes.data?.pagination.total ?? 0) : 0,
  };

  return (
    <div className="space-y-5">
      <AdminPageHeader
        eyebrow="Taxonomy"
        title="Danh mục khóa học"
        description="Quản lý danh mục, tags và cấp độ của các khóa học theo chuẩn hệ thống."
        metrics={[
          { label: "Tổng danh mục", value: categories.length, tone: "blue" },
          { label: "Tags", value: tags.length, tone: "orange" },
          {
            label: "Đang dùng",
            value: categories.filter((c) => c.status === "active").length,
            tone: "green",
          },
        ]}
      />
      <CourseCategoryManager
        initialCategories={categories}
        initialTags={tags}
        levelCounts={levelCounts}
        initialLevels={levels}
      />
    </div>
  );
}
