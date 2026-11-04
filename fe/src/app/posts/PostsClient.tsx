"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import apiClient from "@/lib/apiClient";
import { PathApi } from "@/constants/PathApi";
import type { Post } from "@/types/post";
import { resolveMediaUrl } from "@/lib/media/url";
import { PostCard } from "@/components/posts/PostCard";
import { BlogSidebar } from "@/components/posts/BlogSidebar";

function formatDate(post: Post) {
  const value = post.publishedAt || post.createdAt;
  return value ? new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value)) : "Gần đây";
}

export const PostsClient = () => {
  const searchParams = useSearchParams();
  const tagFilter = searchParams.get("tag")?.trim() || "";
  const categoryFilter = searchParams.get("category")?.trim() || "";
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 6;

  useEffect(() => setPage(1), [tagFilter, categoryFilter]);
  useEffect(() => {
    const timer = setTimeout(() => { setDebouncedSearch(searchQuery); setPage(1); }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    let cancelled = false;
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const params: Record<string, string | number> = { page, limit, status: "published" };
        if (categoryFilter) params.category = categoryFilter;
        if (tagFilter) params.tag = tagFilter;
        if (debouncedSearch) params.search = debouncedSearch;
        const data: any = await apiClient.get(PathApi.posts.list, { params });
        if (!cancelled) {
          setPosts(Array.isArray(data?.data) ? data.data : []);
          setTotalPages(data?.pagination?.totalPages || Math.ceil((data?.pagination?.total || 0) / limit) || 1);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
        if (!cancelled) { setPosts([]); setTotalPages(1); }
      } finally { if (!cancelled) setLoading(false); }
    };
    void fetchPosts();
    return () => { cancelled = true; };
  }, [categoryFilter, tagFilter, page, debouncedSearch]);

  const featured = posts[0];

  return (
    <div className="body_wrap">
      <section className="breadcrumb bg_img ul_li" style={{ backgroundImage: "url(/edubost-reference/img/bg/breadcrumb_bg.jpg)" }}>
        <div className="container"><div className="breadcrumb__content text-center"><h1 className="breadcrumb__title">Tin tức của chúng tôi</h1><p className="breadcrumb__desc">Thông báo và cập nhật mới nhất từ GATS Academy</p></div></div>
      </section>

      <section className="blog_section pt-120 pb-120" style={{ backgroundColor: "#F1F1E9" }}>
        <div className="container">
          {loading ? <div className="blog_post_block content_over_layout"><div className="blog_post_image"><div className="image_wrap"><img src="/edubost-reference/img/blog/blog_06.jpg" alt="" /></div></div><div className="blog_post_content"><p>Đang tải bài viết…</p></div></div> : null}

          {!loading && featured ? (
            <div className="blog_onecol_carousel overflow-hidden">
              <div className="swiper-wrapper"><div className="swiper-slide">
                <article className="blog_post_block content_over_layout">
                  <div className="blog_post_image"><Link className="image_wrap" href={`/posts/${featured.slug}`}><img src={featured.thumbnail ? resolveMediaUrl(featured.thumbnail) : "/edubost-reference/img/blog/blog_06.jpg"} alt={featured.title} /></Link></div>
                  <div className="blog_post_content">
                    <div className="post_meta_wrap"><Link className="post_category" href={`/posts?category=${featured.category?.slug || ""}`}>#{featured.category?.name || "Bài viết"}</Link><ul className="post_meta unordered_list"><li><Link href={`/posts/${featured.slug}`}><i className="far fa-clock" /> {formatDate(featured)}</Link></li></ul></div>
                    <h2 className="blog_post_title border-effect"><Link href={`/posts/${featured.slug}`}>{featured.title}</Link></h2>
                    <p className="mb-0">{featured.excerpt || "Khám phá nội dung mới nhất từ GATS Academy."}</p>
                  </div>
                </article>
              </div></div>
              <div className="b1cc-swiper-pagination p-0"><span className="swiper-pagination-bullet swiper-pagination-bullet-active" /></div>
            </div>
          ) : null}

          <div className="section_space pb-0"><div className="row mt-none-30">
            <div className="col-lg-8 mt-30" id="posts-list">
              {!loading && posts.length ? posts.map((post) => <PostCard key={post.id} post={post} isList />) : null}
              {!loading && !posts.length ? <div className="blog_post_block"><div className="blog_post_content text-center"><h2 className="blog_post_title">Không tìm thấy bài viết</h2><p>Thử điều chỉnh từ khóa hoặc bộ lọc.</p><Link className="thm-btn" href="/posts">Xóa bộ lọc</Link></div></div> : null}
              {totalPages > 1 ? <div className="pagination_wrap mt-60 pb-0"><ul className="pagination_nav unordered_list justify-content-center">
                <li><a href="#posts-list" onClick={(event) => { event.preventDefault(); setPage((value) => Math.max(1, value - 1)); }} aria-disabled={page === 1} aria-label="Trang trước"><i className="fas fa-angle-double-left" /></a></li>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((value) => <li key={value}><a href="#posts-list" className={value === page ? "current_page" : ""} onClick={(event) => { event.preventDefault(); setPage(value); }}>{value}</a></li>)}
                <li><a href="#posts-list" onClick={(event) => { event.preventDefault(); setPage((value) => Math.min(totalPages, value + 1)); }} aria-disabled={page === totalPages} aria-label="Trang sau"><i className="fas fa-angle-double-right" /></a></li>
              </ul></div> : null}
            </div>

            <div className="col-lg-4 mt-30"><aside className="sidebar ps-xl-5">
              <div className="search_form"><h3 className="sidebar_widget_title">Search</h3><div className="form-group"><label className="sr-only" htmlFor="post-search">Tìm bài viết</label><input id="post-search" className="form-control" type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search your keyword" /><button type="button" aria-label="Tìm kiếm"><img src="/edubost-reference/img/icon/icon_search.svg" alt="" /></button></div></div>
              {(categoryFilter || tagFilter) ? <div className="sidebar_widget"><h3 className="sidebar_widget_title">Bộ lọc đang dùng</h3><ul className="category_list_block unordered_list_block">{categoryFilter ? <li><Link href={tagFilter ? `/posts?tag=${tagFilter}` : "/posts"}>Danh mục: {categoryFilter} ×</Link></li> : null}{tagFilter ? <li><Link href={categoryFilter ? `/posts?category=${categoryFilter}` : "/posts"}>Từ khóa: {tagFilter} ×</Link></li> : null}</ul></div> : null}
              <BlogSidebar activeTag={tagFilter || null} activeCategory={categoryFilter || null} />
            </aside></div>
          </div></div>
        </div>
      </section>
    </div>
  );
};
