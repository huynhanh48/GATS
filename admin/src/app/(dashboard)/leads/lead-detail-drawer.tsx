"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatVnDateTime } from "@/lib/datetime";
import {
  fetchLeadActivity,
  updateLead,
  type LeadAuditLogRow,
  type LeadListItem,
  type LeadStatus,
  type StaffUserOption,
} from "./actions";

const STATUS_OPTIONS: LeadStatus[] = [
  "new",
  "contacted",
  "qualified",
  "converted",
  "lost",
  "spam",
];

const STATUS_LABEL: Record<LeadStatus, string> = {
  new: "Mới",
  contacted: "Đã liên hệ",
  qualified: "Đủ điều kiện",
  converted: "Đã chuyển đổi",
  lost: "Mất",
  spam: "Spam",
};

const ACTION_LABEL: Record<string, string> = {
  "lead.status_changed": "Đổi trạng thái",
  "lead.assignee_changed": "Đổi người phụ trách",
};

function formatDateTime(value: string) {
  return formatVnDateTime(value);
}

function describeActivity(
  log: LeadAuditLogRow,
  staffById: Map<number, StaffUserOption>,
): string {
  const meta = log.meta ?? {};
  if (log.action === "lead.status_changed") {
    const from = String(meta.from ?? "");
    const to = String(meta.to ?? "");
    return `${STATUS_LABEL[from as LeadStatus] ?? from} → ${STATUS_LABEL[to as LeadStatus] ?? to}`;
  }
  if (log.action === "lead.assignee_changed") {
    const from = meta.from ? staffById.get(Number(meta.from))?.userName ?? `#${meta.from}` : "Chưa gán";
    const to = meta.to ? staffById.get(Number(meta.to))?.userName ?? `#${meta.to}` : "Bỏ gán";
    return `${from} → ${to}`;
  }
  return ACTION_LABEL[log.action] ?? log.action;
}

type Props = {
  lead: LeadListItem;
  staffUsers: StaffUserOption[];
  onClose: () => void;
};

export function LeadDetailDrawer({ lead, staffUsers, onClose }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<LeadStatus>(lead.status);
  const [assigneeUserId, setAssigneeUserId] = useState<number | null>(
    lead.assigneeUserId,
  );
  const [notes, setNotes] = useState(lead.notes ?? "");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [activity, setActivity] = useState<LeadAuditLogRow[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    setActivity(null);
    void fetchLeadActivity(lead.id).then((logs) => {
      if (!cancelled) setActivity(logs);
    });
    return () => {
      cancelled = true;
    };
  }, [lead.id]);

  const staffById = new Map(staffUsers.map((u) => [u.id, u]));

  const save = () => {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateLead(lead.id, {
        status,
        notes: notes.trim() ? notes.trim() : null,
        assigneeUserId,
      });
      if (!result.ok) {
        setError(result.message ?? "Thất bại");
        return;
      }
      setSaved(true);
      router.refresh();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <button
        type="button"
        aria-label="Đóng"
        className="flex-1"
        onClick={onClose}
      />
      <aside className="flex h-full w-full max-w-md flex-col bg-white shadow-xl dark:bg-slate-950">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {lead.name}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-slate-500 hover:text-slate-800"
          >
            Đóng
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4 text-sm">
          <div>
            <p className="text-xs font-medium uppercase text-slate-500">SĐT</p>
            <a href={`tel:${lead.phone}`} className="text-[#0070EB] hover:underline">
              {lead.phone}
            </a>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-slate-500">Email</p>
            {lead.email ? (
              <a
                href={`mailto:${lead.email}`}
                className="text-[#0070EB] hover:underline"
              >
                {lead.email}
              </a>
            ) : (
              "—"
            )}
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-slate-500">
              Nội dung
            </p>
            <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">
              {lead.message || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-slate-500">
              Nguồn
            </p>
            <p>{lead.source}</p>
          </div>

          <label className="block space-y-1">
            <span className="text-xs font-medium uppercase text-slate-500">
              Trạng thái
            </span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as LeadStatus)}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1">
            <span className="text-xs font-medium uppercase text-slate-500">
              Người phụ trách
            </span>
            <select
              value={assigneeUserId ?? ""}
              onChange={(e) =>
                setAssigneeUserId(e.target.value ? Number(e.target.value) : null)
              }
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="">— Chưa gán —</option>
              {staffUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.userName} ({user.email})
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1">
            <span className="text-xs font-medium uppercase text-slate-500">
              Ghi chú nội bộ
            </span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
              placeholder="Ghi chú chăm sóc lead…"
            />
          </label>

          {error ? <p className="text-rose-600">{error}</p> : null}
          {saved ? <p className="text-emerald-600">Đã lưu.</p> : null}

          <div>
            <p className="mb-2 text-xs font-medium uppercase text-slate-500">
              Lịch sử hoạt động
            </p>
            {activity === null ? (
              <p className="text-xs text-slate-400">Đang tải…</p>
            ) : activity.length === 0 ? (
              <p className="text-xs text-slate-400">
                Chưa có hoạt động nào. Cập nhật lần cuối:{" "}
                {formatDateTime(lead.updatedAt)}
              </p>
            ) : (
              <ul className="space-y-2 border-l border-slate-200 pl-3 dark:border-slate-700">
                {activity.map((log) => (
                  <li key={log.id} className="relative">
                    <span className="absolute -left-[17px] top-1.5 size-2 rounded-full bg-[#0070EB]" />
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
                      {ACTION_LABEL[log.action] ?? log.action}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {describeActivity(log, staffById)}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {formatDateTime(log.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <button
            type="button"
            disabled={pending}
            onClick={save}
            className="w-full rounded-md bg-[#0070EB] px-3 py-2 text-sm font-medium text-white hover:bg-[#0060c9] disabled:opacity-60"
          >
            {pending ? "Đang lưu…" : "Lưu"}
          </button>
        </div>
      </aside>
    </div>
  );
}
