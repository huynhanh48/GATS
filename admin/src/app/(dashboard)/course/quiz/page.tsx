import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/Layouts/admin-surface";
import { CourseQuizManager } from "./_components/course-quiz-manager";

export const metadata: Metadata = {
  title: "Quản lý Quiz",
};

export default function CourseQuizPage() {
  return (
    <div className="space-y-6">
      <CourseQuizManager />
    </div>
  );
}
