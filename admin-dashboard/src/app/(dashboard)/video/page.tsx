import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/Layouts/admin-surface";
import { VideoManager } from "./_components/video-manager";

export const metadata: Metadata = {
  title: "Quản lý Video",
};

export default function VideoPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Learning Media"
        title="Quản lý Video"
        description="Gắn video vào bài học, theo dõi trạng thái xử lý và quản lý kho video đã tải lên."
        metrics={[
          { label: "Phạm vi", value: "Bài học", tone: "blue" },
          { label: "Trạng thái", value: "Realtime", tone: "green" },
          { label: "Luồng", value: "Upload + List", tone: "orange" },
        ]}
      />
      <VideoManager />
    </div>
  );
}
