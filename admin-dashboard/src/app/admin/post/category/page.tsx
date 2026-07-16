import type { Metadata } from "next";
import { fetchCategories } from "@/app/admin/category/actions";
import { CategoryManager } from "@/app/admin/category/_components/category-manager";

export const metadata: Metadata = {
  title: "Danh mục bài viết",
};

export default async function PostCategoryPage() {
  const categories = await fetchCategories("post");

  return (
    <div className="space-y-4">
      <CategoryManager
        type="post"
        categories={categories}
        title="Danh mục bài viết"
      />
    </div>
  );
}
