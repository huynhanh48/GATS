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
      <AdminPageHeader
        eyebrow="Taxonomy"
        title="Danh mục bài viết"
        description="Quản lý nhóm bài viết để lọc, tìm kiếm và xuất bản nội dung nhất quán hơn."
        metrics={[
          { label: "Tổng danh mục", value: categories.length, tone: "blue" },
          {
            label: "Đang dùng",
            value: categories.filter((category) => category.status === "active")
              .length,
            tone: "green",
          },
          { label: "Tag bài viết", value: tags.length, tone: "orange" },
        ]}
      />
      <CourseCategoryManager
        initialCategories={categories}
        initialTags={tags}
        entityType="post"
        showLevels={false}
      />
    </div>
  );
}
