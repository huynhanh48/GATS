"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { AdminPanel } from "@/components/Layouts/admin-surface";
import { createAiResource, type AiToolConfig, updateAiToolConfig } from "../actions";
import { aiToolFieldClass } from "./ai-tool-manager";

type ResourceType = "mcp" | "tool" | "stem";
const areaClass = `${aiToolFieldClass} h-auto min-h-32 py-3`;

const defaults = {
  description: "",
  providerType: "custom",
  provider: "",
  pricingType: "free",
  price: 0,
  category: "General",
  level: "Cơ bản",
  imageUrl: "",
  installation: "",
};

export function ResourceForm({ type, initialItem }: { type: ResourceType; initialItem?: AiToolConfig }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const basePath = `/ai-tools/${type === "mcp" ? "mcps" : type === "tool" ? "tools" : "stem"}`;
  const typeLabel = type === "mcp" ? "MCP" : type === "tool" ? "Tool" : "STEM";
  const [item, setItem] = useState<AiToolConfig>(initialItem ?? {
    id: "new", type, itemKey: "", title: "", isPublic: true, isPaid: false, websiteUrl: null, payload: defaults,
  });
  const payload = { ...defaults, ...(item.payload ?? {}) };
  const setPayload = (key: string, value: unknown) => setItem((current) => ({ ...current, payload: { ...(current.payload ?? {}), [key]: value } }));

  const save = () => startTransition(async () => {
    const price = item.isPaid ? Number(payload.price) || 0 : 0;
    if (item.isPaid && price <= 0) { toast.error("Tài nguyên trả phí phải có giá lớn hơn 0"); return; }
    const normalizedPayload = { ...item.payload, pricingType: item.isPaid ? "paid" : "free", price };
    const input = { title: item.title, isPublic: item.isPublic, isPaid: item.isPaid, websiteUrl: item.websiteUrl, payload: normalizedPayload };
    const result = initialItem
      ? await updateAiToolConfig(type, item.itemKey, input)
      : await createAiResource(type, { ...input, itemKey: item.itemKey });
    if (!result.ok) { toast.error(result.message); return; }
    toast.success(result.message); router.push(basePath); router.refresh();
  });

  return <div className="space-y-4">
    <Link href={basePath} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-700"><ArrowLeft size={16}/> Danh sách {typeLabel}</Link>
    <AdminPanel title={initialItem ? `Chỉnh sửa ${typeLabel}` : `Tạo ${typeLabel} mới`} description="Quản lý dữ liệu trả về qua API công khai.">
      <div className="grid gap-5 md:grid-cols-2">
        {!initialItem && <Field label="ID/slug" value={item.itemKey} onChange={(value) => setItem((current) => ({ ...current, itemKey: value.toLowerCase().replace(/[^a-z0-9-]/g, "-") }))} />}
        <Field label="Tên" value={item.title} onChange={(title) => setItem((current) => ({ ...current, title }))} />
        {type === "mcp" ? (
          <label className="space-y-1"><span className="text-sm font-medium">Loại nhà cung cấp</span><select className={aiToolFieldClass} value={String(payload.providerType)} onChange={(event) => setPayload("providerType", event.target.value)}><option value="gemini">Gemini</option><option value="openai">OpenAI</option><option value="claude">Claude</option><option value="custom">Custom</option></select></label>
        ) : (
          <Field label={type === "stem" ? "Đơn vị phát triển / Lab" : "Nhà cung cấp"} value={String(payload.provider)} onChange={(value) => setPayload("provider", value)} />
        )}
        <Field label={type === "stem" ? "Tài liệu / Website dự án" : "Website chính thức"} value={item.websiteUrl ?? ""} onChange={(websiteUrl) => setItem((current) => ({ ...current, websiteUrl: websiteUrl || null }))} />
        {(type === "mcp" || type === "stem") && <Field label="Danh mục" value={String(payload.category)} onChange={(value) => setPayload("category", value)} />}
        {type === "stem" && <Field label="Cấp độ / Lứa tuổi" value={String(payload.level || "Cơ bản")} onChange={(value) => setPayload("level", value)} />}
        <Field label="Image URL" value={String(payload.imageUrl)} onChange={(value) => setPayload("imageUrl", value)} />
        <label className="space-y-1"><span className="text-sm font-medium">Hình thức</span><select className={aiToolFieldClass} value={item.isPaid ? "paid" : "free"} onChange={(event) => setItem((current) => ({ ...current, isPaid: event.target.value === "paid" }))}><option value="free">Miễn phí</option><option value="paid">Trả phí</option></select></label>
        <Field label="Giá (VNĐ)" type="number" disabled={!item.isPaid} value={item.isPaid ? String(payload.price || "") : ""} onChange={(value) => setPayload("price", Number(value) || 0)} />
        <label className="space-y-1 md:col-span-2"><span className="text-sm font-medium">Mô tả</span><textarea className={areaClass} value={String(payload.description)} onChange={(event) => setPayload("description", event.target.value)} /></label>
        {type === "mcp" && <label className="space-y-1 md:col-span-2"><span className="text-sm font-medium">Cài đặt</span><textarea className={`${areaClass} min-h-40`} value={String(payload.installation)} onChange={(event) => setPayload("installation", event.target.value)} /></label>}
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5 dark:border-slate-800">
        <label className="flex min-h-11 items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={item.isPublic} onChange={(event) => setItem((current) => ({ ...current, isPublic: event.target.checked }))}/> Public API</label>
        <button type="button" disabled={pending || !item.itemKey || !item.title || !String(payload.description).trim() || !String(payload.imageUrl).trim()} onClick={save} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#0070EB] px-5 font-semibold text-white disabled:opacity-50"><Save size={17}/>{pending ? "Đang lưu..." : "Lưu"}</button>
      </div>
    </AdminPanel>
  </div>;
}

function Field({ label, value, onChange, type = "text", disabled = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; disabled?: boolean }) {
  return <label className="space-y-1"><span className="text-sm font-medium">{label}</span><input type={type} disabled={disabled} className={aiToolFieldClass} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}
