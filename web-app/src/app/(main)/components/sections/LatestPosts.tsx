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
    <section className="w-full bg-[#FAF8F5] text-[#0B0F17] py-24 border-t border-amber-200/60 overflow-hidden">
      <Container>
        {/* Header Section */}
        <AnimatedContent distance={25}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <span className="text-[1.2rem] font-bold text-[#FF6B00] uppercase tracking-wider mb-2 font-mono bg-[#FF6B00]/10 px-3.5 py-1 rounded-full border border-[#FF6B00]/20 inline-block">
                TIN TỨC &amp; KIẾN THỨC
              </span>
              <h2 className="text-[3.2rem] md:text-[3.8rem] font-bold text-[#0B0F17] font-heading leading-tight mt-2">
                Bài Viết Mới Nhất
              </h2>
              <p className="mt-2 text-[1.6rem] text-slate-600 font-medium">
                Cập nhật kiến thức và xu hướng AI
              </p>
            </div>
            <Link href="/posts">
              <Button variant="outline" className="rounded-full border-slate-300 bg-white text-[1.4rem] font-bold text-[#0B0F17] hover:bg-slate-50 px-8 py-6 shadow-xs">
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
