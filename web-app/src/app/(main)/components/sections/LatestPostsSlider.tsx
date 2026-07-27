"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay";

import Link from "next/link";
import { Calendar, FileText } from "lucide-react";
import { resolveMediaUrl } from "@/lib/media/url";
import type { Post } from "@/types/post";

export function LatestPostsSlider({ posts }: { posts: Post[] }) {
  return (
    <Swiper
      modules={[Autoplay, Pagination]}
      spaceBetween={32}
      slidesPerView={1}
      loop={true}
      breakpoints={{
        768: { slidesPerView: 2 },
        1024: { slidesPerView: 3 },
      }}
      autoplay={{ delay: 5000, disableOnInteraction: false }}
      pagination={{ clickable: true }}
      className="!pb-16"
    >
      {posts.map((post) => (
        <SwiperSlide key={post.id} className="h-auto">
          <Link
            href={`/posts/${post.slug}`}
            className="group block h-full rounded-2xl outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
          >
            <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-white border border-slate-200 transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] group-hover:border-transparent">
              {/* Thumbnail */}
              <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                {post.thumbnail ? (
                  <img
                    src={resolveMediaUrl(post.thumbnail)}
                    alt={post.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-300">
                    <FileText className="size-12" aria-hidden="true" />
                  </div>
                )}
              </div>
              
              {/* Content */}
              <div className="p-8 flex flex-col flex-1">
                <h3 className="line-clamp-2 text-[2rem] font-bold text-[#111827] leading-snug transition-colors group-hover:text-[#ff7622]">
                  {post.title}
                </h3>
                
                <div className="mt-4 flex items-center gap-2 text-[1.4rem] text-slate-500">
                  <Calendar className="size-4 text-[#ff7622]" />
                  <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                </div>
                
                <p className="mt-6 line-clamp-2 text-[1.5rem] leading-relaxed text-slate-500">
                  {post.excerpt || "Khám phá những kiến thức và xu hướng công nghệ trí tuệ nhân tạo mới nhất giúp bạn bứt phá trong công việc..."}
                </p>
              </div>
            </div>
          </Link>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
