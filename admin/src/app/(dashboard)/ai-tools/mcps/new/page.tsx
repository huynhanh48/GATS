import { AdminPageHeader } from "@/components/Layouts/admin-surface";
import { ResourceForm } from "../../_components/resource-form";
export default function Page() { return <div className="space-y-4"><AdminPageHeader eyebrow="Công cụ AI / MCP" title="Tạo MCP mới" description="Thêm MCP Server và cấu hình cài đặt dành cho quản trị."/><ResourceForm type="mcp"/></div>; }
