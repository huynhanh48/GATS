"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PlusCircle, Ban, RefreshCw } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { AdminPanel, StatusPill } from "@/components/Layouts/admin-surface";
import { formatVnDateTime } from "@/lib/datetime";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
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
  fetchActiveEnrollmentsForUser,
  issueCertificate,
  reissueCertificate,
  resolveCertPrefill,
  revokeCertificate,
  searchCertUsers,
  type AdminCertificate,
  type CertCourseOption,
  type CertUserOption,
} from "../actions";

function formatDate(value: string | null) {
  return formatVnDateTime(value);
}

type Props = {
  certificates: AdminCertificate[];
  prefillUserId?: number;
  prefillCourseId?: string;
};

export function CertificateManager({
  certificates,
  prefillUserId,
  prefillCourseId,
}: Props) {
  const router = useRouter();
  const [issueOpen, setIssueOpen] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<AdminCertificate | null>(
    null,
  );
  const [reissueTarget, setReissueTarget] = useState<AdminCertificate | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [reissueReason, setReissueReason] = useState("");

  const [selectedUser, setSelectedUser] = useState<CertUserOption | null>(null);
  const [selectedCourse, setSelectedCourse] =
    useState<CertCourseOption | null>(null);
  const [userOptions, setUserOptions] = useState<CertUserOption[]>([]);
  const [courseOptions, setCourseOptions] = useState<CertCourseOption[]>([]);
  const [userQuery, setUserQuery] = useState("");
  const [, startUserSearch] = useTransition();
  const [loadingCourses, setLoadingCourses] = useState(false);

  // Prefill from query (?issueUser=&issueCourse=)
  useEffect(() => {
    if (!prefillUserId) return;
    let cancelled = false;
    (async () => {
      const { user, course, courses } = await resolveCertPrefill({
        userId: prefillUserId,
        courseId: prefillCourseId,
      });
      if (cancelled || !user) return;
      setSelectedUser(user);
      setUserOptions([user]);
      setCourseOptions(courses);
      if (course) setSelectedCourse(course);
      setIssueOpen(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [prefillUserId, prefillCourseId]);

  // Debounced user search
  useEffect(() => {
    if (!issueOpen) return;
    const t = setTimeout(() => {
      startUserSearch(async () => {
        const users = await searchCertUsers(userQuery.trim());
        setUserOptions(users);
      });
    }, 250);
    return () => clearTimeout(t);
  }, [userQuery, issueOpen]);

  async function onSelectUser(user: CertUserOption | null) {
    setSelectedUser(user);
    setSelectedCourse(null);
    setCourseOptions([]);
    if (!user) return;
    setLoadingCourses(true);
    const courses = await fetchActiveEnrollmentsForUser(user.id);
    setCourseOptions(courses);
    setLoadingCourses(false);
  }

  function resetIssueForm() {
    setSelectedUser(null);
    setSelectedCourse(null);
    setCourseOptions([]);
    setUserQuery("");
  }

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
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary"
              onClick={() => {
                setReissueReason("");
                setReissueTarget(row.original);
              }}
              title="Cấp lại chứng chỉ"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          ),
      },
    ],
    [],
  );

  async function handleIssue(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUser || !selectedCourse) {
      toast.error("Vui lòng chọn học viên và khóa học");
      return;
    }
    setLoading(true);
    const result = await issueCertificate(
      selectedUser.id,
      selectedCourse.courseId,
    );
    setLoading(false);

    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    setIssueOpen(false);
    resetIssueForm();
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

  async function handleReissue() {
    if (!reissueTarget) return;
    setLoading(true);
    const result = await reissueCertificate(
      reissueTarget.id,
      reissueReason.trim() || null,
    );
    setLoading(false);
    setReissueTarget(null);
    setReissueReason("");

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
          <Button
            size="sm"
            onClick={() => {
              resetIssueForm();
              setIssueOpen(true);
            }}
          >
            <PlusCircle className="mr-1 h-4 w-4" />
            Cấp chứng chỉ
          </Button>
        }
      />

      <Dialog
        open={issueOpen}
        onOpenChange={(open) => {
          setIssueOpen(open);
          if (!open) resetIssueForm();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cấp chứng chỉ thủ công</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleIssue} className="space-y-4">
            <div className="space-y-2">
              <Label>Học viên</Label>
              <Combobox
                items={userOptions}
                value={selectedUser}
                onValueChange={(val) =>
                  void onSelectUser(val as CertUserOption | null)
                }
                itemToStringLabel={(u: CertUserOption) =>
                  `${u.userName} (${u.email})`
                }
                isItemEqualToValue={(a: CertUserOption, b: CertUserOption) =>
                  a.id === b.id
                }
              >
                <ComboboxInput
                  placeholder="Tìm theo tên hoặc email..."
                  showClear
                  onChange={(e) => setUserQuery(e.target.value)}
                />
                <ComboboxContent>
                  <ComboboxEmpty>Không tìm thấy học viên.</ComboboxEmpty>
                  <ComboboxList>
                    {(item: CertUserOption) => (
                      <ComboboxItem key={item.id} value={item}>
                        <span className="flex flex-col text-left">
                          <span>{item.userName}</span>
                          <span className="text-xs text-muted-foreground">
                            {item.email}
                          </span>
                        </span>
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>

            <div className="space-y-2">
              <Label>Khóa học đã đăng ký</Label>
              <Combobox
                items={courseOptions}
                value={selectedCourse}
                onValueChange={(val) =>
                  setSelectedCourse(val as CertCourseOption | null)
                }
                itemToStringLabel={(c: CertCourseOption) =>
                  `${c.courseTitle} (${c.percent}%)`
                }
                isItemEqualToValue={(a: CertCourseOption, b: CertCourseOption) =>
                  a.courseId === b.courseId
                }
                disabled={!selectedUser || loadingCourses}
              >
                <ComboboxInput
                  placeholder={
                    !selectedUser
                      ? "Chọn học viên trước"
                      : loadingCourses
                        ? "Đang tải khóa học..."
                        : courseOptions.length === 0
                          ? "Không có enrollment active"
                          : "Chọn khóa học..."
                  }
                  showClear
                  disabled={!selectedUser || loadingCourses}
                />
                <ComboboxContent>
                  <ComboboxEmpty>
                    Không có khóa học active cho học viên này.
                  </ComboboxEmpty>
                  <ComboboxList>
                    {(item: CertCourseOption) => (
                      <ComboboxItem key={item.courseId} value={item}>
                        <span className="flex flex-col text-left">
                          <span>{item.courseTitle}</span>
                          <span className="text-xs text-muted-foreground">
                            Tiến độ {item.percent}%
                          </span>
                        </span>
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
              <p className="text-xs text-dark-4 dark:text-dark-6">
                Chỉ hiện khóa học học viên đang có quyền truy cập (active). Nếu
                đã thu hồi trước đó, hệ thống sẽ cấp lại số hiệu mới.
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
              <Button
                type="submit"
                disabled={loading || !selectedUser || !selectedCourse}
              >
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

      <AlertDialog
        open={reissueTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setReissueTarget(null);
            setReissueReason("");
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cấp lại chứng chỉ</AlertDialogTitle>
            <AlertDialogDescription>
              Cấp lại cho{" "}
              <strong>
                {reissueTarget?.userName ?? `User #${reissueTarget?.userId}`}
              </strong>{" "}
              — khóa{" "}
              <strong>
                {reissueTarget?.courseTitle ?? reissueTarget?.courseId}
              </strong>
              . Số hiệu cũ sẽ được thay bằng số mới; lịch sử thu hồi vẫn được
              ghi nhận trong audit.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="reissue-reason">Lý do (tuỳ chọn)</Label>
            <Input
              id="reissue-reason"
              value={reissueReason}
              onChange={(e) => setReissueReason(e.target.value)}
              placeholder="Ví dụ: sửa tên, cấp lại sau thu hồi…"
              maxLength={500}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction disabled={loading} onClick={handleReissue}>
              {loading ? "Đang cấp lại..." : "Cấp lại"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminPanel>
  );
}
