"use client";

import { useEffect, useState } from "react";

import { TedCourseCard } from "@/components/ted/course-card";
import { SectionHeader } from "@/components/ted/section-header";
import { ContentState } from "@/components/ui/content-state";
import { Skeleton } from "@/components/ui/skeleton";
import { PathApi } from "@/constants/PathApi";
import apiClient from "@/lib/apiClient";
import type { Course } from "@/types/course";

export function FeaturedCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    apiClient
      .get(PathApi.courses.list, {
        params: { take: "3", skip: "0", status: "published" },
      })
      .then((response) => {
        if (!active) return;
        const payload = response as unknown as { data?: Course[] };
        setCourses(payload.data ?? []);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="w-full border-y border-divider bg-card py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="Nổi bật"
          title="Chương trình đào tạo AI"
          description="Từ nền tảng đến ứng dụng thực chiến, mỗi khóa học tập trung vào kết quả có thể áp dụng ngay."
          href="/courses"
        />
        <div className="mt-10">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }, (_, index) => (
                <Skeleton key={index} className="aspect-[4/5] rounded-2xl" />
              ))}
            </div>
          ) : error ? (
            <ContentState
              tone="error"
              title="Chưa thể tải khóa học"
              description="Danh sách khóa học đang tạm thời không khả dụng."
            />
          ) : courses.length === 0 ? (
            <ContentState
              title="Khóa học đang được cập nhật"
              description="Vui lòng quay lại sau để xem các chương trình mới."
            />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <TedCourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
