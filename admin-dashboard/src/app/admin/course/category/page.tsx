import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/Layouts/admin-surface";
import { fetchCategories } from "@/app/admin/category/actions";
import { CategoryManager } from "@/app/admin/category/_components/category-manager";

export const metadata: Metadata = {
  title: "Danh mục khóa học",
};

export default async function CourseCategoryPage() {
  const categories = await fetchCategories("course");

  return (
    <div className="space-y-4">
      <AdminPageHeader
        eyebrow="Taxonomy"
        title="Danh mục khóa học"
        description="Sắp xếp nhóm nội dung học tập và kiểm soát trạng thái hiển thị của từng danh mục."
        metrics={[
          { label: "Tổng danh mục", value: categories.length, tone: "blue" },
          {
            label: "Đang dùng",
            value: categories.filter((category) => category.status === "active").length,
            tone: "green",
          },
        ]}
      />
      <CategoryManager
        type="course"
        categories={categories}
        title="Danh mục khóa học"
      />
    </div>
  );
}
