import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/Layouts/admin-surface";
import { CourseQuizManager } from "./_components/course-quiz-manager";

export const metadata: Metadata = {
  title: "Quản lý Quiz",
};

export default function CourseQuizPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Learning Assessment"
        title="Quản lý Quiz"
        description="Thiết lập quiz theo từng khóa học và bài học, kiểm tra cấu hình câu hỏi, đáp án và bản xem thử trước khi xuất bản."
        metrics={[
          { label: "Luồng", value: "Course -> Lesson -> Quiz", tone: "blue" },
          { label: "Kiểm tra", value: "Validation", tone: "green" },
          { label: "Chế độ", value: "Builder + Preview", tone: "orange" },
        ]}
      />
      <CourseQuizManager />
    </div>
  );
}
