import { AdminPageHeader } from "@/components/Layouts/admin-surface";
import { PromptCreateForm } from "./prompt-create-form";

export default function Page() {
  return <div className="space-y-4">
    <AdminPageHeader eyebrow="Công cụ AI / Prompts" title="Tạo Prompt mới" description="Tạo một Prompt mới và thiết lập toàn bộ nội dung hiển thị trên website." />
    <PromptCreateForm />
  </div>;
}
