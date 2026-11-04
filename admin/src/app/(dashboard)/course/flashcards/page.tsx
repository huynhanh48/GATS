import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/Layouts/admin-surface";
import { CourseFlashcardWorkspace } from "./_components/course-flashcard-workspace";

export const metadata: Metadata = {
  title: "Quản lý Flashcard",
};

export default function CourseFlashcardsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Learning Practice"
        title="Quản lý Flashcard"
        description="Thiết lập bộ thẻ theo từng khóa học, biên soạn thủ công hoặc dùng Viava AI để sinh flashcard từ nội dung bài học."
        metrics={[
          { label: "Luồng", value: "Course -> Deck -> Card", tone: "blue" },
          { label: "AI", value: "Viava Flashcard", tone: "green" },
          { label: "Chế độ", value: "Builder + Preview", tone: "orange" },
        ]}
      />
      <CourseFlashcardWorkspace />
    </div>
  );
}
