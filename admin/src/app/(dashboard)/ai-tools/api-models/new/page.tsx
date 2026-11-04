import {AdminPageHeader} from "@/components/Layouts/admin-surface";
import {ApiModelCreateForm} from "./api-model-create-form";
export default function Page(){return <div className="space-y-4"><AdminPageHeader eyebrow="Công cụ AI / API Models" title="Tạo API Model mới" description="Thêm nhà cung cấp Model và nội dung hướng dẫn tích hợp lên website."/><ApiModelCreateForm/></div>}
