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

      <AiGenPlayground />
    </div>
  );
}
