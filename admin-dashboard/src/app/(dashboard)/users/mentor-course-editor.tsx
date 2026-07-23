"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { assignMentorCourse } from "./actions";

type CourseOption = {
  id: string;
  title: string;
  status: string;
};

type Props = {
  userId: number;
  courses: CourseOption[];
  managedCourses: CourseOption[];
};

export function MentorCourseEditor({ userId, courses, managedCourses }: Props) {
  const router = useRouter();
  const [courseId, setCourseId] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const save = () => {
    if (!courseId) return;
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await assignMentorCourse(userId, courseId);
      if (!result.ok) {
        setError(result.message ?? "Phân công mentor thất bại");
        return;
      }
      setMessage(result.message ?? "Đã phân công mentor");
      setCourseId("");
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="mentor-course"
          className="mb-1.5 block text-sm font-medium text-slate-900 dark:text-slate-100"
        >
          Khóa học phụ trách
        </label>
        <select
          id="mentor-course"
          value={courseId}
          disabled={pending || courses.length === 0}
          onChange={(event) => {
            setCourseId(event.target.value);
            setMessage(null);
            setError(null);
          }}
          className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#0070EB] focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
        >
          <option value="">Chọn một khóa học…</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title} · {course.status}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        disabled={pending || !courseId}
        onClick={save}
        className="min-h-11 w-full rounded-lg bg-[#0070EB] px-4 text-sm font-semibold text-white transition hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Đang phân công…" : "Gắn mentor với khóa học"}
      </button>

      <p className="text-xs leading-5 text-slate-500">
        Nếu khóa đã có mentor, người mới sẽ thay thế và quyền theo khóa của
        mentor cũ sẽ bị gỡ.
      </p>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Đang phụ trách
        </p>
        {managedCourses.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">Chưa được gắn với khóa học nào.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {managedCourses.map((course) => (
              <li
                key={course.id}
                className="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700"
              >
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {course.title}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">{course.status}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {message ? <p className="text-sm text-emerald-600" role="status">{message}</p> : null}
      {error ? <p className="text-sm text-rose-600" role="alert">{error}</p> : null}
    </div>
  );
}
