import { AdminPageHeader } from "@/components/Layouts/admin-surface";
import { ResourceForm } from "../../_components/resource-form";

export default function Page() {
  return (
    <div className="space-y-4">
      <AdminPageHeader
        eyebrow="STEM / Robotics"
        title="Tạo mô-đun STEM mới"
        description="Thêm mô-đun STEM, học liệu AI & Robotics, linh kiện phần cứng và giáo trình thực hành."
      />
      <ResourceForm type="stem" />
    </div>
  );
}
