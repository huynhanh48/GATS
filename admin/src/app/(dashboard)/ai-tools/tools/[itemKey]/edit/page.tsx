import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/Layouts/admin-surface";
import { ResourceForm } from "../../../_components/resource-form";
import { fetchAiToolConfigs } from "../../../actions";
export default async function Page({ params }: { params: Promise<{ itemKey: string }> }) { const { itemKey } = await params; const item = (await fetchAiToolConfigs("tool")).find((entry) => entry.itemKey === decodeURIComponent(itemKey)); if (!item) notFound(); return <div className="space-y-4"><AdminPageHeader eyebrow="Công cụ AI / Tools" title={`Chỉnh sửa: ${item.title}`}/><ResourceForm type="tool" initialItem={item}/></div>; }
