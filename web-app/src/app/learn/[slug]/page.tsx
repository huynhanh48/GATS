"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { fetchCourseBySlug, fetchMyEnrollments } from "@/services/learning.service";

/**
 * `/learn/[slug]` — resolve bài đầu tiên rồi redirect.
 * Player chỉ mount ở `/learn/[slug]/[lessonId]` (tránh remount hủy HLS).
 */
export default function LearnSlugRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const slug = String(params.slug ?? "");
  const { status } = useAuth();

  useEffect(() => {
    if (status === "loading" || !slug) return;
    if (status === "anonymous") {
      router.replace(`/login?next=${encodeURIComponent(`/learn/${slug}`)}`);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const [course, enrollments] = await Promise.all([
          fetchCourseBySlug(slug),
          fetchMyEnrollments().catch(() => []),
        ]);
        if (cancelled) return;

        if (!course?.id) {
          router.replace("/learning");
          return;
        }

        const enrolled = enrollments.some(
          (e) =>
            e.courseId === course.id &&
            (e.status === "active" || e.status === "completed" || !e.status),
        );
        if (!enrolled) {
          router.replace(`/courses/${slug}`);
          return;
        }

        const flat: { id: string; locked?: boolean }[] = [];
        for (const s of course.sections ?? []) {
          for (const l of s.lessons ?? []) {
            if (l?.id) flat.push({ id: l.id, locked: l.locked });
          }
        }

        const preferred =
          flat.find((l) => !l.locked)?.id || flat[0]?.id || null;

        if (!preferred) {
          router.replace("/learning");
          return;
        }

        router.replace(`/learn/${slug}/${preferred}`);
      } catch {
        if (!cancelled) router.replace("/learning");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [status, slug, router]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center text-muted-foreground gap-2">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span className="text-sm">Đang mở bài học…</span>
    </div>
  );
}
