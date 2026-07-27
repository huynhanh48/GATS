import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader, AdminPanel } from "@/components/Layouts/admin-surface";
import { fetchBannedWords } from "./actions";
import { BannedWordManager } from "./_components/banned-word-manager";

export const metadata: Metadata = {
  title: "Từ cấm bình luận",
};

export default async function BannedWordsPage() {
  const words = await fetchBannedWords();
  const active = words.filter((w) => w.isActive).length;

  return (
    <div className="space-y-4">
      <div className="text-sm text-slate-500">
        <Link href="/moderation" className="hover:text-[#0070EB] hover:underline">
          ← Hàng đợi bình luận
        </Link>
      </div>

      <AdminPageHeader
        eyebrow="Kiểm duyệt"
        title="Từ cấm"
        description="Khi bình luận chứa từ trong danh sách, hệ thống tự thay bằng dấu * (cùng độ dài). Không áp dụng ngược cho bình luận cũ."
        metrics={[
          { label: "Tổng từ", value: words.length, tone: "slate" },
          { label: "Đang lọc", value: active, tone: "green" },
        ]}
      />

      <AdminPanel
        title="Danh sách từ cấm"
        description="Khớp không phân biệt hoa/thường; cụm dài được ưu tiên."
        bodyClassName="p-0"
      >
        <BannedWordManager words={words} />
      </AdminPanel>
    </div>
  );
}
