"use client";

import { useParams } from "next/navigation";
import { LearnCourseWorkspace } from "@/components/learning/LearnCourseWorkspace";

export default function LearnLessonPage() {
  const params = useParams();
  const slug = String(params.slug ?? "");
  const lessonId = String(params.lessonId ?? "");

  return (
    <LearnCourseWorkspace slug={slug} lessonId={lessonId || null} />
  );
}
