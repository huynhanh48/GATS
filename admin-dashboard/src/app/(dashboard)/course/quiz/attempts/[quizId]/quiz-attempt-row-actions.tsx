"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { resetQuizAttempts } from "../../../actions";

type QuizAttemptRowActionsProps = {
  quizId: string;
  userId: number;
  userLabel: string;
};

export function QuizAttemptRowActions({
  quizId,
  userId,
  userLabel,
}: QuizAttemptRowActionsProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    setLoading(true);
    const result = await resetQuizAttempts(quizId, userId);
    setLoading(false);
    setOpen(false);

    if (result.ok) {
      toast.success(result.message);
      router.refresh();
      return;
    }

    toast.error(result.message);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-medium text-rose-600 hover:underline"
      >
        Reset
      </button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset lượt làm bài</AlertDialogTitle>
            <AlertDialogDescription>
              Xóa toàn bộ lượt làm bài của <strong>{userLabel}</strong> cho
              quiz này và cho phép làm lại từ đầu. Hành động này không thể
              hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              disabled={loading}
              onClick={(e) => {
                e.preventDefault();
                handleReset();
              }}
              className="bg-red text-white hover:bg-red/90"
            >
              {loading ? "Đang xử lý..." : "Reset"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
