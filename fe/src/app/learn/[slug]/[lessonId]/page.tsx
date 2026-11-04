"use client";

import { useParams } from "next/navigation";
import { LearnCourseWorkspace } from "@/components/learning/LearnCourseWorkspace";
import "@/components/edubost/edubost-learning.css";

export default function LearnLessonPage() {
  const params = useParams();
  const slug = String(params.slug ?? "");
  const lessonId = String(params.lessonId ?? "");

  return <div className="eb-learning"><LearnCourseWorkspace slug={slug} lessonId={lessonId || null} /></div>;
}
