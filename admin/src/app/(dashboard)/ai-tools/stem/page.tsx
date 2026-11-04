import { AdminPageHeader, AdminPanel } from "@/components/Layouts/admin-surface";
import { AiToolManager } from "../_components/ai-tool-manager";
import { fetchAiToolConfigs } from "../actions";

export default async function Page() {
  const items = await fetchAiToolConfigs("stem");
  return (
    <div className="space-y-4">
      <AdminPageHeader
        eyebrow="Nội dung đào tạo"
        title="Quản lý STEM & Robotics"
        description="Quản lý các mô-đun STEM, học liệu Robotics & AI, chuẩn giáo dục, thiết bị phần cứng và hình thức đào tạo."
        metrics={[
          { label: "Tổng mô-đun", value: items.length, tone: "slate" },
          { label: "Miễn phí", value: items.filter((item) => !item.isPaid).length, tone: "green" },
          { label: "Trả phí", value: items.filter((item) => item.isPaid).length, tone: "orange" },
        ]}
      />
      <AdminPanel title="Danh sách mô-đun STEM" bodyClassName="p-0">
        <AiToolManager initialItems={items} mode="stem" />
      </AdminPanel>
    </div>
  );
}
