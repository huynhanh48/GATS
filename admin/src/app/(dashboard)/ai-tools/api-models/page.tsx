import { AdminPageHeader, AdminPanel } from "@/components/Layouts/admin-surface";
import { fetchAiToolConfigs } from "../actions";
import { ApiModelTable } from "./_components/api-resource-tables";

export default async function Page() {
  const providers = await fetchAiToolConfigs("api_provider");
  const modelCount = providers.reduce((total, provider) => total + (Array.isArray(provider.payload?.models) ? provider.payload.models.length : 0), 0);
  return <div className="space-y-4"><AdminPageHeader eyebrow="Công cụ AI" title="Quản lý API Models" description="Quản lý models nằm trong từng API Provider." metrics={[{ label: "Tổng Model", value: modelCount, tone: "slate" }, { label: "Providers", value: providers.length, tone: "green" }]}/><AdminPanel title="Danh sách API Models" bodyClassName="p-0"><ApiModelTable providers={providers}/></AdminPanel></div>;
}
