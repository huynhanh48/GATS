"use client";

import { useRouter } from "next/navigation";
import { CourseForm } from "./course-form";

export function NewCourseForm() {
  const router = useRouter();

  return (
    <CourseForm mode="create" onSuccess={() => router.push("/admin/course")} />
  );
}
