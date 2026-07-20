"use client";

import dayjs from "dayjs";
import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RotateCcw, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CoursePublic } from "@/lib/api/types";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
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
import { CourseTrashRowActions } from "./course-trash-row-actions";
import {
  permanentlyDeleteCourses,
  restoreCourses,
} from "../actions";

const STATUS_LABELS: Record<string, string> = {
  draft: "Nháp",
  published: "Đã xuất bản",
  archived: "Lưu trữ",
};

const columns: ColumnDef<CoursePublic>[] = [
  {
    accessorKey: "title",
    header: "Tiêu đề",
    cell: ({ row }) => {
      const course = row.original;
      return (
        <div>
          <h5 className="font-medium text-dark dark:text-white">
            {course.title}
          </h5>
          <p className="mt-1 text-body-sm text-dark-4 dark:text-dark-6">
            {course.slug}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      const status = row.getValue<string>("status");
      return (
        <div
          className={cn(
            "max-w-fit rounded-full px-3.5 py-1 text-sm font-medium",
            {
              "bg-[#219653]/8 text-[#219653]": status === "published",
              "bg-[#FFA70B]/8 text-[#FFA70B]": status === "draft",
              "bg-[#D34053]/8 text-[#D34053]": status === "archived",
            },
          )}
        >
          {STATUS_LABELS[status] ?? status}
        </div>
      );
    },
  },
  {
    id: "category",
    accessorFn: (row) => row.category?.name ?? "",
    header: "Danh mục",
    cell: ({ getValue }) => (
      <span className="text-dark dark:text-white">
        {(getValue() as string) || "—"}
      </span>
    ),
  },
  {
    accessorKey: "deletedAt",
    header: "Ngày xóa",
    cell: ({ row }) => {
      const deletedAt = row.original.deletedAt;
      return (
        <span className="text-dark dark:text-white">
          {deletedAt ? dayjs(deletedAt).format("DD/MM/YYYY HH:mm") : "—"}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Thao tác</span>,
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => (
      <CourseTrashRowActions
        courseId={row.original.id}
        courseTitle={row.original.title}
      />
    ),
  },
];

type CourseTrashTableProps = {
  courses: CoursePublic[];
};

function getCourseRowId(row: CoursePublic) {
  return row.id;
}

export function CourseTrashTable({ courses }: CourseTrashTableProps) {
  const router = useRouter();
  const [selectedCourses, setSelectedCourses] = useState<CoursePublic[]>([]);
  const [confirmMode, setConfirmMode] = useState<"restore" | "hard" | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  async function handleBulkRestore() {
    setLoading(true);
    const result = await restoreCourses(selectedCourses.map((c) => c.id));
    setLoading(false);
    setConfirmMode(null);

    if (result.ok) {
      toast.success(result.message);
      setSelectedCourses([]);
      router.refresh();
      return;
    }

    toast.error(result.message);
  }

  async function handleBulkHardDelete() {
    setLoading(true);
    const result = await permanentlyDeleteCourses(
      selectedCourses.map((c) => c.id),
    );
    setLoading(false);
    setConfirmMode(null);

    if (result.ok) {
      toast.success(result.message);
      setSelectedCourses([]);
      router.refresh();
      return;
    }

    toast.error(result.message);
  }

  return (
    <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 sm:p-7.5 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
      <DataTable
        columns={columns}
        data={courses}
        searchable
        searchColumn="title"
        searchPlaceholder="Tìm trong thùng rác..."
        sortable
        rowSelection
        getRowId={getCourseRowId}
        onRowSelectionChange={(rows) =>
          setSelectedCourses(rows as CoursePublic[])
        }
        emptyMessage="Thùng rác trống — chưa có khóa học nào bị xóa."
        toolbar={
          selectedCourses.length > 0 ? (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={loading}
                onClick={() => setConfirmMode("restore")}
              >
                <RotateCcw className="mr-1 h-4 w-4" />
                Khôi phục ({selectedCourses.length})
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={loading}
                onClick={() => setConfirmMode("hard")}
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Xóa vĩnh viễn ({selectedCourses.length})
              </Button>
            </div>
          ) : undefined
        }
      />

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
                ? "Khôi phục khóa học đã chọn"
                : "Xóa vĩnh viễn khóa học đã chọn"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmMode === "restore"
                ? `Khôi phục ${selectedCourses.length} khóa học khỏi thùng rác?`
                : `Xóa vĩnh viễn ${selectedCourses.length} khóa học? Hành động này không thể hoàn tác.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              disabled={loading}
              onClick={() => {
                if (confirmMode === "restore") {
                  handleBulkRestore();
                } else {
                  handleBulkHardDelete();
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
    </div>
  );
}
