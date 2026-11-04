import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/Layouts/admin-surface";
import { fetchAiToolConfigs } from "../../../actions";
import { ApiModelEditForm } from "./api-model-edit-form";

export const dynamic="force-dynamic";
export const revalidate=0;

export default async function Page({params}:{params:Promise<{itemKey:string}>}){
  const {itemKey}=await params;
  const items=await fetchAiToolConfigs("api_provider");
  const item=items.find(candidate=>candidate.itemKey===decodeURIComponent(itemKey));
  if(!item)notFound();
  return <div className="space-y-4"><AdminPageHeader eyebrow="Công cụ AI / API Models" title={`Chỉnh sửa: ${item.title}`} description="Quản lý trạng thái hiển thị và liên kết chính thức của Model trên một trang riêng."/><ApiModelEditForm initialItem={item}/></div>;
}
