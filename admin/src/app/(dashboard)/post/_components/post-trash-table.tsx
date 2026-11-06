"use client";

import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RotateCcw, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PostListItem } from "@/lib/api/types";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { formatVnDate, formatVnDateTime } from "@/lib/datetime";
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
import { PostTrashRowActions } from "./post-trash-row-actions";
import { permanentlyDeletePosts, restorePosts } from "../actions";

const STATUS_LABELS: Record<string, string> = {
  draft: "Bản nháp",
  published: "Đã xuất bản",
  archived: "Lưu trữ",
};

const columns: ColumnDef<PostListItem>[] = [
  {
    accessorKey: "title",
    header: "Tiêu đề",
    cell: ({ row }) => {
      const post = row.original;
      return (
        <div>
          <h5 className="font-medium text-dark dark:text-white">{post.title}</h5>
          <p className="mt-1 text-body-sm text-dark-4 dark:text-dark-6">
            {post.slug}
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
    id: "author",
    accessorFn: (row) => row.author.userName,
    header: "Tác giả",
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
          {formatVnDateTime(deletedAt)}
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
      <PostTrashRowActions
        postId={row.original.id}
        postTitle={row.original.title}
      />
    ),
  },
];

type PostTrashTableProps = {
  posts: PostListItem[];
};

function getPostRowId(row: PostListItem) {
  return row.id;
}

export function PostTrashTable({ posts }: PostTrashTableProps) {
  const router = useRouter();
  const [selectedPosts, setSelectedPosts] = useState<PostListItem[]>([]);
  const [confirmMode, setConfirmMode] = useState<"restore" | "hard" | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  async function handleBulkRestore() {
    setLoading(true);
    const result = await restorePosts(selectedPosts.map((p) => p.id));
    setLoading(false);
    setConfirmMode(null);

    if (result.ok) {
      toast.success(result.message);
      setSelectedPosts([]);
      router.refresh();
      return;
    }

    toast.error(result.message);
  }

  async function handleBulkHardDelete() {
    setLoading(true);
    const result = await permanentlyDeletePosts(selectedPosts.map((p) => p.id));
    setLoading(false);
    setConfirmMode(null);

    if (result.ok) {
      toast.success(result.message);
      setSelectedPosts([]);
      router.refresh();
      return;
    }

    toast.error(result.message);
  }

  return (
    <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 sm:p-7.5 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
      <DataTable
        columns={columns}
        data={posts}
        searchable
        searchColumn="title"
        searchPlaceholder="Tìm trong thùng rác..."
        sortable
        rowSelection
        getRowId={getPostRowId}
        onRowSelectionChange={(rows) => setSelectedPosts(rows as PostListItem[])}
        emptyMessage="Thùng rác trống — chưa có bài viết nào bị xóa."
        toolbar={
          selectedPosts.length > 0 ? (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={loading}
                onClick={() => setConfirmMode("restore")}
              >
                <RotateCcw className="mr-1 h-4 w-4" />
                Khôi phục ({selectedPosts.length})
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={loading}
                onClick={() => setConfirmMode("hard")}
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Xóa vĩnh viễn ({selectedPosts.length})
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
                ? "Khôi phục bài viết đã chọn"
                : "Xóa vĩnh viễn bài viết đã chọn"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmMode === "restore"
                ? `Khôi phục ${selectedPosts.length} bài viết khỏi thùng rác?`
                : `Xóa vĩnh viễn ${selectedPosts.length} bài viết? Hành động này không thể hoàn tác.`}
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
