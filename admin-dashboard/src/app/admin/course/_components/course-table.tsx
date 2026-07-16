"use client";

import Link from "next/link";
import dayjs from "dayjs";
import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PlusCircle, Trash2 } from "lucide-react";
import type { CoursePublic } from "@/lib/api/types";
import { DataTable } from "@/components/ui/data-table";
import { CourseRowActions } from "./course-row-actions";
import { Button } from "@/components/ui/button";
import { AdminPanel, StatusPill } from "@/components/Layouts/admin-surface";
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
import { deleteCourses } from "../actions";

const STATUS_LABELS: Record<string, string> = {
  draft: "Nháp",
  published: "Đã xuất bản",
  archived: "Lưu trữ",
};

function formatPrice(price: number, salePrice: number | null) {
  if (salePrice !== null && salePrice < price) {
    return `${salePrice.toLocaleString("vi-VN")}đ`;
  }
  return `${price.toLocaleString("vi-VN")}đ`;
}

const columns: ColumnDef<CoursePublic>[] = [
  {
    accessorKey: "title",
    header: "Tiêu đề",
    cell: ({ row }) => {
      const course = row.original;
      return (
        <div>
          <Link href={`/admin/course/${course.id}`}>
            <h5 className="font-medium text-dark hover:text-primary dark:text-white dark:hover:text-primary">
              {course.title}
            </h5>
          </Link>
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
        <StatusPill
          tone={
            status === "published"
              ? "green"
              : status === "draft"
                ? "orange"
                : "red"
          }
        >
          {STATUS_LABELS[status] ?? status}
        </StatusPill>
      );
    },
  },
  {
    accessorKey: "price",
    header: "Giá",
    cell: ({ row }) => {
      const course = row.original;
      return (
        <span className="text-dark dark:text-white">
          {formatPrice(course.price, course.salePrice)}
        </span>
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
    accessorKey: "createdAt",
    header: "Ngày tạo",
    cell: ({ row }) => (
      <span className="text-dark dark:text-white">
        {dayjs(row.getValue<string>("createdAt")).format("DD/MM/YYYY")}
      </span>
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Thao tác</span>,
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      const course = row.original;
      return (
        <CourseRowActions
          courseId={course.id}
          status={course.status}
          courseTitle={course.title}
        />
      );
    },
  },
];

type CourseTableProps = {
  courses: CoursePublic[];
};

function getCourseRowId(row: CoursePublic) {
  return row.id;
}

export function CourseTable({ courses }: CourseTableProps) {
  const router = useRouter();
  const [selectedCourses, setSelectedCourses] = useState<CoursePublic[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleBulkDelete() {
    setLoading(true);
    const result = await deleteCourses(selectedCourses.map((c) => c.id));
    setLoading(false);
    setConfirmOpen(false);

    if (result.ok) {
      toast.success(result.message);
      setSelectedCourses([]);
      router.refresh();
      return;
    }

    toast.error(result.message);
  }

  return (
    <AdminPanel bodyClassName="p-4 sm:p-5">
      <DataTable
        columns={columns}
        data={courses}
        searchable
        searchColumn="title"
        searchPlaceholder="Tìm khóa học..."
        sortable
        rowSelection
        getRowId={getCourseRowId}
        onRowSelectionChange={(rows) =>
          setSelectedCourses(rows as CoursePublic[])
        }
        emptyMessage="Chưa có khóa học nào. Hãy thêm khóa học mới."
        toolbar={
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => router.push("/admin/course/new")}>
              <PlusCircle className="mr-1 h-4 w-4" />
              Thêm mới
            </Button>

            {selectedCourses.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                disabled={loading}
                onClick={() => setConfirmOpen(true)}
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Xóa ({selectedCourses.length})
              </Button>
            )}
          </div>
        }
      />

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Chuyển vào thùng rác</AlertDialogTitle>
            <AlertDialogDescription>
              Chuyển {selectedCourses.length} khóa học vào thùng rác? Bạn có thể
              khôi phục lại sau.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              disabled={loading}
              onClick={handleBulkDelete}
              className="bg-red text-white hover:bg-red/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminPanel>
  );
}
