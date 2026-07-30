import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/Layouts/admin-surface";
import { AiGenPlayground } from "./_components/ai-gen-playground";

export const metadata: Metadata = {
  title: "AI Gen (Viava v2 Test Tool)",
  description: "Công cụ thử nghiệm và quản lý các tính năng sinh nội dung AI Viava v2.0",
};

export default function AiGenPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Hệ thống AI"
        title="Công cụ Thử nghiệm AI Gen (Viava v2.0)"
        description="Kiểm tra trực quan các endpoint sinh Quiz AI, Learning Path v2, bài tập theo loại (MCQ, True/False, Fill-in-blank, Short-answer) và AI Coach Chat."
        metrics={[
          { label: "API Version", value: "Viava v2.0", tone: "blue" },
          { label: "Quiz Types Map", value: "4 Dạng", tone: "green" },
          { label: "Pipeline Status", value: "Ready", tone: "orange" },
        ]}
      />

      <AiGenPlayground />
    </div>
  );
}
