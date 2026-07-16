import type { Metadata } from "next";
import { fetchCategories } from "@/app/admin/category/actions";
import { CategoryManager } from "@/app/admin/category/_components/category-manager";

export const metadata: Metadata = {
  title: "Danh mục khóa học",
};

export default async function CourseCategoryPage() {
  const categories = await fetchCategories("course");

  return (
    <div className="space-y-4">
      <CategoryManager
        type="course"
        categories={categories}
        title="Danh mục khóa học"
      />
    </div>
  );
}
