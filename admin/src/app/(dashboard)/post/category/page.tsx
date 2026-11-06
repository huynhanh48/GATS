import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/Layouts/admin-surface";
import { fetchCategories } from "@/app/(dashboard)/category/actions";
import { CourseCategoryManager } from "@/app/(dashboard)/course/category/_components/course-category-manager";
import { fetchTags } from "@/components/tags/tag-actions";

export const metadata: Metadata = {
  title: "Danh mục bài viết",
};

export default async function PostCategoryPage() {
  const [categories, tags] = await Promise.all([
    fetchCategories("post"),
    fetchTags("post"),
  ]);

  return (
    <div className="space-y-4">
      <CourseCategoryManager
        initialCategories={categories}
        initialTags={tags}
        entityType="post"
        showLevels={false}
      />
    </div>
  );
}
