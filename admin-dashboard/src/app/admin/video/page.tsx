import type { Metadata } from "next";
import { VideoManager } from "./_components/video-manager";

export const metadata: Metadata = {
  title: "Quản lý Video",
};

export default function VideoPage() {
  return (
    <div className="space-y-6">
      <VideoManager />
    </div>
  );
}
