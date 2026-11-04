import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/Layouts/admin-surface";
import { ResourceForm } from "../../../_components/resource-form";
import { fetchAiToolConfigs } from "../../../actions";

export default async function Page({ params }: { params: Promise<{ itemKey: string }> }) {
  const { itemKey } = await params;
  const item = (await fetchAiToolConfigs("stem")).find(
    (entry) => entry.itemKey === decodeURIComponent(itemKey),
  );
  if (!item) notFound();
  return (
    <div className="space-y-4">
      <AdminPageHeader eyebrow="STEM / Robotics" title={`Chỉnh sửa: ${item.title}`} />
      <ResourceForm type="stem" initialItem={item} />
    </div>
  );
}
