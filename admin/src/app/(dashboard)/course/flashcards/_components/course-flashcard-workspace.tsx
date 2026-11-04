"use client";

import { useEffect, useState } from "react";
import { BookOpen, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { AdminPanel } from "@/components/Layouts/admin-surface";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import type { CoursePublic } from "@/lib/api/types";
import { coursesClient } from "@/services/courses.client";
import { CourseFlashcardManager } from "../../[id]/flashcards/_components/course-flashcard-manager";

export function CourseFlashcardWorkspace() {
  const [courses, setCourses] = useState<CoursePublic[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CoursePublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    async function loadCourses() {
      try {
        setLoading(true);
        const result = await coursesClient.list({ take: 100 });
        if (result.data) {
          setCourses(result.data.data);
        } else {
          toast.error(result.error?.message ?? "Không tải được danh sách khóa học");
        }
      } catch {
        toast.error("Lỗi khi tải danh sách khóa học");
      } finally {
        setLoading(false);
      }
    }

    void loadCourses();
  }, []);

  return (
    <div className="space-y-4">
      <AdminPanel
        title="Chọn phạm vi quản lý"
        description="Chọn khóa học trước khi tạo bộ thẻ, chỉnh nội dung hoặc sinh flashcard bằng Viava AI."
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Khóa học
            </label>
            <Combobox
              items={courses}
              value={selectedCourse}
              onValueChange={(value) =>
                setSelectedCourse(value as CoursePublic | null)
              }
              itemToStringLabel={(course: CoursePublic) => course.title}
              isItemEqualToValue={(a: CoursePublic, b: CoursePublic) =>
                a.id === b.id
              }
              disabled={loading}
            >
              <ComboboxInput
                placeholder={loading ? "Đang tải..." : "Tìm khóa học..."}
              />
              <ComboboxContent>
                <ComboboxEmpty>Không tìm thấy khóa học nào.</ComboboxEmpty>
                <ComboboxList>
                  {(course: CoursePublic) => (
                    <ComboboxItem key={course.id} value={course}>
                      {course.title}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>

          <Button
            type="button"
            variant="outline"
            className="h-10"
            disabled={!selectedCourse || loading}
            onClick={() => setReloadKey((key) => key + 1)}
          >
            <RefreshCw className="size-4" />
            Làm mới
          </Button>
        </div>
      </AdminPanel>

      {loading ? (
        <AdminPanel title="Không gian Flashcard">
          <div className="flex min-h-56 items-center justify-center gap-2 text-sm text-slate-500">
            <Loader2 className="size-4 animate-spin text-blue-600" />
            Đang tải danh sách khóa học...
          </div>
        </AdminPanel>
      ) : !selectedCourse ? (
        <AdminPanel title="Không gian Flashcard">
          <div className="flex min-h-56 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 px-6 text-center dark:border-slate-700">
            <BookOpen className="mb-3 size-8 text-slate-400" />
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Chưa chọn khóa học
            </h3>
            <p className="mt-1 max-w-xl text-sm text-slate-500 dark:text-slate-400">
              Chọn một khóa học ở phía trên để xem các bộ thẻ và bắt đầu biên
              soạn flashcard.
            </p>
          </div>
        </AdminPanel>
      ) : (
        <CourseFlashcardManager
          key={`${selectedCourse.id}-${reloadKey}`}
          courseId={selectedCourse.id}
        />
      )}
    </div>
  );
}
