"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { AdminPanel } from "@/components/Layouts/admin-surface";
import { aiToolFieldClass } from "../../_components/ai-tool-manager";
import { createApiModel, type AiToolConfig, updateAiToolConfig } from "../../actions";

const defaults = { provider: "", category: "", imageUrl: "", endpointUrl: "", description: "", pricingType: "free", price: 0, models: [] as Array<{ id: string; isActive: boolean }> };
const areaClass = `${aiToolFieldClass} h-auto min-h-32 py-3`;

export function ApiProviderForm({ initialItem }: { initialItem?: AiToolConfig }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [item, setItem] = useState<AiToolConfig>(initialItem ?? { id: "new", type: "api_provider", itemKey: "", title: "", isPublic: true, isPaid: false, websiteUrl: "", payload: defaults });
  const [modelsText, setModelsText] = useState(() => JSON.stringify(initialItem?.payload?.models ?? [], null, 2));
  const payload = { ...defaults, ...(item.payload ?? {}) };
  const setPayload = (key: string, value: unknown) => setItem((current) => ({ ...current, payload: { ...(current.payload ?? {}), [key]: value } }));

  const save = () => startTransition(async () => {
    let models: Array<{ id: string; isActive: boolean }>;
    try {
      const parsed = JSON.parse(modelsText);
      if (!Array.isArray(parsed) || parsed.some((model) => !model || typeof model.id !== "string" || typeof model.isActive !== "boolean")) throw new Error();
      models = parsed.map(({ id, isActive }) => ({ id, isActive }));
    } catch {
      toast.error("Models phải là JSON array gồm id và isActive"); return;
    }
    const price = item.isPaid ? Number(payload.price) || 0 : 0;
    if (item.isPaid && price <= 0) { toast.error("API trả phí phải có giá lớn hơn 0"); return; }
    const normalizedPayload = { provider: payload.provider, category: payload.category, imageUrl: payload.imageUrl, endpointUrl: payload.endpointUrl, description: payload.description, pricingType: item.isPaid ? "paid" : "free", price, models };
    const input = { title: item.title, isPublic: item.isPublic, isPaid: item.isPaid, websiteUrl: item.websiteUrl || "", payload: normalizedPayload };
    const result = initialItem ? await updateAiToolConfig("api_provider", item.itemKey, input) : await createApiModel({ itemKey: item.itemKey, ...input });
    if (!result.ok) { toast.error(result.message); return; }
    toast.success(result.message); router.push("/ai-tools/api-providers"); router.refresh();
  });

  return <div className="space-y-4">
    <Link href="/ai-tools/api-providers" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-semibold"><ArrowLeft size={16}/> Danh sách API Providers</Link>
    <AdminPanel title={initialItem ? "Chỉnh sửa API Provider" : "Tạo API Provider"} description="Quản lý endpoint và danh sách model dùng cho dropdown.">
      <div className="grid gap-5 md:grid-cols-2">
        {!initialItem && <Field label="ID/slug" value={item.itemKey} onChange={(value) => setItem((current) => ({ ...current, itemKey: value.toLowerCase().replace(/[^a-z0-9-]/g, "-") }))} />}
        <Field label="Tên API Provider" value={item.title} onChange={(title) => setItem((current) => ({ ...current, title }))} />
        <Field label="Nhà cung cấp" value={String(payload.provider)} onChange={(value) => setPayload("provider", value)} />
        <Field label="Danh mục" value={String(payload.category)} onChange={(value) => setPayload("category", value)} />
        <Field label="Website chính thức" value={item.websiteUrl ?? ""} onChange={(websiteUrl) => setItem((current) => ({ ...current, websiteUrl }))} />
        <Field label="Endpoint URL" value={String(payload.endpointUrl)} onChange={(value) => setPayload("endpointUrl", value)} placeholder="https://openrouter.ai/api/v1" />
        <Field label="Image URL" value={String(payload.imageUrl)} onChange={(value) => setPayload("imageUrl", value)} />
        <label className="space-y-1"><span className="text-sm font-medium">Hình thức</span><select className={aiToolFieldClass} value={item.isPaid ? "paid" : "free"} onChange={(event) => setItem((current) => ({ ...current, isPaid: event.target.value === "paid" }))}><option value="free">Miễn phí</option><option value="paid">Trả phí</option></select></label>
        <Field label="Giá (VNĐ)" type="number" disabled={!item.isPaid} value={item.isPaid ? String(payload.price || "") : ""} onChange={(value) => setPayload("price", Number(value) || 0)} />
        <label className="space-y-1 md:col-span-2"><span className="text-sm font-medium">Mô tả</span><textarea className={areaClass} value={String(payload.description)} onChange={(event) => setPayload("description", event.target.value)} /></label>
        <label className="space-y-1 md:col-span-2"><span className="text-sm font-medium">Models JSON</span><textarea className={`${areaClass} min-h-56 font-mono`} value={modelsText} onChange={(event) => setModelsText(event.target.value)} /><span className="text-xs text-slate-500">Mỗi model chỉ gồm: {`{ "id": "...", "isActive": true }`}.</span></label>
      </div>
      <div className="mt-6 flex items-center justify-between border-t pt-5"><label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={item.isPublic} onChange={(event) => setItem((current) => ({ ...current, isPublic: event.target.checked }))}/> Public API</label><button type="button" disabled={pending || !item.itemKey || !item.title || !String(payload.category).trim() || !String(payload.imageUrl).trim() || !String(payload.endpointUrl).trim()} onClick={save} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-blue-600 px-5 font-semibold text-white disabled:opacity-50"><Save size={17}/>{pending ? "Đang lưu..." : "Lưu API"}</button></div>
    </AdminPanel>
  </div>;
}

function Field({ label, value, onChange, placeholder, type = "text", disabled = false }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string; disabled?: boolean }) {
  return <label className="space-y-1"><span className="text-sm font-medium">{label}</span><input type={type} disabled={disabled} className={aiToolFieldClass} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} /></label>;
}
