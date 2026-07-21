"use client";

import { useState } from "react";
import type { LeadListItem, LeadStatus, StaffUserOption } from "./actions";
import { LeadDetailDrawer } from "./lead-detail-drawer";

const STATUS_LABEL: Record<LeadStatus, string> = {
  new: "Mới",
  contacted: "Đã liên hệ",
  qualified: "Đủ điều kiện",
  converted: "Đã chuyển đổi",
  lost: "Mất",
  spam: "Spam",
};

const STATUS_BADGE: Record<LeadStatus, string> = {
  new: "bg-blue-50 text-blue-700 ring-blue-600/20",
  contacted: "bg-amber-50 text-amber-700 ring-amber-600/20",
  qualified: "bg-violet-50 text-violet-700 ring-violet-600/20",
  converted: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  lost: "bg-slate-100 text-slate-600 ring-slate-500/20",
  spam: "bg-rose-50 text-rose-700 ring-rose-600/20",
};

function formatDate(value: string) {
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
  leads: LeadListItem[];
  staffUsers: StaffUserOption[];
};

export function LeadsTable({ leads, staffUsers }: Props) {
  const [selected, setSelected] = useState<LeadListItem | null>(null);

  if (leads.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
        Chưa có đăng ký tư vấn nào.
      </div>
    );
  }

  return (
    <>
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
          <tr>
            <th className="px-4 py-3 font-semibold">Thời gian</th>
            <th className="px-4 py-3 font-semibold">Họ tên</th>
            <th className="px-4 py-3 font-semibold">SĐT</th>
            <th className="px-4 py-3 font-semibold">Email</th>
            <th className="px-4 py-3 font-semibold">Trạng thái</th>
            <th className="px-4 py-3 font-semibold">Assignee</th>
            <th className="px-4 py-3 font-semibold">Nội dung</th>
            <th className="px-4 py-3 font-semibold" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {leads.map((lead) => (
            <tr
              key={lead.id}
              className="align-top hover:bg-slate-50/80 dark:hover:bg-slate-900/40"
            >
              <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                {formatDate(lead.createdAt)}
              </td>
              <td className="px-4 py-3 font-medium text-slate-950 dark:text-white">
                {lead.name}
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                <a
                  href={`tel:${lead.phone}`}
                  className="text-[#0070EB] hover:underline"
                >
                  {lead.phone}
                </a>
              </td>
              <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                {lead.email ? (
                  <a href={`mailto:${lead.email}`} className="hover:underline">
                    {lead.email}
                  </a>
                ) : (
                  "—"
                )}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_BADGE[lead.status]}`}
                >
                  {STATUS_LABEL[lead.status]}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-500">
                {lead.assigneeName || "—"}
              </td>
              <td className="max-w-xs px-4 py-3 text-slate-600 dark:text-slate-300">
                <p className="line-clamp-2 whitespace-pre-wrap">
                  {lead.message || "—"}
                </p>
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => setSelected(lead)}
                  className="text-sm font-medium text-[#0070EB] hover:underline"
                >
                  Chi tiết
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selected ? (
        <LeadDetailDrawer
          lead={selected}
          staffUsers={staffUsers}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </>
  );
}
