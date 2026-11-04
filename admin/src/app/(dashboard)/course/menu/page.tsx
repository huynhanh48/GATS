import { AdminPageHeader, AdminPanel } from "@/components/Layouts/admin-surface";
import { getCourseCategories, getCourseMenu, getTagCountsByCategory } from "./actions";
import { CourseMenuManager } from "./course-menu-manager";

export default async function Page() {
  const [items, tagCounts, categories] = await Promise.all([
    getCourseMenu(),
    getTagCountsByCategory(),
    getCourseCategories(),
  ]);

  return (
    <div className="space-y-5">
      <AdminPageHeader
        eyebrow="Khóa học"
        title="Menu Header"
        description="Quản lý nhóm khóa học theo danh mục và các chủ đề dùng để lọc danh sách khóa học."
      />
      <AdminPanel
        title="Cấu trúc menu"
        description="Cấp 1 là danh mục khóa học (AI cho công sở, Automation, Lập trình...). Cấp 2 là tag chủ đề công nghệ như ChatGPT, Gemini, n8n..."
      >
        <CourseMenuManager initialItems={items} tags={tagCounts} categories={categories} />
      </AdminPanel>
    </div>
  );
}
