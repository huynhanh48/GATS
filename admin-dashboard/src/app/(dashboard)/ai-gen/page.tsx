import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/Layouts/admin-surface";
import { AiGenPlayground } from "./_components/ai-gen-playground";

export const metadata: Metadata = {
  title: "Sinh Quiz AI",
  description: "Công cụ sinh câu hỏi Quiz bằng Viava",
};

export default function AiGenPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Hệ thống AI"
        title="Công cụ Sinh Quiz AI"
        description="Chọn bài quiz đích và nguồn nội dung để sinh câu hỏi tự động bằng Viava."
        metrics={[
          { label: "API Version", value: "Viava v2.0", tone: "blue" },
          { label: "Quiz Types Map", value: "4 Dạng", tone: "green" },
          { label: "Chế độ", value: "Sinh Quiz", tone: "orange" },
        ]}
      />

      <AiGenPlayground />
    </div>
  );
}
