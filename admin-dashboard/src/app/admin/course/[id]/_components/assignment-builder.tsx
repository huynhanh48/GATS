"use client";

import { useState } from "react";
import { toast } from "sonner";
import { assignmentClient } from "@/services/assignment.client";
import type { Assignment, CreateAssignmentInput, AssignmentSubmissionType } from "@/lib/api/types";

type AssignmentBuilderProps = {
  courseId: string;
  lessonId: string;
  existingAssignment?: Assignment | null;
  onSaved?: (assignment: Assignment) => void;
};

export function AssignmentBuilder({
  courseId,
  lessonId,
  existingAssignment,
  onSaved,
}: AssignmentBuilderProps) {
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState<CreateAssignmentInput>({
    title: existingAssignment?.title ?? "",
    max_score: existingAssignment?.maxScore ?? 10,
    passing_score: existingAssignment?.passingScore ?? 5,
    max_file_size_mb: existingAssignment?.maxFileSizeMb ?? 5,
    allowed_submission_types: existingAssignment?.allowedSubmissionTypes ?? ["text", "url", "file"],
    late_submission_allowed: existingAssignment?.lateSubmissionAllowed ?? false,
    max_submissions: existingAssignment?.maxSubmissions ?? 1,
  });

  async function handleSave() {
    setSaving(true);
    let res;
    if (existingAssignment) {
      res = await assignmentClient.updateAssignment(existingAssignment.id, form);
    } else {
      res = await assignmentClient.createAssignment(courseId, lessonId, form);
    }
    setSaving(false);

    if (res.error) {
      toast.error(res.error.message);
    } else if (res.data?.data) {
      toast.success("Đã lưu cài đặt Bài tập");
      onSaved?.(res.data.data);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-dark-4 dark:text-dark-6">
        Cấu hình nộp bài tập (Assignment)
      </p>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Tiêu đề bài tập</label>
          <input
            type="text"
            className="w-full rounded border border-stroke px-3 py-2 outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2"
            value={form.title || ""}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Ví dụ: Bài tập tuần 1"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Điểm tối đa</label>
          <input
            type="number"
            className="w-full rounded border border-stroke px-3 py-2 outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2"
            value={form.max_score}
            onChange={(e) => setForm({ ...form, max_score: Number(e.target.value) })}
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
        >
          {saving ? "Đang lưu..." : "Lưu Bài tập"}
        </button>
      </div>
    </div>
  );
}
