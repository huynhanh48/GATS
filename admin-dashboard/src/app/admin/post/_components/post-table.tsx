"use client";

import dayjs from "dayjs";
import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PlusCircle, Trash2 } from "lucide-react";
import type { PostListItem } from "@/lib/api/types";
import { DataTable } from "@/components/ui/data-table";
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
import { PostRowActions } from "./post-row-actions";
import { deletePosts } from "../actions";

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
    id: "author",
    accessorFn: (row) => row.author.userName,
    header: "Tác giả",
    cell: ({ getValue }) => (
      <span className="text-dark-4 dark:text-dark-6">
        {(getValue() as string) || "—"}
      </span>
    ),
  },
  {
    accessorKey: "publishedAt",
    header: "Ngày đăng",
    cell: ({ row }) => {
      const publishedAt = row.original.publishedAt ?? row.original.createdAt;
      return (
        <span className="text-dark-4 dark:text-dark-6">
          {dayjs(publishedAt).format("DD/MM/YYYY")}
        </span>
      );
    },
  },
  {
    accessorKey: "viewCount",
    header: "Lượt xem",
    cell: ({ row }) => (
      <span className="text-dark-4 dark:text-dark-6">
        {row.original.viewCount.toLocaleString("vi-VN")}
      </span>
    ),
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
    id: "actions",
    header: () => <span className="sr-only">Thao tác</span>,
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => (
      <PostRowActions
        postId={row.original.id}
        postTitle={row.original.title}
        status={row.original.status}
      />
    ),
  },
];

type PostTableProps = {
  posts: PostListItem[];
};

function getPostRowId(row: PostListItem) {
  return row.id;
}

export function PostTable({ posts }: PostTableProps) {
  const router = useRouter();
  const [selectedPosts, setSelectedPosts] = useState<PostListItem[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleBulkDelete() {
    setLoading(true);
    const result = await deletePosts(selectedPosts.map((p) => p.id));
    setLoading(false);
    setConfirmOpen(false);

    if (result.ok) {
      toast.success(result.message);
      setSelectedPosts([]);
      router.refresh();
      return;
    }

    toast.error(result.message);
  }

  return (
    <AdminPanel bodyClassName="p-4 sm:p-5">
      <DataTable
        columns={columns}
        data={posts}
        searchable
        searchColumn="title"
        searchPlaceholder="Tìm bài viết..."
        sortable
        rowSelection
        getRowId={getPostRowId}
        onRowSelectionChange={(rows) => setSelectedPosts(rows as PostListItem[])}
        emptyMessage="Chưa có bài viết nào."
        toolbar={
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => router.push("/admin/post/new")}>
              <PlusCircle className="mr-1 h-4 w-4" />
              Thêm mới
            </Button>

            {selectedPosts.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                disabled={loading}
                onClick={() => setConfirmOpen(true)}
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Xóa ({selectedPosts.length})
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
              Chuyển {selectedPosts.length} bài viết vào thùng rác? Bạn có thể
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
