"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, FileText } from "lucide-react";

import { SectionHeader } from "@/components/ted/section-header";
import { ContentState } from "@/components/ui/content-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Surface } from "@/components/ui/surface";
import { PathApi } from "@/constants/PathApi";
import apiClient from "@/lib/apiClient";
import { resolveMediaUrl } from "@/lib/media/url";
import type { PostListItem } from "../../../types/blog";

export function LatestPosts() {
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    apiClient
      .get(PathApi.posts.list, {
        params: { take: "3", skip: "0", status: "published" },
      })
      .then((response) => {
        if (!active) return;
        const payload = response as unknown as { data?: PostListItem[] };
        setPosts(payload.data ?? []);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="w-full bg-card py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="Kiến thức mới"
          title="Bài viết mới nhất"
          description="Cập nhật hướng dẫn và kinh nghiệm ứng dụng AI vào công việc thực tế."
          href="/posts"
        />
        <div className="mt-10">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-3">
              {Array.from({ length: 3 }, (_, index) => (
                <Skeleton key={index} className="aspect-[4/5] rounded-2xl" />
              ))}
            </div>
          ) : error ? (
            <ContentState
              tone="error"
              title="Chưa thể tải bài viết"
              description="Nội dung đang tạm thời không khả dụng."
            />
          ) : posts.length === 0 ? (
            <ContentState title="Bài viết đang được cập nhật" />
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.slug}`}
                  className="group rounded-2xl outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
                >
                  <Surface className="h-full overflow-hidden">
                    <div className="aspect-[16/10] overflow-hidden bg-accent">
                      {post.thumbnail ? (
                        <img
                          src={resolveMediaUrl(post.thumbnail)}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-brand-primary">
                          <FileText className="size-10" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-brand-primary">
                        {post.tags[0]?.name ?? "GATS Academy"}
                      </p>
                      <h3 className="mt-2 line-clamp-2 text-lg font-semibold leading-6 group-hover:text-brand-primary">
                        {post.title}
                      </h3>
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
                        {post.excerpt || "Đọc bài viết để khám phá nội dung chi tiết."}
                      </p>
                      <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-primary">
                        Đọc bài viết
                        <ArrowUpRight className="size-4" aria-hidden="true" />
                      </span>
                    </div>
                  </Surface>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
