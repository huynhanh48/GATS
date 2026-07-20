import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminPageHeader } from "@/components/Layouts/admin-surface";
import { fetchPosts } from "./actions";
import { PostPagination } from "./_components/post-pagination";
import { PostTable } from "./_components/post-table";

export const metadata: Metadata = {
  title: "Bài viết",
};

type PostPageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function PostPage({ searchParams }: PostPageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const { data, pagination } = await fetchPosts(page, 10);

  return (
    <div className="space-y-4">
      <AdminPageHeader
        eyebrow="Content"
        title="Bài viết"
        description="Quản lý nội dung blog, trạng thái xuất bản và thao tác biên tập."
        metrics={[
          { label: "Trang", value: page, tone: "slate" },
          { label: "Đang hiển thị", value: data.length, tone: "blue" },
          { label: "Tổng", value: pagination.total, tone: "green" },
        ]}
      />
      <PostTable posts={data} />
      <Suspense fallback={null}>
        <PostPagination pagination={pagination} />
      </Suspense>
    </div>
  );
}
