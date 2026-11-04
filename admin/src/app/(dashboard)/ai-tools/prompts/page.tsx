import { AdminPageHeader, AdminPanel } from "@/components/Layouts/admin-surface";
import { fetchAiToolConfigs } from "../actions";
import { AiToolManager } from "../_components/ai-tool-manager";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export default async function Page(){ const items=await fetchAiToolConfigs("prompt"); return <div className="space-y-4"><AdminPageHeader eyebrow="Công cụ AI" title="Quản lý Prompts" description="Chọn prompt được xuất hiện trên website và thiết lập miễn phí hoặc trả phí." metrics={[{label:"Tổng prompt",value:items.length,tone:"slate"},{label:"Public",value:items.filter(x=>x.isPublic).length,tone:"green"},{label:"Trả phí",value:items.filter(x=>x.isPaid).length,tone:"orange"}]}/><AdminPanel title="Danh sách Prompts" description="Thay đổi có hiệu lực trên trang Prompts sau khi lưu." bodyClassName="p-0"><AiToolManager initialItems={items} mode="prompt"/></AdminPanel></div> }
