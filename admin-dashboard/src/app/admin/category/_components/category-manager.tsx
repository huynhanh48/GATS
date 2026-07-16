"use client";

import { useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  CategoryStatus,
  CategoryType,
  CategoryWithCounts,
} from "@/lib/api/types";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "../actions";

const STATUS_LABELS: Record<CategoryStatus, string> = {
  active: "Đang dùng",
  inactive: "Ngưng",
};

const selectClass =
  "h-10 w-full rounded-lg border border-stroke bg-transparent px-3 text-sm text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary";

type CategoryFormState = {
  name: string;
  description: string;
  status: CategoryStatus;
  sort_order: string;
};

const emptyForm: CategoryFormState = {
  name: "",
  description: "",
  status: "active",
  sort_order: "0",
};

type CategoryManagerProps = {
  type: CategoryType;
  categories: CategoryWithCounts[];
  title: string;
};

function getCategoryRowId(row: CategoryWithCounts) {
  return row.id;
}

export function CategoryManager({
  type,
  categories,
  title,
}: CategoryManagerProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryWithCounts | null>(null);
  const [form, setForm] = useState<CategoryFormState>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<CategoryWithCounts | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  const countKey = type === "course" ? "courseCount" : "postCount";

  const columns = useMemo<ColumnDef<CategoryWithCounts>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Tên",
        cell: ({ row }) => (
          <div>
            <h5 className="font-medium text-dark dark:text-white">
              {row.original.name}
            </h5>
            <p className="mt-1 text-body-sm text-dark-4 dark:text-dark-6">
              {row.original.slug}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Trạng thái",
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <div
              className={cn(
                "max-w-fit rounded-full px-3.5 py-1 text-sm font-medium",
                {
                  "bg-[#219653]/8 text-[#219653]": status === "active",
                  "bg-[#D34053]/8 text-[#D34053]": status === "inactive",
                },
              )}
            >
              {STATUS_LABELS[status] ?? status}
            </div>
          );
        },
      },
      {
        id: "usage",
        header: type === "course" ? "Số khóa học" : "Số bài viết",
        cell: ({ row }) => (
          <span className="text-dark dark:text-white">
            {row.original[countKey]}
          </span>
        ),
      },
      {
        accessorKey: "sortOrder",
        header: "Thứ tự",
        cell: ({ row }) => (
          <span className="text-dark dark:text-white">
            {row.original.sortOrder ?? 0}
          </span>
        ),
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Thao tác</span>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => openEdit(row.original)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red hover:text-red"
              onClick={() => setDeleteTarget(row.original)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [countKey, type],
  );

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(category: CategoryWithCounts) {
    setEditing(category);
    setForm({
      name: category.name,
      description: category.description ?? "",
      status: category.status,
      sort_order: String(category.sortOrder ?? 0),
    });
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) {
      toast.error("Tên danh mục là bắt buộc");
      return;
    }

    const description = form.description.trim();
    const sortOrder = Number(form.sort_order);

    setLoading(true);

    if (editing) {
      const result = await updateCategory(editing.id, type, {
        name,
        status: form.status,
        description: description || null,
        sort_order: Number.isNaN(sortOrder) ? 0 : sortOrder,
      });
      setLoading(false);

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setDialogOpen(false);
      router.refresh();
      return;
    }

    const result = await createCategory({
      name,
      type,
      ...(description ? { description } : {}),
      sort_order: Number.isNaN(sortOrder) ? 0 : sortOrder,
    });
    setLoading(false);

    if (!result.ok) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    setDialogOpen(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setLoading(true);
    const result = await deleteCategory(deleteTarget.id, type);
    setLoading(false);
    setDeleteTarget(null);

    if (!result.ok) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    router.refresh();
  }

  return (
    <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 sm:p-7.5 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
      <DataTable
        columns={columns}
        data={categories}
        searchable
        searchColumn="name"
        searchPlaceholder={`Tìm ${title.toLowerCase()}...`}
        sortable
        getRowId={getCategoryRowId}
        emptyMessage={`Chưa có ${title.toLowerCase()} nào.`}
        toolbar={
          <Button size="sm" onClick={openCreate}>
            <PlusCircle className="mr-1 h-4 w-4" />
            Thêm danh mục
          </Button>
        }
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Sửa danh mục" : "Thêm danh mục"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Tên</Label>
              <Input
                id="cat-name"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Ví dụ: Lập trình Web"
                required
              />
              <p className="text-xs text-dark-4 dark:text-dark-6">
                Slug sẽ được hệ thống tự tạo từ tên danh mục.
              </p>
            </div>

            {editing && (
              <div className="space-y-2">
                <Label htmlFor="cat-status">Trạng thái</Label>
                <select
                  id="cat-status"
                  className={selectClass}
                  value={form.status}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      status: e.target.value as CategoryStatus,
                    }))
                  }
                >
                  <option value="active">Đang dùng</option>
                  <option value="inactive">Ngưng</option>
                </select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="cat-sort">Thứ tự</Label>
              <Input
                id="cat-sort"
                type="number"
                min={0}
                value={form.sort_order}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, sort_order: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cat-desc">Mô tả</Label>
              <Textarea
                id="cat-desc"
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Mô tả ngắn..."
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={loading}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Đang lưu..." : "Lưu"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa danh mục</AlertDialogTitle>
            <AlertDialogDescription>
              Xóa danh mục <strong>{deleteTarget?.name}</strong>? Các{" "}
              {type === "course" ? "khóa học" : "bài viết"} đang dùng danh mục
              này sẽ bỏ liên kết danh mục (không bị xóa).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              disabled={loading}
              onClick={handleDelete}
              className="bg-red text-white hover:bg-red/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
