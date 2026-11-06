"use client";

import { useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { AdminPanel, StatusPill } from "@/components/Layouts/admin-surface";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatVnDate, formatVnDateTime } from "@/lib/datetime";
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
  createCoupon,
  deleteCoupon,
  updateCoupon,
  type AdminCoupon,
  type CouponInput,
  type CouponScope,
  type CouponType,
} from "../actions";
import type { MembershipPlan } from "../../memberships/actions";

const selectClass =
  "h-10 w-full rounded-lg border border-stroke bg-transparent px-3 text-sm text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary";

type CouponFormState = {
  code: string;
  description: string;
  type: CouponType;
  scope: CouponScope;
  membershipPlanId: string;
  value: string;
  maxUses: string;
  minOrderAmount: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
};

const emptyForm: CouponFormState = {
  code: "",
  description: "",
  type: "percent",
  scope: "all",
  membershipPlanId: "",
  value: "10",
  maxUses: "",
  minOrderAmount: "0",
  startsAt: "",
  endsAt: "",
  isActive: true,
};

function currency(value: number) {
  return value.toLocaleString("vi-VN") + "đ";
}

function formatDate(value: string | null) {
  if (!value) return "—";
  try {
    return formatVnDate(value);
  } catch {
    return value;
  }
}

function toDateInputValue(value: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

type Props = {
  coupons: AdminCoupon[];
  membershipPlans: MembershipPlan[];
};

export function CouponManager({ coupons, membershipPlans }: Props) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCoupon | null>(null);
  const [form, setForm] = useState<CouponFormState>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<AdminCoupon | null>(null);
  const [loading, setLoading] = useState(false);

  const columns = useMemo<ColumnDef<AdminCoupon>[]>(
    () => [
      {
        accessorKey: "code",
        header: "Mã",
        cell: ({ row }) => (
          <div>
            <h5 className="font-mono font-semibold text-dark dark:text-white">
              {row.original.code}
            </h5>
            {row.original.description ? (
              <p className="mt-1 text-body-sm text-dark-4 dark:text-dark-6">
                {row.original.description}
              </p>
            ) : null}
          </div>
        ),
      },
      {
        id: "discount",
        header: "Giảm giá",
        cell: ({ row }) => (
          <span className="text-dark dark:text-white">
            {row.original.type === "percent"
              ? `${row.original.value}%`
              : currency(row.original.value)}
          </span>
        ),
      },
      {
        id: "scope",
        header: "Phạm vi",
        cell: ({ row }) => (
          <span className="text-dark dark:text-white">
            {row.original.scope === "membership"
              ? "Membership"
              : row.original.scope === "course"
                ? "Khóa học"
                : "Tất cả"}
          </span>
        ),
      },
      {
        id: "usage",
        header: "Sử dụng",
        cell: ({ row }) => (
          <span className="text-dark dark:text-white">
            {row.original.usedCount}
            {row.original.maxUses !== null ? ` / ${row.original.maxUses}` : ""}
          </span>
        ),
      },
      {
        id: "minOrder",
        header: "Đơn tối thiểu",
        cell: ({ row }) => (
          <span className="text-dark dark:text-white">
            {row.original.minOrderAmount > 0
              ? currency(row.original.minOrderAmount)
              : "—"}
          </span>
        ),
      },
      {
        id: "period",
        header: "Thời hạn",
        cell: ({ row }) => (
          <span className="text-sm text-dark-4 dark:text-dark-6">
            {formatDate(row.original.startsAt)} → {formatDate(row.original.endsAt)}
          </span>
        ),
      },
      {
        accessorKey: "isActive",
        header: "Trạng thái",
        cell: ({ row }) => (
          <StatusPill tone={row.original.isActive ? "green" : "slate"}>
            {row.original.isActive ? "Đang hoạt động" : "Tạm dừng"}
          </StatusPill>
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
    [],
  );

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(coupon: AdminCoupon) {
    setEditing(coupon);
    setForm({
      code: coupon.code,
      description: coupon.description ?? "",
      type: coupon.type,
      scope: coupon.scope,
      membershipPlanId: coupon.membershipPlanId ?? "",
      value: String(coupon.value),
      maxUses: coupon.maxUses !== null ? String(coupon.maxUses) : "",
      minOrderAmount: String(coupon.minOrderAmount),
      startsAt: toDateInputValue(coupon.startsAt),
      endsAt: toDateInputValue(coupon.endsAt),
      isActive: coupon.isActive,
    });
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const code = form.code.trim();
    const value = Number(form.value);
    const minOrderAmount = Number(form.minOrderAmount) || 0;
    const maxUses = form.maxUses.trim() ? Number(form.maxUses) : null;

    if (!editing && !code) {
      toast.error("Mã giảm giá là bắt buộc");
      return;
    }
    if (!value || value <= 0) {
      toast.error("Giá trị giảm giá phải lớn hơn 0");
      return;
    }

    setLoading(true);

    const payload: Partial<CouponInput> = {
      description: form.description.trim() || undefined,
      type: form.type,
      scope: form.scope,
      membershipPlanId:
        form.scope === "membership" && form.membershipPlanId
          ? form.membershipPlanId
          : null,
      value,
      maxUses,
      minOrderAmount,
      startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
      endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
      isActive: form.isActive,
    };

    const result = editing
      ? await updateCoupon(editing.id, payload)
      : await createCoupon({ ...payload, code } as CouponInput);

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
    const result = await deleteCoupon(deleteTarget.id);
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
    <AdminPanel title="Mã giảm giá" bodyClassName="p-4 sm:p-5">
      <DataTable
        columns={columns}
        data={coupons}
        searchable
        searchColumn="code"
        searchPlaceholder="Tìm theo mã..."
        sortable
        getRowId={(row) => row.id}
        emptyMessage="Chưa có mã giảm giá nào."
        toolbar={
          <Button size="sm" onClick={openCreate}>
            <PlusCircle className="mr-1 h-4 w-4" />
            Thêm mã giảm giá
          </Button>
        }
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Sửa mã giảm giá" : "Thêm mã giảm giá"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="space-y-2">
              <Label htmlFor="coupon-code">Mã</Label>
              <Input
                id="coupon-code"
                value={form.code}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))
                }
                placeholder="Ví dụ: SUMMER25"
                disabled={!!editing}
                required={!editing}
                className="font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="coupon-scope">Phạm vi áp dụng</Label>
                <select
                  id="coupon-scope"
                  className={selectClass}
                  value={form.scope}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      scope: e.target.value as CouponScope,
                      membershipPlanId:
                        e.target.value === "membership"
                          ? prev.membershipPlanId
                          : "",
                    }))
                  }
                >
                  <option value="all">Tất cả sản phẩm</option>
                  <option value="course">Chỉ khóa học</option>
                  <option value="membership">Chỉ membership</option>
                </select>
              </div>
              {form.scope === "membership" ? (
                <div className="space-y-2">
                  <Label htmlFor="coupon-plan">Gói membership</Label>
                  <select
                    id="coupon-plan"
                    className={selectClass}
                    value={form.membershipPlanId}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        membershipPlanId: e.target.value,
                      }))
                    }
                  >
                    <option value="">Tất cả gói membership</option>
                    {membershipPlans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="coupon-type">Loại giảm giá</Label>
                <select
                  id="coupon-type"
                  className={selectClass}
                  value={form.type}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      type: e.target.value as CouponType,
                    }))
                  }
                >
                  <option value="percent">Theo % </option>
                  <option value="fixed">Số tiền cố định (VND)</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="coupon-value">
                  Giá trị {form.type === "percent" ? "(%)" : "(VND)"}
                </Label>
                <Input
                  id="coupon-value"
                  type="number"
                  min={1}
                  max={form.type === "percent" ? 100 : undefined}
                  value={form.value}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, value: e.target.value }))
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="coupon-max-uses">Số lượt dùng tối đa</Label>
                <Input
                  id="coupon-max-uses"
                  type="number"
                  min={1}
                  placeholder="Không giới hạn"
                  value={form.maxUses}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, maxUses: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coupon-min-order">Đơn tối thiểu (VND)</Label>
                <Input
                  id="coupon-min-order"
                  type="number"
                  min={0}
                  value={form.minOrderAmount}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, minOrderAmount: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="coupon-starts">Bắt đầu</Label>
                <Input
                  id="coupon-starts"
                  type="date"
                  value={form.startsAt}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, startsAt: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coupon-ends">Kết thúc</Label>
                <Input
                  id="coupon-ends"
                  type="date"
                  value={form.endsAt}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, endsAt: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="coupon-desc">Mô tả</Label>
              <Textarea
                id="coupon-desc"
                rows={2}
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Mô tả ngắn cho nội bộ..."
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-dark dark:text-white">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, isActive: e.target.checked }))
                }
                className="h-4 w-4 rounded border-stroke dark:border-dark-3"
              />
              Đang hoạt động
            </label>

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
            <AlertDialogTitle>Xóa mã giảm giá</AlertDialogTitle>
            <AlertDialogDescription>
              Xóa mã <strong>{deleteTarget?.code}</strong>? Các đơn hàng đã áp dụng
              mã này vẫn giữ lịch sử giảm giá, nhưng mã sẽ không dùng được nữa.
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
    </AdminPanel>
  );
}
