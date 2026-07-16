import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/Layouts/admin-surface";
import { fetchCategories } from "@/app/admin/category/actions";
import { CategoryManager } from "@/app/admin/category/_components/category-manager";

export const metadata: Metadata = {
  title: "Danh mục bài viết",
};

export default async function PostCategoryPage() {
  const categories = await fetchCategories("post");

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
            value: categories.filter((category) => category.status === "active").length,
            tone: "green",
          },
        ]}
      />
      <CategoryManager
        type="post"
        categories={categories}
        title="Danh mục bài viết"
      />
    </div>
  );
}
