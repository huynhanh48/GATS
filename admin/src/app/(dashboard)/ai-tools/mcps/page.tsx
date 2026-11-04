import { AdminPageHeader, AdminPanel } from "@/components/Layouts/admin-surface";
import { AiToolManager } from "../_components/ai-tool-manager";
import { fetchAiToolConfigs } from "../actions";

export default async function Page() {
  const items = await fetchAiToolConfigs("mcp");
  return <div className="space-y-4"><AdminPageHeader eyebrow="Công cụ AI" title="Quản lý MCP" description="Quản lý MCP Server, nhà cung cấp, cấu hình cài đặt và hình thức miễn phí hoặc trả phí." metrics={[{ label: "Tổng MCP", value: items.length, tone: "slate" }, { label: "Miễn phí", value: items.filter((item) => !item.isPaid).length, tone: "green" }, { label: "Trả phí", value: items.filter((item) => item.isPaid).length, tone: "orange" }]}/><AdminPanel title="Danh sách MCP" bodyClassName="p-0"><AiToolManager initialItems={items} mode="mcp"/></AdminPanel></div>;
}
