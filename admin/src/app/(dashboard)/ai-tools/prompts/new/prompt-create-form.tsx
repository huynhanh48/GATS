"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { AdminPanel } from "@/components/Layouts/admin-surface";
import { createPrompt, type AiToolConfig } from "../../actions";
import { aiToolFieldClass, emptyPromptPayload, PromptFields } from "../../_components/ai-tool-manager";

export function PromptCreateForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [item, setItem] = useState<AiToolConfig>({
    id: "new",
    type: "prompt",
    itemKey: "",
    title: "",
    isPublic: true,
    isPaid: false,
    websiteUrl: null,
    payload: emptyPromptPayload,
  });
  const patch = (value: Partial<AiToolConfig>) => setItem((current) => ({ ...current, ...value }));

  const submit = () => startTransition(async () => {
    const result = await createPrompt({
      itemKey: item.itemKey,
      title: item.title,
      isPublic: item.isPublic,
      isPaid: item.isPaid,
      payload: item.payload,
    });
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    router.push("/ai-tools/prompts");
    router.refresh();
  });

  return <div className="space-y-4">
    <Link href="/ai-tools/prompts" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700 dark:border-slate-700 dark:text-slate-200"><ArrowLeft size={16}/> Danh sách Prompt</Link>
    <AdminPanel title="Thông tin Prompt mới" description="Nhập đầy đủ dữ liệu trước khi tạo. ID/slug dùng để liên kết Prompt giữa admin và website.">
      <label className="mb-4 block space-y-1">
        <span className="text-sm font-medium">ID/slug duy nhất</span>
        <input className={aiToolFieldClass} value={item.itemKey} onChange={event=>patch({itemKey:event.target.value.toLowerCase().replace(/[^a-z0-9-]/g,"-")})} placeholder="vi-du: prompt-thiet-ke-logo" />
      </label>
      <PromptFields item={item} onChange={patch}/>
      <div className="mt-6 flex justify-end border-t border-slate-200 pt-5 dark:border-slate-800">
        <button type="button" disabled={pending||!item.itemKey.trim()||!item.title.trim()} onClick={submit} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#0070EB] px-5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"><Save size={17}/> {pending?"Đang tạo...":"Tạo Prompt"}</button>
      </div>
    </AdminPanel>
  </div>;
}
