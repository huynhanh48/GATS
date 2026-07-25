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
import { AnimatedContent } from "@/components/react-bits";

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
    <section className="w-full bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <AnimatedContent distance={25}>
          <SectionHeader
            eyebrow="Kiến thức mới"
            title="Bài viết mới nhất"
            description="Cập nhật hướng dẫn và kinh nghiệm ứng dụng AI vào công việc thực tế."
            href="/posts"
          />
        </AnimatedContent>
        <div className="mt-10">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-3">
              {Array.from({ length: 3 }, (_, index) => (
                <Skeleton key={index} className="aspect-4/5 rounded-2xl" />
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
              {posts.map((post, index) => (
                <AnimatedContent
                  key={post.id}
                  distance={30}
                  delay={index * 0.1}
                >
                  <Link
                    href={`/posts/${post.slug}`}
                    className="group block h-full rounded-3xl outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
                  >
                    <Surface className="h-full overflow-hidden rounded-3xl transition-all duration-300 group-hover:-translate-y-1.5 group-hover:border-brand-primary/40 group-hover:shadow-[var(--shadow-elevated)]">
                      <div className="aspect-16/10 overflow-hidden bg-accent">
                        {post.thumbnail ? (
                          <img
                            src={resolveMediaUrl(post.thumbnail)}
                            alt={post.title}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-brand-primary">
                            <FileText className="size-10" aria-hidden="true" />
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <p className="text-xs font-bold uppercase tracking-wider text-brand-primary">
                          {post.tags[0]?.name ?? "GATS AI"}
                        </p>
                        <h3 className="mt-2 line-clamp-2 text-lg font-bold font-heading leading-snug transition-colors group-hover:text-brand-primary">
                          {post.title}
                        </h3>
                        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground font-sans">
                          {post.excerpt || "Đọc bài viết để khám phá nội dung chi tiết."}
                        </p>
                        <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-brand-primary transition-transform duration-300 group-hover:translate-x-1">
                          Đọc bài viết
                          <ArrowUpRight className="size-4" aria-hidden="true" />
                        </span>
                      </div>
                    </Surface>
                  </Link>
                </AnimatedContent>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
