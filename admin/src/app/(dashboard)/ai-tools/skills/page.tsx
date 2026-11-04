import {AdminPageHeader,AdminPanel} from "@/components/Layouts/admin-surface";
import {fetchAiToolConfigs} from "../actions";
import {AiToolManager} from "../_components/ai-tool-manager";
export const dynamic="force-dynamic";
export default async function Page(){const items=await fetchAiToolConfigs("skill");return <div className="space-y-4"><AdminPageHeader eyebrow="Công cụ AI" title="Quản lý Skills" description="Đăng file Markdown hoặc ZIP để người dùng tải về và làm theo hướng dẫn." metrics={[{label:"Tổng Skill",value:items.length,tone:"slate"},{label:"Miễn phí",value:items.filter(x=>!x.isPaid).length,tone:"green"},{label:"Trả phí",value:items.filter(x=>x.isPaid).length,tone:"orange"}]}/><AdminPanel title="Danh sách Skills" bodyClassName="p-0"><AiToolManager initialItems={items} mode="skill"/></AdminPanel></div>}
