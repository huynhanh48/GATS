import Link from "next/link";
import { Button } from "@/components/ui/button";

import { ContentState } from "@/components/ui/content-state";
import { PathApi } from "@/constants/PathApi";
import apiClient from "@/lib/apiClient";
import type { Post } from "@/types/post";
import { AnimatedContent } from "@/components/react-bits";
import { Container } from "@/components/layout/Container";
import { LatestPostsSlider } from "./LatestPostsSlider";

export async function LatestPosts() {
  let posts: Post[] = [];
  let error = false;

  try {
    const response = await apiClient.get(PathApi.posts.list, {
      params: { take: "6", skip: "0", status: "published" },
    });
    const payload = response as unknown as { data?: Post[] };
    posts = payload.data ?? [];
  } catch (err) {
    error = true;
  }

  return (
    <section className="w-full bg-white py-20 sm:py-24 overflow-hidden">
      <Container>
        {/* Header Section */}
        <AnimatedContent distance={25}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <h2 className="text-[3.2rem] md:text-[3.8rem] font-bold text-[#111827] font-heading leading-tight">
                Bài Viết Mới Nhất
              </h2>
              <p className="mt-2 text-[1.6rem] text-slate-500">
                Cập nhật kiến thức và xu hướng AI
              </p>
            </div>
            <Link href="/posts">
              <Button variant="outline" className="rounded-full border-slate-300 text-[1.4rem] font-semibold text-[#111827] hover:bg-slate-50 px-8 py-6">
                Tất cả bài viết
              </Button>
            </Link>
          </div>
        </AnimatedContent>

        {/* Posts Slider */}
        <div className="mt-12">
          {error ? (
            <ContentState
              tone="error"
              title="Chưa thể tải bài viết"
              description="Nội dung đang tạm thời không khả dụng."
            />
          ) : posts.length === 0 ? (
            <ContentState title="Bài viết đang được cập nhật" />
          ) : (
            <AnimatedContent distance={30} delay={0.2}>
              <LatestPostsSlider posts={posts} />
            </AnimatedContent>
          )}
        </div>
      </Container>
    </section>
  );
}
