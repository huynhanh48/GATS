import type { Metadata } from "next";
import { Suspense } from "react";
import { fetchTrashPosts } from "../actions";
import { PostPagination } from "../_components/post-pagination";
import { PostTrashTable } from "../_components/post-trash-table";

export const metadata: Metadata = {
  title: "Thùng rác bài viết",
};

type PostTrashPageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function PostTrashPage({
  searchParams,
}: PostTrashPageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const { data, pagination } = await fetchTrashPosts(page, 10);

  return (
    <div className="space-y-4">
      <PostTrashTable posts={data} />
      <Suspense fallback={null}>
        <PostPagination pagination={pagination} basePath="/admin/post/trash" />
      </Suspense>
    </div>
  );
}
