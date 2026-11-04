"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { bulkDeleteApiModels, bulkDeleteApiProviders, syncFreeApiModelsAction, upsertApiModel, type AiToolConfig } from "../../actions";

type ModelRow = { key: string; providerKey: string; providerTitle: string; id: string; isActive: boolean };

function SelectionBar({ count, pending, onDelete }: { count: number; pending: boolean; onDelete: () => void }) {
  if (!count) return null;
  return <div className="flex flex-wrap items-center justify-between gap-3 border-b border-blue-200 bg-blue-50 px-5 py-3 text-sm text-blue-800"><span className="font-semibold">Đã chọn {count} mục</span><button type="button" disabled={pending} onClick={onDelete} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-red-600 px-4 font-semibold text-white disabled:opacity-50"><Trash2 size={17}/>{pending ? "Đang xóa..." : "Xóa đã chọn"}</button></div>;
}

export function ApiProviderTable({ providers }: { providers: AiToolConfig[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();
  const allSelected = providers.length > 0 && selected.length === providers.length;
  const remove = () => startTransition(async () => {
    if (!confirm(`Xóa ${selected.length} API Provider và toàn bộ models bên trong?`)) return;
    const result = await bulkDeleteApiProviders(selected);
    if (!result.ok) { toast.error(result.message); return; }
    toast.success(`Đã xóa ${result.deletedCount} API Provider`); setSelected([]);
  });
  return <div>
    <div className="flex flex-wrap gap-3 border-b p-5"><Link href="/ai-tools/api-providers/new" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-blue-600 px-4 font-semibold text-white"><Plus size={18}/> Tạo API Provider</Link></div>
    <SelectionBar count={selected.length} pending={pending} onDelete={remove}/>
    <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-slate-600"><tr><th className="w-14 p-4"><input aria-label="Chọn tất cả API Provider" type="checkbox" checked={allSelected} onChange={() => setSelected(allSelected ? [] : providers.map((item) => item.itemKey))}/></th><th className="p-4">API Provider</th><th className="p-4">Endpoint</th><th className="p-4">Models</th><th className="p-4">Trạng thái</th><th className="p-4 text-right">Thao tác</th></tr></thead><tbody className="divide-y">{providers.map((provider) => { const models = Array.isArray(provider.payload?.models) ? provider.payload.models : []; return <tr key={provider.itemKey}><td className="p-4"><input aria-label={`Chọn ${provider.title}`} type="checkbox" checked={selected.includes(provider.itemKey)} onChange={() => setSelected((current) => current.includes(provider.itemKey) ? current.filter((key) => key !== provider.itemKey) : [...current, provider.itemKey])}/></td><td className="p-4"><p className="font-semibold">{provider.title}</p><p className="text-xs text-slate-500">{provider.itemKey}</p></td><td className="p-4 font-mono text-xs">{String(provider.payload?.endpointUrl ?? "—")}</td><td className="p-4">{models.length}</td><td className="p-4">{provider.isPublic ? "Public" : "Private"}</td><td className="p-4 text-right"><Link href={`/ai-tools/api-providers/${encodeURIComponent(provider.itemKey)}/edit`} className="inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 font-semibold"><Pencil size={16}/> Sửa</Link></td></tr>; })}</tbody></table></div>
  </div>;
}

export function ApiModelTable({ providers }: { providers: AiToolConfig[] }) {
  const rows = useMemo<ModelRow[]>(() => providers.flatMap((provider) => (Array.isArray(provider.payload?.models) ? provider.payload.models : []).flatMap((model) => { if (!model || typeof model !== "object") return []; const value = model as { id?: unknown; isActive?: unknown }; if (typeof value.id !== "string") return []; return [{ key: `${provider.itemKey}:${value.id}`, providerKey: provider.itemKey, providerTitle: provider.title, id: value.id, isActive: value.isActive !== false }]; })), [providers]);
  const [selected, setSelected] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();
  const [providerKey, setProviderKey] = useState(providers[0]?.itemKey ?? "");
  const [modelId, setModelId] = useState("");
  const allSelected = rows.length > 0 && selected.length === rows.length;
  const remove = () => startTransition(async () => {
    if (!confirm(`Xóa ${selected.length} API Model đã chọn?`)) return;
    const targets = rows.filter((row) => selected.includes(row.key)).map((row) => ({ providerKey: row.providerKey, modelId: row.id }));
    const result = await bulkDeleteApiModels(targets);
    if (!result.ok) { toast.error(result.message); return; }
    toast.success(`Đã xóa ${result.deletedCount} API Model`); setSelected([]);
  });
  const sync = () => startTransition(async () => { const result = await syncFreeApiModelsAction(); if (!result.ok) { toast.error(result.message); return; } toast.success("Đã đồng bộ models OpenRouter"); });
  const saveModel = () => startTransition(async () => { const result = await upsertApiModel({ providerKey, id: modelId.trim(), isActive: true }); if (!result.ok) { toast.error(result.message); return; } toast.success("Đã lưu API Model"); setModelId(""); });
  return <div>
    <div className="flex flex-wrap gap-3 border-b p-5"><select aria-label="API Provider" className="min-h-11 rounded-lg border px-3" value={providerKey} onChange={(event) => setProviderKey(event.target.value)}>{providers.map((provider) => <option key={provider.itemKey} value={provider.itemKey}>{provider.title}</option>)}</select><input aria-label="Model ID" className="min-h-11 min-w-64 rounded-lg border px-3" value={modelId} onChange={(event) => setModelId(event.target.value)} placeholder="google/gemini-2.5-pro"/><button type="button" disabled={pending || !providerKey || !modelId.trim()} onClick={saveModel} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-blue-600 px-4 font-semibold text-white disabled:opacity-50"><Plus size={18}/> Thêm Model</button><button type="button" disabled={pending} onClick={sync} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 font-semibold text-blue-700"><RefreshCw size={18} className={pending ? "animate-spin" : ""}/> Đồng bộ OpenRouter</button></div>
    <SelectionBar count={selected.length} pending={pending} onDelete={remove}/>
    <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-slate-50 text-slate-600"><tr><th className="w-14 p-4"><input aria-label="Chọn tất cả API Model" type="checkbox" checked={allSelected} onChange={() => setSelected(allSelected ? [] : rows.map((row) => row.key))}/></th><th className="p-4">Model ID</th><th className="p-4">API Provider</th><th className="p-4">Trạng thái</th></tr></thead><tbody className="divide-y">{rows.map((row) => <tr key={row.key}><td className="p-4"><input aria-label={`Chọn ${row.id}`} type="checkbox" checked={selected.includes(row.key)} onChange={() => setSelected((current) => current.includes(row.key) ? current.filter((key) => key !== row.key) : [...current, row.key])}/></td><td className="p-4 font-mono text-xs font-semibold">{row.id}</td><td className="p-4">{row.providerTitle}</td><td className="p-4">{row.isActive ? "Active" : "Inactive"}</td></tr>)}</tbody></table></div>
  </div>;
}
