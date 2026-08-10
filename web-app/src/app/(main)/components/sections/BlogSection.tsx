import React from "react";
import Link from "next/link";
import { resolveMediaUrl } from "@/lib/media/url";
import type { Post } from "@/types/post";
import styles from "./BlogSection.module.css";

const asset = (path: string) => `/edubost-reference/img/${path}`;

function cleanCategoryTag(name?: string, defaultTag = "AI"): string {
  if (!name) return `#${defaultTag}`;
  // Strip emojis or extra symbols
  const cleaned = name.replace(/[^\w\s\u00C0-\u024F\u1EA0-\u1EF9]/gi, "").trim();
  return `#${cleaned || defaultTag}`;
}

export function BlogSection({ posts }: { posts: Post[] }) {
  if (!posts || posts.length === 0) return null;

  const leftPosts = posts.slice(0, 2);
  const centerPost = posts[2] || posts[0];
  const rightPosts = posts.slice(3, 5);

  return (
    <section
      className="blog pt-115 pb-120 bg_img pos-rel"
      style={{ backgroundImage: `url(${asset("bg/news_bg01.jpg")})` }}
    >
      <div className={styles.container}>
        {/* Header */}
        <div className={`${styles.header} blog-sec-top`}>
          <div className="section-title">
            <span className="sub-title block text-[15px] font-bold text-[#FF6B00] uppercase tracking-wider mb-2">
              Tin Tức &amp; Tri Thức AI
            </span>
            <h2 className="title text-[36px] md:text-[44px] font-heading font-extrabold text-[#170006]">
              Cập Nhật Công Nghệ AI
            </h2>
          </div>
          <div className="xb-topic shrink-0">
            <Link
              className="thm-btn thm-btn--stroke-black px-6 py-3 rounded-full border border-[#170006] text-[#170006] hover:bg-[#170006] hover:text-white transition-all font-bold text-[14px]"
              href="/posts"
            >
              Tất Cả Bài Viết
            </Link>
          </div>
        </div>

        {/* 3-Column Asymmetric Grid Layout (Balanced 30% : 40% : 30% ratio) */}
        <div className={styles.grid}>
          {/* Left Column (2 Small Cards Stacked: 250px + 20px gap + 250px = 520px) */}
          <div className={styles.side}>
            {leftPosts.map((post, idx) => (
              <article
                className={`${styles.smallCard} xb-blog relative rounded-[16px] overflow-hidden shadow-md group bg-[#170006]`}
                key={post.id || idx}
              >
                <Link href={`/posts/${post.slug}`} className="block h-full w-full relative">
                  <img
                    src={resolveMediaUrl(
                      post.thumbnail,
                      asset(idx === 0 ? "news/news-img01.jpg" : "news/news-img02.png")
                    )}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Dark Gradient Overlay */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(23, 0, 6, 0) 20%, rgba(23, 0, 6, 0.88) 75%, #170006 100%)",
                    }}
                  />
                  {/* Content Holder */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                    <span className="inline-block px-3 py-1 text-[12px] font-semibold text-white bg-black/40 border border-[#FBB040]/70 backdrop-blur-xs rounded-full mb-2">
                      {cleanCategoryTag(post.category?.name, "Study")}
                    </span>
                    <h3 className="font-heading text-[17px] sm:text-[19px] font-bold text-white leading-[1.3] line-clamp-2 group-hover:text-[#FBB040] transition-colors">
                      {post.title}
                    </h3>
                  </div>
                </Link>
              </article>
            ))}
          </div>

          {/* Center Column (1 Featured Tall Card: 520px height) */}
          <div className={styles.center}>
            <article className={`${styles.featureCard} xb-blog relative rounded-[16px] overflow-hidden shadow-lg group bg-[#170006]`}>
              <Link href={`/posts/${centerPost.slug}`} className="block h-full w-full relative">
                <img
                  src={resolveMediaUrl(centerPost.thumbnail, asset("news/news-img03.png"))}
                  alt={centerPost.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Dark Gradient Overlay */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(23, 0, 6, 0) 25%, rgba(23, 0, 6, 0.92) 80%, #170006 100%)",
                  }}
                />
                {/* Content Holder */}
                <div className="absolute bottom-0 left-0 right-0 p-7 z-10">
                  <span className="inline-block px-3.5 py-1 text-[12px] font-semibold text-white bg-black/40 border border-[#FBB040]/70 backdrop-blur-xs rounded-full mb-3">
                    {cleanCategoryTag(centerPost.category?.name, "Study programs")}
                  </span>
                  <h2 className="font-heading text-[22px] sm:text-[25px] font-bold text-white leading-[1.3] line-clamp-2 group-hover:text-[#FBB040] transition-colors mb-3">
                    {centerPost.title}
                  </h2>
                  {/* Meta Bar */}
                  <div className="flex items-center gap-5 text-[13px] text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <i className="far fa-user text-[#FBB040]" /> {centerPost.author?.userName ?? "EDUGATS"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <i className="far fa-clock text-[#FBB040]" />{" "}
                      {new Date(centerPost.publishedAt ?? centerPost.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <i className="far fa-comment text-[#FBB040]" /> {centerPost.commentCount ?? 0}
                    </span>
                  </div>
                </div>
              </Link>
            </article>
          </div>

          {/* Right Column (2 Small Cards Stacked: 250px + 20px gap + 250px = 520px) */}
          <div className={styles.side}>
            {rightPosts.length > 0
              ? rightPosts.map((post, idx) => (
                  <article
                    className={`${styles.smallCard} xb-blog relative rounded-[16px] overflow-hidden shadow-md group bg-[#170006]`}
                    key={post.id || idx}
                  >
                    <Link href={`/posts/${post.slug}`} className="block h-full w-full relative">
                      <img
                        src={resolveMediaUrl(
                          post.thumbnail,
                          asset(`news/news-img0${idx + 4}.png`)
                        )}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Dark Gradient Overlay */}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background:
                            "linear-gradient(180deg, rgba(23, 0, 6, 0) 20%, rgba(23, 0, 6, 0.88) 75%, #170006 100%)",
                        }}
                      />
                      {/* Content Holder */}
                      <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                        <span className="inline-block px-3 py-1 text-[12px] font-semibold text-white bg-black/40 border border-[#FBB040]/70 backdrop-blur-xs rounded-full mb-2">
                          {cleanCategoryTag(post.category?.name, idx === 0 ? "Awarded" : "Campus Life")}
                        </span>
                        <h3 className="font-heading text-[17px] sm:text-[19px] font-bold text-white leading-[1.3] line-clamp-2 group-hover:text-[#FBB040] transition-colors">
                          {post.title}
                        </h3>
                      </div>
                    </Link>
                  </article>
                ))
              : leftPosts.map((post, idx) => (
                  <article
                    className={`${styles.smallCard} xb-blog relative rounded-[16px] overflow-hidden shadow-md group bg-[#170006]`}
                    key={"dup-" + (post.id || idx)}
                  >
                    <Link href={`/posts/${post.slug}`} className="block h-full w-full relative">
                      <img
                        src={resolveMediaUrl(
                          post.thumbnail,
                          asset(idx === 0 ? "news/news-img04.png" : "news/news-img05.png")
                        )}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Dark Gradient Overlay */}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background:
                            "linear-gradient(180deg, rgba(23, 0, 6, 0) 20%, rgba(23, 0, 6, 0.88) 75%, #170006 100%)",
                        }}
                      />
                      {/* Content Holder */}
                      <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                        <span className="inline-block px-3 py-1 text-[12px] font-semibold text-white bg-black/40 border border-[#FBB040]/70 backdrop-blur-xs rounded-full mb-2">
                          {cleanCategoryTag(post.category?.name, idx === 0 ? "Awarded" : "Campus Life")}
                        </span>
                        <h3 className="font-heading text-[17px] sm:text-[19px] font-bold text-white leading-[1.3] line-clamp-2 group-hover:text-[#FBB040] transition-colors">
                          {post.title}
                        </h3>
                      </div>
                    </Link>
                  </article>
                ))}
          </div>
        </div>

        {/* Bottom CTA Button */}
        <div className={styles.bottom}>
          <Link
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#170006] text-white hover:bg-[#FF6B00] transition-all duration-300 font-extrabold text-[15px] shadow-lg"
            href="/posts"
          >
            XEM TẤT CẢ BÀI VIẾT
            <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <svg
                width="16"
                height="16"
                viewBox="0 0 21 21"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10.4795 21C9.10959 21 7.81507 20.7539 6.59589 20.2617C5.37671 19.7695 4.30137 19.0962 3.36986 18.2417C2.43836 17.3872 1.67808 16.3857 1.08904 15.2373C0.486301 14.0752 0.123288 12.8311 0 11.5049V11.4639H8.56849V14.3145C8.56849 14.5742 8.66096 14.7998 8.84589 14.9912C9.03082 15.1826 9.25342 15.2783 9.5137 15.2783C9.65068 15.2783 9.7774 15.251 9.89384 15.1963C10.0103 15.1416 10.1096 15.0732 10.1918 14.9912L14.0137 11.1768C14.0959 11.0947 14.1644 10.9956 14.2192 10.8794C14.274 10.7632 14.3014 10.6367 14.3014 10.5C14.3014 10.3633 14.274 10.2368 14.2192 10.1206C14.1644 10.0044 14.0959 9.90527 14.0137 9.82324L10.1918 6.00879C10.1096 5.92676 10.0103 5.8584 9.89384 5.80371C9.7774 5.74902 9.65068 5.72168 9.5137 5.72168C9.25342 5.72168 9.0274 5.81738 8.83562 6.00879C8.64384 6.2002 8.54794 6.42578 8.54794 6.68555V9.53613H0C0.123288 8.19629 0.486301 6.94531 1.08904 5.7832C1.67808 4.62109 2.44178 3.61279 3.38014 2.7583C4.31849 1.90381 5.39041 1.23047 6.59589 0.738281C7.81507 0.246094 9.10959 0 10.4795 0C11.9315 0 13.2945 0.273439 14.5685 0.820312C15.8425 1.38086 16.9555 2.13623 17.9075 3.08643C18.8596 4.03662 19.6096 5.14746 20.1575 6.41895C20.7192 7.69043 21 9.05078 21 10.5C21 11.9492 20.7192 13.3096 20.1575 14.5811C19.6096 15.8662 18.8596 16.9839 17.9075 17.9341C16.9555 18.8843 15.8425 19.6328 14.5685 20.1797C13.2945 20.7266 11.9315 21 10.4795 21Z"
                  fill="currentColor"
                />
              </svg>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
