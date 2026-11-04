"use client";

import { useMemo, useState } from "react";
import { Pencil, PlusCircle, RefreshCw, ShieldX, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { AdminPanel, StatusPill } from "@/components/Layouts/admin-surface";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  extendMembership,
  grantMembership,
  revokeMembership,
  saveMembershipPlan,
  type AdminMembership,
  type BillingInterval,
  type MembershipPlan,
  type PlanInput,
} from "./actions";

const selectClass =
  "h-10 w-full rounded-lg border border-stroke bg-transparent px-3 text-sm text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white";
const emptyPlan = {
  code: "",
  name: "",
  description: "",
  monthlyPrice: "",
  yearlyPrice: "",
  monthlyDurationDays: "30",
  yearlyDurationDays: "365",
  aiDailyLimit: "5",
  mentorReviewsPerMonth: "0",
  features: "",
  displayOrder: "50",
  isActive: true,
};

function money(value: number) {
  return `${value.toLocaleString("vi-VN")}đ`;
}
function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString("vi-VN") : "Không hết hạn";
}

export function MembershipManager({
  plans,
  memberships,
}: {
  plans: MembershipPlan[];
  memberships: AdminMembership[];
}) {
  const [planOpen, setPlanOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
  const [planForm, setPlanForm] = useState(emptyPlan);
  const [grantOpen, setGrantOpen] = useState(false);
  const [grantForm, setGrantForm] = useState({
    userId: "",
    planId:
      plans.find(
        (p) =>
          p.isActive && ((p.monthlyPrice ?? 0) > 0 || (p.yearlyPrice ?? 0) > 0),
      )?.id ?? "",
    billingInterval: "yearly" as BillingInterval,
    endsAt: "",
    source: "admin_granted" as "admin_granted" | "promotion" | "compensation",
    reason: "",
  });
  const [actionTarget, setActionTarget] = useState<AdminMembership | null>(
    null,
  );
  const [actionType, setActionType] = useState<"extend" | "revoke">("extend");
  const [actionDays, setActionDays] = useState("30");
  const [actionReason, setActionReason] = useState("");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);

  const visibleMemberships = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? memberships.filter((m) =>
          `${m.userId} ${m.userName} ${m.userEmail} ${m.planName}`
            .toLowerCase()
            .includes(q),
        )
      : memberships;
  }, [memberships, query]);

  function openPlan(plan?: MembershipPlan) {
    setEditingPlan(plan ?? null);
    setPlanForm(
      plan
        ? {
            code: plan.code,
            name: plan.name,
            description: plan.description ?? "",
            monthlyPrice: plan.monthlyPrice?.toString() ?? "",
            yearlyPrice: plan.yearlyPrice?.toString() ?? "",
            monthlyDurationDays: plan.monthlyDurationDays?.toString() ?? "",
            yearlyDurationDays: plan.yearlyDurationDays?.toString() ?? "",
            aiDailyLimit: plan.aiDailyLimit.toString(),
            mentorReviewsPerMonth: plan.mentorReviewsPerMonth.toString(),
            features: plan.features.join("\n"),
            displayOrder: plan.displayOrder.toString(),
            isActive: plan.isActive,
          }
        : emptyPlan,
    );
    setPlanOpen(true);
  }

  async function submitPlan(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    const input: PlanInput = {
      ...(!editingPlan ? { code: planForm.code.trim() } : {}),
      name: planForm.name.trim(),
      description: planForm.description.trim() || null,
      monthlyPrice: planForm.monthlyPrice
        ? Number(planForm.monthlyPrice)
        : null,
      yearlyPrice: planForm.yearlyPrice ? Number(planForm.yearlyPrice) : null,
      monthlyDurationDays: planForm.monthlyDurationDays
        ? Number(planForm.monthlyDurationDays)
        : null,
      yearlyDurationDays: planForm.yearlyDurationDays
        ? Number(planForm.yearlyDurationDays)
        : null,
      aiDailyLimit: Number(planForm.aiDailyLimit),
      mentorReviewsPerMonth: Number(planForm.mentorReviewsPerMonth),
      features: planForm.features
        .split("\n")
        .map((v) => v.trim())
        .filter(Boolean),
      displayOrder: Number(planForm.displayOrder),
      isActive: planForm.isActive,
    };
    const result = await saveMembershipPlan(editingPlan?.id ?? null, input);
    setBusy(false);
    result.ok ? toast.success(result.message) : toast.error(result.message);
    if (result.ok) setPlanOpen(false);
  }

  async function submitGrant(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    const result = await grantMembership({
      userId: Number(grantForm.userId),
      planId: grantForm.planId,
      billingInterval: grantForm.billingInterval,
      endsAt: grantForm.endsAt
        ? new Date(`${grantForm.endsAt}T23:59:59`).toISOString()
        : null,
      source: grantForm.source,
      reason: grantForm.reason,
    });
    setBusy(false);
    result.ok ? toast.success(result.message) : toast.error(result.message);
    if (result.ok) setGrantOpen(false);
  }

  async function submitMemberAction(event: React.FormEvent) {
    event.preventDefault();
    if (!actionTarget) return;
    setBusy(true);
    const result =
      actionType === "extend"
        ? await extendMembership(
            actionTarget.id,
            Number(actionDays),
            actionReason,
          )
        : await revokeMembership(actionTarget.id, actionReason);
    setBusy(false);
    result.ok ? toast.success(result.message) : toast.error(result.message);
    if (result.ok) setActionTarget(null);
  }

  return (
    <div className="space-y-4">
      <AdminPanel
        title="Gói hội viên"
        description="Giá mới áp dụng cho giao dịch mới; membership đã cấp giữ nguyên price snapshot."
        actions={
          <Button size="sm" onClick={() => openPlan()}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Tạo gói
          </Button>
        }
        bodyClassName="p-0"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="bg-slate-50 text-left text-xs text-slate-500 uppercase dark:bg-slate-900">
              <tr>
                <th className="px-5 py-3">Gói</th>
                <th className="px-4 py-3">Giá tháng</th>
                <th className="px-4 py-3">Giá năm</th>
                <th className="px-4 py-3">AI/ngày</th>
                <th className="px-4 py-3">Mentor</th>
                <th className="px-4 py-3">Hội viên</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {plans.map((plan) => (
                <tr key={plan.id}>
                  <td className="px-5 py-3">
                    <p className="font-semibold text-slate-950 dark:text-white">
                      {plan.name}
                    </p>
                    <p className="text-xs text-slate-500">{plan.code}</p>
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    {plan.monthlyPrice === null
                      ? "—"
                      : money(plan.monthlyPrice)}
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    {plan.yearlyPrice === null ? "—" : money(plan.yearlyPrice)}
                  </td>
                  <td className="px-4 py-3">
                    {plan.aiDailyLimit < 0
                      ? "Không giới hạn"
                      : plan.aiDailyLimit}
                  </td>
                  <td className="px-4 py-3">
                    {plan.mentorReviewsPerMonth}/tháng
                  </td>
                  <td className="px-4 py-3">{plan.activeMembers}</td>
                  <td className="px-4 py-3">
                    <StatusPill tone={plan.isActive ? "green" : "slate"}>
                      {plan.isActive ? "Đang bán" : "Tạm dừng"}
                    </StatusPill>
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openPlan(plan)}
                      aria-label={`Sửa ${plan.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminPanel>

      <AdminPanel
        title="Danh sách hội viên"
        description="Tìm kiếm, cấp mới, gia hạn hoặc thu hồi membership."
        actions={
          <Button size="sm" onClick={() => setGrantOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Cấp membership
          </Button>
        }
        bodyClassName="p-0"
      >
        <div className="border-b border-slate-200 p-4 dark:border-slate-800">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo ID, tên, email hoặc gói..."
            className="max-w-md"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="bg-slate-50 text-left text-xs text-slate-500 uppercase dark:bg-slate-900">
              <tr>
                <th className="px-5 py-3">Người dùng</th>
                <th className="px-4 py-3">Gói</th>
                <th className="px-4 py-3">Nguồn</th>
                <th className="px-4 py-3">Bắt đầu</th>
                <th className="px-4 py-3">Hết hạn</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {visibleMemberships.map((item) => (
                <tr key={item.id}>
                  <td className="px-5 py-3">
                    <p className="font-semibold text-slate-950 dark:text-white">
                      {item.userName}
                    </p>
                    <p className="text-xs text-slate-500">
                      #{item.userId} · {item.userEmail}
                    </p>
                  </td>
                  <td className="px-4 py-3 font-medium">{item.planName}</td>
                  <td className="px-4 py-3">{item.source}</td>
                  <td className="px-4 py-3">{formatDate(item.startedAt)}</td>
                  <td className="px-4 py-3">
                    {formatDate(item.currentPeriodEnd)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill
                      tone={
                        item.status === "active"
                          ? "green"
                          : item.status === "revoked"
                            ? "red"
                            : "slate"
                      }
                    >
                      {item.status}
                    </StatusPill>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setActionTarget(item);
                          setActionType("extend");
                          setActionReason("");
                        }}
                      >
                        <RefreshCw className="mr-1 h-4 w-4" />
                        Gia hạn
                      </Button>
                      {item.status === "active" ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                          onClick={() => {
                            setActionTarget(item);
                            setActionType("revoke");
                            setActionReason("");
                          }}
                        >
                          <ShieldX className="mr-1 h-4 w-4" />
                          Thu hồi
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
              {visibleMemberships.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    Chưa có hội viên phù hợp.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </AdminPanel>

      <Dialog open={planOpen} onOpenChange={setPlanOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? "Chỉnh sửa gói" : "Tạo gói hội viên"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={submitPlan} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {!editingPlan ? (
                <Field label="Mã gói">
                  <Input
                    required
                    value={planForm.code}
                    onChange={(e) =>
                      setPlanForm({ ...planForm, code: e.target.value })
                    }
                    placeholder="PLUS"
                  />
                </Field>
              ) : null}
              <Field label="Tên gói">
                <Input
                  required
                  value={planForm.name}
                  onChange={(e) =>
                    setPlanForm({ ...planForm, name: e.target.value })
                  }
                />
              </Field>
              <Field label="Giá tháng (VNĐ)">
                <Input
                  type="number"
                  min="0"
                  value={planForm.monthlyPrice}
                  onChange={(e) =>
                    setPlanForm({ ...planForm, monthlyPrice: e.target.value })
                  }
                  placeholder="Không hỗ trợ"
                />
              </Field>
              <Field label="Số ngày gói tháng">
                <Input
                  type="number"
                  min="1"
                  value={planForm.monthlyDurationDays}
                  onChange={(e) =>
                    setPlanForm({
                      ...planForm,
                      monthlyDurationDays: e.target.value,
                    })
                  }
                />
              </Field>
              <Field label="Giá năm (VNĐ)">
                <Input
                  type="number"
                  min="0"
                  value={planForm.yearlyPrice}
                  onChange={(e) =>
                    setPlanForm({ ...planForm, yearlyPrice: e.target.value })
                  }
                  placeholder="Không hỗ trợ"
                />
              </Field>
              <Field label="Số ngày gói năm">
                <Input
                  type="number"
                  min="1"
                  value={planForm.yearlyDurationDays}
                  onChange={(e) =>
                    setPlanForm({
                      ...planForm,
                      yearlyDurationDays: e.target.value,
                    })
                  }
                />
              </Field>
              <Field label="AI/ngày (-1 = vô hạn)">
                <Input
                  type="number"
                  min="-1"
                  value={planForm.aiDailyLimit}
                  onChange={(e) =>
                    setPlanForm({ ...planForm, aiDailyLimit: e.target.value })
                  }
                />
              </Field>
              <Field label="Mentor/tháng">
                <Input
                  type="number"
                  min="0"
                  value={planForm.mentorReviewsPerMonth}
                  onChange={(e) =>
                    setPlanForm({
                      ...planForm,
                      mentorReviewsPerMonth: e.target.value,
                    })
                  }
                />
              </Field>
              <Field label="Thứ tự">
                <Input
                  type="number"
                  min="0"
                  value={planForm.displayOrder}
                  onChange={(e) =>
                    setPlanForm({ ...planForm, displayOrder: e.target.value })
                  }
                />
              </Field>
            </div>
            <Field label="Mô tả">
              <Textarea
                value={planForm.description}
                onChange={(e) =>
                  setPlanForm({ ...planForm, description: e.target.value })
                }
              />
            </Field>
            <Field label="Quyền lợi — mỗi dòng một mục">
              <Textarea
                rows={5}
                value={planForm.features}
                onChange={(e) =>
                  setPlanForm({ ...planForm, features: e.target.value })
                }
              />
            </Field>
            <label className="flex min-h-11 cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={planForm.isActive}
                onChange={(e) =>
                  setPlanForm({ ...planForm, isActive: e.target.checked })
                }
              />
              Đang mở bán
            </label>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPlanOpen(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? "Đang lưu..." : "Lưu gói"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={grantOpen} onOpenChange={setGrantOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cấp membership</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitGrant} className="space-y-4">
            <Field label="User ID">
              <Input
                type="number"
                min="1"
                required
                value={grantForm.userId}
                onChange={(e) =>
                  setGrantForm({ ...grantForm, userId: e.target.value })
                }
              />
            </Field>
            <Field label="Gói">
              <select
                required
                className={selectClass}
                value={grantForm.planId}
                onChange={(e) =>
                  setGrantForm({ ...grantForm, planId: e.target.value })
                }
              >
                <option value="">Chọn gói</option>
                {plans
                  .filter((p) => p.isActive)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
              </select>
            </Field>
            <Field label="Chu kỳ">
              <select
                className={selectClass}
                value={grantForm.billingInterval}
                onChange={(e) =>
                  setGrantForm({
                    ...grantForm,
                    billingInterval: e.target.value as BillingInterval,
                  })
                }
              >
                <option value="lifetime">Vĩnh viễn</option>
                <option value="monthly">Hàng tháng</option>
                <option value="yearly">Hàng năm</option>
              </select>
            </Field>
            <Field label="Nguồn cấp">
              <select
                className={selectClass}
                value={grantForm.source}
                onChange={(e) =>
                  setGrantForm({
                    ...grantForm,
                    source: e.target.value as typeof grantForm.source,
                  })
                }
              >
                <option value="admin_granted">Admin cấp</option>
                <option value="promotion">Khuyến mãi</option>
                <option value="compensation">Bồi hoàn</option>
              </select>
            </Field>
            <Field label="Ngày hết hạn tùy chỉnh">
              <Input
                type="date"
                value={grantForm.endsAt}
                onChange={(e) =>
                  setGrantForm({ ...grantForm, endsAt: e.target.value })
                }
              />
              <p className="mt-1 text-xs text-slate-500">
                Để trống để dùng thời hạn mặc định của chu kỳ.
              </p>
            </Field>
            <Field label="Lý do">
              <Textarea
                required
                minLength={3}
                value={grantForm.reason}
                onChange={(e) =>
                  setGrantForm({ ...grantForm, reason: e.target.value })
                }
              />
            </Field>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setGrantOpen(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? "Đang cấp..." : "Xác nhận cấp"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(actionTarget)}
        onOpenChange={(open) => !open && setActionTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "extend"
                ? "Gia hạn membership"
                : "Thu hồi membership"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={submitMemberAction} className="space-y-4">
            {actionType === "extend" ? (
              <Field label="Số ngày gia hạn">
                <Input
                  type="number"
                  min="1"
                  max="3650"
                  required
                  value={actionDays}
                  onChange={(e) => setActionDays(e.target.value)}
                />
              </Field>
            ) : (
              <p className="text-sm text-slate-600">
                Quyền membership của <strong>{actionTarget?.userName}</strong>{" "}
                sẽ bị dừng ngay.
              </p>
            )}
            <Field label="Lý do">
              <Textarea
                required
                minLength={3}
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
              />
            </Field>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setActionTarget(null)}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                variant={actionType === "revoke" ? "destructive" : "default"}
                disabled={busy}
              >
                {busy
                  ? "Đang xử lý..."
                  : actionType === "extend"
                    ? "Gia hạn"
                    : "Thu hồi"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
