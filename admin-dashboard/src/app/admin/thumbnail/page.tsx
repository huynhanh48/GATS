import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/Layouts/admin-surface";
import { MediaManager } from "@/components/media/media-manager";

export const metadata: Metadata = {
  title: "Quản lý Thumbnail",
};

export default function ThumbnailPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Media Library"
        title="Quản lý Thumbnail"
        description="Tải lên và quản lý ảnh đại diện cho khóa học, bài viết và nội dung public."
        metrics={[
          { label: "Loại", value: "Image", tone: "blue" },
          { label: "Định dạng", value: "JPEG, PNG, WEBP", tone: "green" },
          { label: "Tối đa", value: "10MB", tone: "orange" },
        ]}
      />
      <MediaManager kind="thumbnail" />
    </div>
  );
}
