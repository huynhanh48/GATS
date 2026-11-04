"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { permanentlyDeleteCourse, restoreCourse } from "../actions";

type CourseTrashRowActionsProps = {
  courseId: string;
  courseTitle: string;
};

export function CourseTrashRowActions({
  courseId,
  courseTitle,
}: CourseTrashRowActionsProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [confirmMode, setConfirmMode] = useState<"restore" | "hard" | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  async function handleRestore() {
    setLoading(true);
    const result = await restoreCourse(courseId);
    setLoading(false);
    setIsOpen(false);
    setConfirmMode(null);

    if (result.ok) {
      toast.success(result.message);
      router.refresh();
      return;
    }

    toast.error(result.message);
  }

  async function handleHardDelete() {
    setLoading(true);
    const result = await permanentlyDeleteCourse(courseId);
    setLoading(false);
    setIsOpen(false);
    setConfirmMode(null);

    if (result.ok) {
      toast.success(result.message);
      router.refresh();
      return;
    }

    toast.error(result.message);
  }

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger
          className={cn(
            "inline-flex size-8 items-center justify-center rounded-lg text-dark-4 transition hover:bg-gray-2 hover:text-dark dark:text-dark-6 dark:hover:bg-dark-3 dark:hover:text-white",
            loading && "pointer-events-none opacity-50",
          )}
        >
          <span className="sr-only">Thao tác</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden
          >
            <circle cx="8" cy="3" r="1.5" />
            <circle cx="8" cy="8" r="1.5" />
            <circle cx="8" cy="13" r="1.5" />
          </svg>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => setConfirmMode("restore")}
            className="text-primary focus:text-primary"
          >
            Khôi phục
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setConfirmMode("hard")}
            className="text-red-600 focus:text-red-600"
          >
            Xóa vĩnh viễn
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={confirmMode !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmMode(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmMode === "restore"
                ? "Khôi phục khóa học"
                : "Xóa vĩnh viễn"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmMode === "restore" ? (
                <>
                  Khôi phục khóa học <strong>{courseTitle}</strong> khỏi thùng
                  rác?
                </>
              ) : (
                <>
                  Xóa vĩnh viễn <strong>{courseTitle}</strong>? Hành động này
                  không thể hoàn tác và sẽ xóa toàn bộ lịch sử nhóm chat. Khóa
                  học đã phát sinh đơn hàng sẽ không được phép xóa vĩnh viễn.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmMode === "restore") {
                  handleRestore();
                } else {
                  handleHardDelete();
                }
              }}
              className={
                confirmMode === "hard"
                  ? "bg-red text-white hover:bg-red/90"
                  : undefined
              }
            >
              {confirmMode === "restore" ? "Khôi phục" : "Xóa vĩnh viễn"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
