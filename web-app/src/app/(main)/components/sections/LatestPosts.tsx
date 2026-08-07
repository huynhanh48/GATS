import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { PathApi } from "@/constants/PathApi";
import apiClient from "@/lib/apiClient";
import type { Post } from "@/types/post";
import { resolveMediaUrl } from "@/lib/media/url";
import { ArrowRight, Calendar, User, MessageSquare } from "lucide-react";

function getApiOrigins(): string[] {
  const origins: string[] = [];
  if (process.env.INTERNAL_API_URL) origins.push(process.env.INTERNAL_API_URL);
  if (process.env.NEXT_PUBLIC_API_URL) origins.push(process.env.NEXT_PUBLIC_API_URL);
  if (process.env.API_REWRITE_ORIGIN) origins.push(process.env.API_REWRITE_ORIGIN);
  origins.push("http://be:3000");
  origins.push("https://api.gats.vn");
  origins.push("http://127.0.0.1:3000");
  return Array.from(new Set(origins.map((o) => o.replace(/\/$/, ""))));
}

const fallbackPosts: Partial<Post>[] = [
  {
    id: "fb-1",
    title: "Ứng Dụng ChatGPT & Claude API Tự Động Hóa Workflow Doanh Nghiệp 2026",
    slug: "ung-dung-chatgpt-claude-api",
    publishedAt: "2026-03-15",
    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    tags: [{ id: "t1", name: "Automation", slug: "automation", type: "post" }],
  },
  {
    id: "fb-2",
    title: "Khung Chuẩn Bảo Mật Dữ Liệu AI Doanh Nghiệp Tuyệt Đối An Toàn",
    slug: "khung-chuan-bao-mat-du-lieu-ai",
    publishedAt: "2026-03-12",
    thumbnail: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80",
    tags: [{ id: "t2", name: "Security", slug: "security", type: "post" }],
  },
  {
    id: "fb-3",
    title: "Hệ Thống Đào Tạo AI Thực Chiến GATS Academy Đạt Chứng Nhận Toàn Quốc",
    slug: "he-thong-dao-tao-ai-thuc-chien-gats",
    publishedAt: "2026-03-10",
    thumbnail: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80",
    tags: [{ id: "t3", name: "GATS News", slug: "gats-news", type: "post" }],
  },
  {
    id: "fb-4",
    title: "Khai Phá 80% Năng Suất Với Luồng Công Việc Multi-Agent N8N & Make",
    slug: "khai-pha-80-nang-suat-workflow",
    publishedAt: "2026-03-08",
    thumbnail: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80",
    tags: [{ id: "t4", name: "Workflow", slug: "workflow", type: "post" }],
  },
  {
    id: "fb-5",
    title: "Chi Thắng Với Xu Hướng AI Marketing & Sáng Tạo Kịch Bản Nội Dung Mass",
    slug: "xu-huong-ai-marketing",
    publishedAt: "2026-03-05",
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80",
    tags: [{ id: "t5", name: "Marketing", slug: "marketing", type: "post" }],
  },
];

export async function LatestPosts() {
  let posts: Post[] = [];
  const origins = getApiOrigins();

  for (const base of origins) {
    try {
      const res = await fetch(`${base}${PathApi.posts.list}?take=5&skip=0&status=published`, {
        next: { revalidate: 60 },
      });
      if (res.ok) {
        const payload = await res.json();
        posts = payload.data || [];
        if (posts.length > 0) break;
      }
    } catch {
      // continue next
    }
  }

  const displayPosts = posts.length >= 5 ? posts : (fallbackPosts as Post[]);
  const p1 = displayPosts[0];
  const p2 = displayPosts[1];
  const mainPost = displayPosts[2];
  const p4 = displayPosts[3];
  const p5 = displayPosts[4];

  return (
    <section className="blog w-full py-24 bg-[#FAF8F5] text-[#0B0F17] border-t border-amber-200/60 overflow-hidden">
      <Container size="xl">
        {/* Header (Edubost blog-sec-top) */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-6">
          <div className="section-title">
            <span className="sub-title text-[1.2rem] font-bold text-[#FF6B00] uppercase tracking-wider mb-2 font-mono bg-[#FF6B00]/10 px-3.5 py-1 rounded-full border border-[#FF6B00]/20 inline-block">
              TIN TỨC &amp; TRI THỨC AI
            </span>
            <h2 className="title text-[3.4rem] sm:text-[4.2rem] font-heading font-extrabold text-[#0B0F17] leading-tight">
              Cập Nhật Công Nghệ AI Doanh Nghiệp
            </h2>
          </div>
          <Link
            href="/posts"
            className="inline-flex items-center gap-2 text-[1.45rem] font-bold text-[#FF6B00] hover:text-[#e05e00] transition-colors"
          >
            <span>Tất cả bài viết</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* 3-Column Asymmetric Grid Layout (Exact Edubost Campus News Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Column 1 (Left 2 Stacked Small Cards) */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            {[p1, p2].map((post) => (
              <Link
                key={post.id}
                href={`/posts/${post.slug}`}
                className="group relative flex flex-col overflow-hidden rounded-2xl bg-white border border-amber-200/80 shadow-md hover:shadow-xl hover:border-[#FF6B00] transition-all duration-300 flex-1"
              >
                <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                  <img
                    src={resolveMediaUrl(post.thumbnail, "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80")}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5 flex flex-col justify-between flex-1">
                  <span className="text-[1.1rem] font-bold text-[#FF6B00] font-mono uppercase mb-2">
                    #{post.tags?.[0]?.name || "AI News"}
                  </span>
                  <h3 className="text-[1.55rem] font-heading font-bold text-[#0B0F17] line-clamp-2 group-hover:text-[#FF6B00] transition-colors">
                    {post.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>

          {/* Column 2 (Center Large Featured Card) */}
          <div className="lg:col-span-6 flex">
            <Link
              href={`/posts/${mainPost.slug}`}
              className="group relative flex flex-col overflow-hidden rounded-3xl bg-white border border-amber-200/80 shadow-xl hover:shadow-2xl hover:border-[#FF6B00] transition-all duration-300 w-full"
            >
              <div className="aspect-[16/10] sm:aspect-[16/9] overflow-hidden bg-slate-100 relative">
                <img
                  src={resolveMediaUrl(mainPost.thumbnail, "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80")}
                  alt={mainPost.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <span className="absolute top-4 left-4 px-3.5 py-1 rounded-full bg-[#FF6B00] text-white text-[1.2rem] font-extrabold uppercase shadow-md">
                  #{mainPost.tags?.[0]?.name || "Featured"}
                </span>
              </div>
              <div className="p-8 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="text-[2.2rem] sm:text-[2.6rem] font-heading font-extrabold text-[#0B0F17] leading-tight mb-4 group-hover:text-[#FF6B00] transition-colors">
                    {mainPost.title}
                  </h3>
                  <p className="text-[1.5rem] text-slate-600 line-clamp-2 leading-relaxed mb-6 font-normal">
                    {mainPost.excerpt || "Khám phá chi tiết giải pháp ứng dụng trí tuệ nhân tạo chuẩn hóa trong quy trình vận hành doanh nghiệp..."}
                  </p>
                </div>

                <div className="flex items-center gap-6 pt-4 border-t border-slate-100 text-[1.3rem] text-slate-500 font-medium">
                  <div className="flex items-center gap-1.5">
                    <User className="size-4 text-[#FF6B00]" />
                    <span>Chuyên Gia GATS</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="size-4 text-[#FF6B00]" />
                    <span>{new Date(mainPost.publishedAt || Date.now()).toLocaleDateString("vi-VN")}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MessageSquare className="size-4 text-[#FF6B00]" />
                    <span>15 Bình luận</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Column 3 (Right 2 Stacked Small Cards) */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            {[p4, p5].map((post) => (
              <Link
                key={post.id}
                href={`/posts/${post.slug}`}
                className="group relative flex flex-col overflow-hidden rounded-2xl bg-white border border-amber-200/80 shadow-md hover:shadow-xl hover:border-[#FF6B00] transition-all duration-300 flex-1"
              >
                <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                  <img
                    src={resolveMediaUrl(post.thumbnail, "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80")}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5 flex flex-col justify-between flex-1">
                  <span className="text-[1.1rem] font-bold text-[#FF6B00] font-mono uppercase mb-2">
                    #{post.tags?.[0]?.name || "Article"}
                  </span>
                  <h3 className="text-[1.55rem] font-heading font-bold text-[#0B0F17] line-clamp-2 group-hover:text-[#FF6B00] transition-colors">
                    {post.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
