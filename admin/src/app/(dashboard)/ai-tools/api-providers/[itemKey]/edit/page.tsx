import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/Layouts/admin-surface";
import { fetchAiToolConfigs } from "../../../actions";
import { ApiProviderForm } from "../../../api-models/_components/api-provider-form";

export default async function Page({ params }: { params: Promise<{ itemKey: string }> }) {
  const { itemKey } = await params;
  const providers = await fetchAiToolConfigs("api_provider");
  const provider = providers.find((item) => item.itemKey === decodeURIComponent(itemKey));
  if (!provider) notFound();
  return <div className="space-y-4"><AdminPageHeader eyebrow="Công cụ AI / API Providers" title={`Chỉnh sửa: ${provider.title}`} description="Cập nhật provider, endpoint và danh sách models."/><ApiProviderForm initialItem={provider}/></div>;
}
