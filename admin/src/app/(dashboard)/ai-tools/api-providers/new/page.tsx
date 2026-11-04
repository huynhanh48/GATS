import { AdminPageHeader } from "@/components/Layouts/admin-surface";
import { ApiProviderForm } from "../../api-models/_components/api-provider-form";

export default function Page() {
  return <div className="space-y-4"><AdminPageHeader eyebrow="Công cụ AI / API Providers" title="Tạo API Provider" description="Thêm provider, endpoint và danh sách models."/><ApiProviderForm/></div>;
}
