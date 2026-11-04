import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/Layouts/admin-surface";
import { fetchAiToolConfigs } from "../../../actions";
import { PromptEditForm } from "./prompt-edit-form";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page({ params }: { params: Promise<{ itemKey: string }> }) {
  const { itemKey } = await params;
  const items = await fetchAiToolConfigs("prompt");
  const item = items.find((candidate) => candidate.itemKey === decodeURIComponent(itemKey));
  if (!item) notFound();

  return <div className="space-y-4">
    <AdminPageHeader eyebrow="Công cụ AI / Prompts" title={`Chỉnh sửa: ${item.title}`} description="Chỉnh sửa toàn bộ giá trị của Prompt trên một trang riêng, tương tự luồng quản lý khóa học." />
    <PromptEditForm initialItem={item}/>
  </div>;
}
