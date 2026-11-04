import { AdminPageHeader } from "@/components/Layouts/admin-surface";
import { ResourceForm } from "../../_components/resource-form";
export default function Page() { return <div className="space-y-4"><AdminPageHeader eyebrow="Công cụ AI / Tools" title="Tạo Tool mới" description="Thêm công cụ và hướng dẫn sử dụng dành cho quản trị."/><ResourceForm type="tool"/></div>; }
