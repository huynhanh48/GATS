"use client";

import { AdminPanel } from "@/components/Layouts/admin-surface";
import { cn } from "@/lib/utils";
import type { PublishReadiness } from "@/lib/api/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { publishCourse } from "../actions";

type PublishReadinessPanelProps = {
  courseId: string;
  status: string;
  readiness: PublishReadiness | null;
};

export function PublishReadinessPanel({
  courseId,
  status,
  readiness,
}: PublishReadinessPanelProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (status === "published" || !readiness) return null;

  async function handlePublish() {
    setLoading(true);
    const result = await publishCourse(courseId);
    setLoading(false);

    if (result.ok) {
      toast.success(result.message);
      router.refresh();
      return;
    }

    toast.error(result.message);
  }

  return (
    <AdminPanel
      title="Checklist trước khi xuất bản"
      description="Hoàn thành tất cả các mục dưới đây để xuất bản khóa học."
      actions={
        <button
          type="button"
          disabled={!readiness.ready || loading}
          onClick={handlePublish}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Đang xuất bản..." : "Xuất bản khóa học"}
        </button>
      }
    >
      <ul className="space-y-2">
        {readiness.checks.map((check) => (
          <li key={check.id} className="flex items-start gap-2 text-sm">
            <span
              className={cn(
                "mt-0.5 shrink-0 text-base",
                check.passed ? "text-emerald-600" : "text-amber-500",
              )}
            >
              {check.passed ? "✓" : "✗"}
            </span>
            <div>
              <span
                className={cn(
                  check.passed
                    ? "text-slate-700 dark:text-slate-200"
                    : "font-medium text-amber-700 dark:text-amber-400",
                )}
              >
                {check.label}
              </span>
              {check.detail ? (
                <p className="text-xs text-slate-500">{check.detail}</p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </AdminPanel>
  );
}
