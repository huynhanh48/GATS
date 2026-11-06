import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/Layouts/admin-surface";
import { CourseFlashcardWorkspace } from "./_components/course-flashcard-workspace";

export const metadata: Metadata = {
  title: "Quản lý Flashcard",
};

export default function CourseFlashcardsPage() {
  return (
    <div className="space-y-6">
      <CourseFlashcardWorkspace />
    </div>
  );
}
