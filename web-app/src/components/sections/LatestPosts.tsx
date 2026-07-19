"use client";
import { motion } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";

import apiClient from "@/lib/apiClient";
import { PathApi } from "@/constants/PathApi";
import { PostListItem } from "../../../types/blog";
import { fallbackCourses } from "../../../fallback/course";

const gradients = [
  "from-blue-500 to-purple-600",
  "from-emerald-400 to-cyan-500",
  "from-violet-500 to-fuchsia-500",
  "from-orange-400 to-rose-500"
];

export function LatestPosts() {
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await apiClient.get<any>(PathApi.posts.list, {
          params: { take: "10", skip: "0", status: 'published' }
        });
        if (response && response.data) {
          setPosts(response.data);
        }
      } catch (error) {
        // Backend unavailable: fall back to static courses without alarming the user
        console.warn("Failed to fetch posts from backend, using fallback content:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <section className="w-full py-24 relative z-20 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                Bài viết <span className="text-primary">mới nhất</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl">
                Cập nhật những kiến thức mới nhất về ứng dụng Trí tuệ nhân tạo vào công việc thực tế.
              </p>
            </div>
          </div>

          <div className="flex gap-6 overflow-hidden pb-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-col animate-pulse shrink-0 w-[280px] sm:w-[320px] md:w-[360px]">
                <div className="w-full aspect-video rounded-xl bg-muted/20 mb-5 relative border border-border/40"></div>
                <div className="h-6 bg-muted/20 rounded mb-3 w-3/4"></div>
                <div className="h-4 bg-muted/20 rounded mb-2 w-full"></div>
                <div className="h-4 bg-muted/20 rounded mb-2 w-5/6"></div>
                <div className="h-5 bg-muted/20 rounded w-1/3 mt-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const displayPosts = posts.length > 0 
    ? posts.map((post, i) => ({
        title: post.title,
        description: post.excerpt || "Không có mô tả.",
        thumbnail: post.thumbnail,
        imageGradient: gradients[i % gradients.length],
        slug: post.slug,
        tags: post.tags || []
      }))
    : fallbackCourses;

  return (
    <section className="w-full py-24 relative z-20 bg-transparent overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Bài viết <span className="text-primary">mới nhất</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Cập nhật những kiến thức mới nhất về ứng dụng Trí tuệ nhân tạo vào công việc thực tế.
            </p>
          </div>
          <button className="text-primary hover:text-primary/80 font-medium flex items-center gap-2 group cursor-pointer">
            Xem tất cả
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>

        <div className="relative w-full">
          {/* Custom Navigation Buttons */}
          <button className="swiper-prev-btn absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-background/85 border border-border/40 backdrop-blur-md text-foreground flex items-center justify-center shadow-lg hover:bg-primary hover:text-primary-foreground hover:scale-110 active:scale-95 transition-all cursor-pointer disabled:opacity-0 disabled:pointer-events-none">
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button className="swiper-next-btn absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-background/85 border border-border/40 backdrop-blur-md text-foreground flex items-center justify-center shadow-lg hover:bg-primary hover:text-primary-foreground hover:scale-110 active:scale-95 transition-all cursor-pointer disabled:opacity-0 disabled:pointer-events-none">
            <ChevronRight className="w-6 h-6" />
          </button>

          <Swiper
            modules={[Navigation]}
            spaceBetween={24}
            slidesPerView={1}
            navigation={{
              prevEl: ".swiper-prev-btn",
              nextEl: ".swiper-next-btn",
            }}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
              1280: { slidesPerView: 4 },
            }}
            className="w-full pb-4"
          >
            {displayPosts.map((post, i) => (
              <SwiperSlide key={i} className="!h-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  viewport={{ once: true, margin: "-50px" }}
                  className="group flex flex-col h-full cursor-pointer"
                  onClick={() => {
                    if (post.slug && post.slug !== "#") {
                      window.location.href = `/posts/${post.slug}`;
                    }
                  }}
                >
                  {/* Image Container */}
                  <div className="w-full aspect-video rounded-xl overflow-hidden mb-5 relative border border-border/40 shadow-sm bg-black/10">
                    {post.thumbnail ? (
                      <img 
                        src={post.thumbnail} 
                        alt={post.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                      />
                    ) : (
                      <div className={`absolute inset-0 bg-gradient-to-br ${post.imageGradient} opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500`}></div>
                    )}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500"></div>
                    {/* Hover overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="px-3.5 py-1.5 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center border border-white/10 text-white text-xs font-medium">
                        Đọc bài viết
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col">
                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {post.tags.slice(0, 2).map((tag, idx) => (
                          <span 
                            key={idx} 
                            className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider"
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}

                    <h3 className="text-lg font-bold mb-3 text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>

                    <p className="text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-3">
                      {post.description}
                    </p>

                    <div className="mt-auto flex items-center gap-3">
                      <span className="text-sm font-semibold text-foreground">Xem thêm</span>
                      <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
