import type { Metadata } from "next";
import { MediaManager } from "@/components/media/media-manager";

export const metadata: Metadata = {
  title: "Quản lý Thumbnail",
};

export default function ThumbnailPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-y-4 rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div>
          <h2 className="text-title-md2 font-bold text-dark dark:text-white">
            Quản lý Thumbnail
          </h2>
          <p className="mt-1 text-sm text-body">
            Tải lên và quản lý ảnh thumbnail (JPEG, PNG, WEBP, GIF)
          </p>
        </div>
      </div>
      <MediaManager kind="thumbnail" />
    </div>
  );
}
