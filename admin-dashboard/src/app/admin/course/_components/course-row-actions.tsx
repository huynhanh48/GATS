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
import { deleteCourse, publishCourse } from "../actions";

type CourseRowActionsProps = {
  courseId: string;
  courseTitle: string;
  status: string;
};

export function CourseRowActions({
  courseId,
  courseTitle,
  status,
}: CourseRowActionsProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    const result = await deleteCourse(courseId);
    setLoading(false);
    setIsOpen(false);

    if (result.ok) {
      toast.success(result.message);
      router.refresh();
      return;
    }

    toast.error(result.message);
  }

  async function handlePublish() {
    setLoading(true);
    const result = await publishCourse(courseId);
    setLoading(false);
    setIsOpen(false);

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
          <DropdownMenuItem onClick={() => router.push(`/admin/course/${courseId}`)}>
            Xem
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => router.push(`/admin/course/${courseId}/edit`)}>
            Sửa
          </DropdownMenuItem>

          {status !== "published" && (
            <DropdownMenuItem onClick={handlePublish} className="text-primary focus:text-primary">
              Xuất bản
            </DropdownMenuItem>
          )}

          <DropdownMenuItem onClick={() => setIsAlertOpen(true)} className="text-red-600 focus:text-red-600">
            Xóa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete confirm */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Chuyển vào thùng rác</AlertDialogTitle>
            <AlertDialogDescription>
              Chuyển khóa học <strong>{courseTitle}</strong> vào thùng rác? Bạn
              có thể khôi phục lại từ mục Thùng rác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setIsAlertOpen(false);
                handleDelete();
              }}
              className="bg-red text-white hover:bg-red/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
