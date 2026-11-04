"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { CommentStatus } from "./actions";
import { updateCommentStatus } from "./actions";

type Props = {
  commentId: string;
  status: CommentStatus;
};

export function CommentStatusActions({ commentId, status }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = (next: CommentStatus) => {
    setError(null);
    startTransition(async () => {
      const result = await updateCommentStatus(commentId, next);
      if (!result.ok) {
        setError(result.message ?? "Thất bại");
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-1.5">
        {status !== "visible" ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => run("visible")}
            className="rounded-md border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-60 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
          >
            Hiện lại
          </button>
        ) : null}
        {status !== "hidden" ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => run("hidden")}
            className="rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100 disabled:opacity-60 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
          >
            Ẩn
          </button>
        ) : null}
        {status !== "deleted" ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => run("deleted")}
            className="rounded-md border border-rose-300 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100 disabled:opacity-60 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
          >
            Xóa
          </button>
        ) : null}
      </div>
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
