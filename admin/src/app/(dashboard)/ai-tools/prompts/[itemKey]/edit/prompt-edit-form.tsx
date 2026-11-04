"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowLeft, Eye, EyeOff, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminPanel } from "@/components/Layouts/admin-surface";
import { deletePrompt, type AiToolConfig, updateAiToolConfig } from "../../../actions";
import { PromptFields } from "../../../_components/ai-tool-manager";

export function PromptEditForm({ initialItem }: { initialItem: AiToolConfig }) {
  const router = useRouter();
  const [item, setItem] = useState(initialItem);
  const [pending, startTransition] = useTransition();
  const patch = (value: Partial<AiToolConfig>) => setItem((current) => ({ ...current, ...value }));

  const save = () => startTransition(async () => {
    const result = await updateAiToolConfig("prompt", item.itemKey, {
      title: item.title,
      isPublic: item.isPublic,
      isPaid: item.isPaid,
      payload: item.payload,
    });
    result.ok ? toast.success(result.message) : toast.error(result.message);
  });

  const remove = () => {
    if (!confirm(`Xóa prompt “${item.title}”?`)) return;
    startTransition(async () => {
      const result = await deletePrompt(item.itemKey);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.push("/ai-tools/prompts");
      router.refresh();
    });
  };

  return <div className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Link href="/ai-tools/prompts" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700 dark:border-slate-700 dark:text-slate-200"><ArrowLeft size={16}/> Danh sách Prompt</Link>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={()=>patch({isPublic:!item.isPublic})} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-semibold dark:border-slate-700">{item.isPublic?<Eye size={16}/>:<EyeOff size={16}/>} {item.isPublic?"Public":"Private"}</button>
        <button type="button" onClick={()=>patch({isPaid:!item.isPaid})} className="min-h-10 rounded-lg border border-slate-300 px-3 text-sm font-semibold dark:border-slate-700">{item.isPaid?"Trả phí":"Miễn phí"}</button>
      </div>
    </div>
    <AdminPanel title="Thông tin Prompt" description={`Mã tham chiếu: ${item.itemKey}. Các thay đổi chỉ có hiệu lực sau khi lưu.`}>
      <PromptFields item={item} onChange={patch}/>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5 dark:border-slate-800">
        <button type="button" disabled={pending} onClick={remove} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-red-200 px-4 font-semibold text-red-600 disabled:opacity-50"><Trash2 size={17}/> Xóa Prompt</button>
        <button type="button" disabled={pending||!item.title.trim()} onClick={save} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#0070EB] px-5 font-semibold text-white disabled:opacity-50"><Save size={17}/> {pending?"Đang lưu...":"Lưu thay đổi"}</button>
      </div>
    </AdminPanel>
  </div>;
}
