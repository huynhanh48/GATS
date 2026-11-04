"use client";

import { useState, useTransition } from "react";
import { BookPlus, ShieldX } from "lucide-react";
import { toast } from "sonner";
import { grantCourseToUser, revokeCourseFromUser } from "./actions";

type CourseOption = { id: string; title: string; status: string };

export function GrantCourseForm({ userId, courses, activeCourseIds }: { userId: number; courses: CourseOption[]; activeCourseIds: string[] }) {
  const available = courses.filter((course) => !activeCourseIds.includes(course.id));
  const [courseId, setCourseId] = useState(available[0]?.id ?? "");
  const [pending, startTransition] = useTransition();
  const grant = () => startTransition(async () => {
    const course = available.find((item) => item.id === courseId);
    if (!course || !confirm(`Cấp khóa học “${course.title}” cho tài khoản này?`)) return;
    const result = await grantCourseToUser(userId, courseId);
    if (!result.ok) { toast.error(result.message); return; }
    toast.success(result.message);
  });
  return <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-end dark:border-slate-800"><label className="min-w-0 flex-1 space-y-1"><span className="text-sm font-semibold">Cấp khóa học</span><select className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900" value={courseId} onChange={(event) => setCourseId(event.target.value)} disabled={!available.length || pending}>{available.length ? available.map((course) => <option key={course.id} value={course.id}>{course.title} · {course.status}</option>) : <option value="">Tài khoản đã có tất cả khóa học</option>}</select></label><button type="button" disabled={!courseId || pending} onClick={grant} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 font-semibold text-white disabled:opacity-50"><BookPlus size={18}/>{pending ? "Đang cấp..." : "Cấp khóa học"}</button></div>;
}

export function RevokeCourseButton({ userId, courseId, courseTitle, disabled }: { userId: number; courseId: string; courseTitle: string; disabled: boolean }) {
  const [pending, startTransition] = useTransition();
  const revoke = () => startTransition(async () => {
    if (!confirm(`Thu hồi quyền học khóa “${courseTitle}”? Thao tác này không tự động hoàn tiền.`)) return;
    const result = await revokeCourseFromUser(userId, courseId);
    if (!result.ok) { toast.error(result.message); return; }
    toast.success(result.message);
  });
  return <button type="button" disabled={disabled || pending} onClick={revoke} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-red-200 px-3 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"><ShieldX size={16}/>{pending ? "Đang thu hồi..." : "Thu hồi"}</button>;
}
