import type { Metadata } from "next";
import { MediaManager } from "@/components/media/media-manager";

export const metadata: Metadata = {
  title: "Quản lý Files",
};

export default function FilePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-y-4 rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div>
          <h2 className="text-title-md2 font-bold text-dark dark:text-white">
            Quản lý Files
          </h2>
          <p className="mt-1 text-sm text-body">
            Tải lên và quản lý tài liệu (PDF, DOC, DOCX, MD, TXT)
          </p>
        </div>
      </div>
      <MediaManager kind="file" />
    </div>
  );
}
