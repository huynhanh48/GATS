import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/Layouts/admin-surface";
import { MediaManager } from "@/components/media/media-manager";

export const metadata: Metadata = {
  title: "Quản lý Files",
};

export default function FilePage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Media Library"
        title="Quản lý Files"
        description="Tải lên và quản lý tài liệu dùng trong khóa học, bài viết và tài nguyên học tập."
        metrics={[
          { label: "Loại", value: "File", tone: "blue" },
          { label: "Định dạng", value: "PDF, Word, Excel, Ảnh", tone: "green" },
          { label: "Tối đa", value: "500MB", tone: "orange" },
        ]}
      />
      <MediaManager kind="file" />
    </div>
  );
}
