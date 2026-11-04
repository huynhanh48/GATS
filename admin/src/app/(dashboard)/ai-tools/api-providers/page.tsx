import { AdminPageHeader, AdminPanel } from "@/components/Layouts/admin-surface";
import { fetchAiToolConfigs } from "../actions";
import { ApiProviderTable } from "../api-models/_components/api-resource-tables";

export default async function Page() {
  const providers = await fetchAiToolConfigs("api_provider");
  return <div className="space-y-4"><AdminPageHeader eyebrow="Công cụ AI" title="Quản lý API Providers" description="Quản lý nhà cung cấp API, endpoint và nhóm models." metrics={[{ label: "Tổng Provider", value: providers.length, tone: "slate" }, { label: "Public", value: providers.filter((item) => item.isPublic).length, tone: "green" }]}/><AdminPanel title="Danh sách API Providers" bodyClassName="p-0"><ApiProviderTable providers={providers}/></AdminPanel></div>;
}
