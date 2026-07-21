"use client";

import { useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PlusCircle, Ban } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { AdminPanel, StatusPill } from "@/components/Layouts/admin-surface";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  issueCertificate,
  revokeCertificate,
  type AdminCertificate,
} from "../actions";

function formatDate(value: string | null) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("vi-VN", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return value;
  }
}

type Props = {
  certificates: AdminCertificate[];
};

export function CertificateManager({ certificates }: Props) {
  const router = useRouter();
  const [issueOpen, setIssueOpen] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<AdminCertificate | null>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("");
  const [courseId, setCourseId] = useState("");

  const columns = useMemo<ColumnDef<AdminCertificate>[]>(
    () => [
      {
        accessorKey: "certificateNumber",
        header: "Số hiệu",
        cell: ({ row }) => (
          <span className="font-mono text-sm font-semibold text-dark dark:text-white">
            {row.original.certificateNumber}
          </span>
        ),
      },
      {
        id: "user",
        header: "Học viên",
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-dark dark:text-white">
              {row.original.userName ?? `User #${row.original.userId}`}
            </p>
            <p className="text-body-sm text-dark-4 dark:text-dark-6">
              {row.original.userEmail ?? "—"}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "courseTitle",
        header: "Khóa học",
        cell: ({ row }) => (
          <span className="text-dark dark:text-white">
            {row.original.courseTitle ?? row.original.courseId}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Trạng thái",
        cell: ({ row }) => (
          <StatusPill tone={row.original.status === "issued" ? "green" : "red"}>
            {row.original.status === "issued" ? "Đã cấp" : "Đã thu hồi"}
          </StatusPill>
        ),
      },
      {
        accessorKey: "issuedAt",
        header: "Ngày cấp",
        cell: ({ row }) => (
          <span className="text-sm text-dark-4 dark:text-dark-6">
            {formatDate(row.original.issuedAt)}
          </span>
        ),
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Thao tác</span>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) =>
          row.original.status === "issued" ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red hover:text-red"
              onClick={() => setRevokeTarget(row.original)}
              title="Thu hồi chứng chỉ"
            >
              <Ban className="h-4 w-4" />
            </Button>
          ) : null,
      },
    ],
    [],
  );

  async function handleIssue(e: React.FormEvent) {
    e.preventDefault();
    const uid = Number(userId);
    if (!uid || !courseId.trim()) {
      toast.error("Vui lòng nhập ID học viên và ID khóa học");
      return;
    }
    setLoading(true);
    const result = await issueCertificate(uid, courseId.trim());
    setLoading(false);

    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    setIssueOpen(false);
    setUserId("");
    setCourseId("");
    router.refresh();
  }

  async function handleRevoke() {
    if (!revokeTarget) return;
    setLoading(true);
    const result = await revokeCertificate(revokeTarget.id);
    setLoading(false);
    setRevokeTarget(null);

    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    router.refresh();
  }

  return (
    <AdminPanel title="Chứng chỉ đã cấp" bodyClassName="p-4 sm:p-5">
      <DataTable
        columns={columns}
        data={certificates}
        searchable
        searchColumn="certificateNumber"
        searchPlaceholder="Tìm theo số hiệu..."
        sortable
        getRowId={(row) => row.id}
        emptyMessage="Chưa có chứng chỉ nào được cấp."
        toolbar={
          <Button size="sm" onClick={() => setIssueOpen(true)}>
            <PlusCircle className="mr-1 h-4 w-4" />
            Cấp chứng chỉ
          </Button>
        }
      />

      <Dialog open={issueOpen} onOpenChange={setIssueOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cấp chứng chỉ thủ công</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleIssue} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cert-user-id">ID học viên</Label>
              <Input
                id="cert-user-id"
                type="number"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Ví dụ: 12"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cert-course-id">ID khóa học (UUID)</Label>
              <Input
                id="cert-course-id"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                placeholder="UUID khóa học"
                required
              />
              <p className="text-xs text-dark-4 dark:text-dark-6">
                Học viên phải đang có quyền truy cập (đã đăng ký) khóa học này.
              </p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIssueOpen(false)}
                disabled={loading}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Đang cấp..." : "Cấp chứng chỉ"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={revokeTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRevokeTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Thu hồi chứng chỉ</AlertDialogTitle>
            <AlertDialogDescription>
              Thu hồi chứng chỉ{" "}
              <strong>{revokeTarget?.certificateNumber}</strong>? Chứng chỉ sẽ
              không còn xác thực được nữa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              disabled={loading}
              onClick={handleRevoke}
              className="bg-red text-white hover:bg-red/90"
            >
              Thu hồi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminPanel>
  );
}
