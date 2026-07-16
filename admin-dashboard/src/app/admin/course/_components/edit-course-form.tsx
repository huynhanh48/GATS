"use client";

import type { CourseDetail } from "@/lib/api/types";
import { useRouter } from "next/navigation";
import { CourseForm } from "./course-form";

type EditCourseFormProps = {
  course: CourseDetail;
};

export function EditCourseForm({ course }: EditCourseFormProps) {
  const router = useRouter();

  return (
    <CourseForm
      mode="edit"
      course={course}
      onSuccess={() => router.push(`/admin/course/${course.id}`)}
    />
  );
}
