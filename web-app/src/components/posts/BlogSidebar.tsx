"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import apiClient from "@/lib/apiClient";
import { PathApi } from "@/constants/PathApi";
import type { CourseCategory } from "@/types/course";
import type { Post } from "@/types/post";
import { resolveMediaUrl } from "@/lib/media/url";

interface BlogSidebarProps {
  tocContent?: React.ReactNode;
  activeTag?: string | null;
  activeCategory?: string | null;
}

function postDate(post: Post) {
  const value = post.publishedAt || post.createdAt;
  return value ? new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value)) : "";
}

export const BlogSidebar = ({ tocContent, activeTag, activeCategory }: BlogSidebarProps = {}) => {
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [tags, setTags] = useState<Array<{ id: string; name: string; slug: string }>>([]);

  useEffect(() => {
    const fetchSidebarData = async () => {
      try {
        const [catRes, postRes, tagRes] = await Promise.all([
          apiClient.get(PathApi.categories.list, { params: { type: "post", status: "active" } }),
          apiClient.get(PathApi.posts.list, { params: { page: 1, limit: 3, status: "published" } }),
          apiClient.get(PathApi.tags.list, { params: { type: "post" } }),
        ]) as [any, any, any];
        setCategories(Array.isArray(catRes?.data) ? catRes.data : []);
        setRecentPosts(Array.isArray(postRes?.data) ? postRes.data : []);
        setTags(Array.isArray(tagRes?.data) ? tagRes.data : []);
      } catch (error) {
        console.error("Error fetching sidebar data:", error);
      }
    };
    void fetchSidebarData();
  }, []);

  return (
    <>
      {tocContent}

      <div className="post_list_block">
        <h3 className="sidebar_widget_title">Related Posts</h3>
        <ul className="unordered_list_block">
          {recentPosts.map((post, index) => (
            <li key={post.id}>
              <div className="post_image"><Link href={`/posts/${post.slug}`}><img src={post.thumbnail ? resolveMediaUrl(post.thumbnail) : `/edubost-reference/img/blog/blog_${String(9 + index).padStart(2, "0")}.jpg`} alt={post.title} /></Link></div>
              <div className="post_holder">
                <h3 className="post_title border-effect-2"><Link href={`/posts/${post.slug}`}>{post.title}</Link></h3>
                <Link className="post_date" href={`/posts/${post.slug}`}><i className="far fa-clock" aria-hidden="true" /> {postDate(post)}</Link>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="post_category_wrap">
        <h3 className="sidebar_widget_title">Categories</h3>
        <ul className="post_category_list unordered_list_block">
          {categories.map((category) => {
            const slug = category.slug || category.id;
            return <li key={category.id}><Link href={`/posts?category=${slug}`} aria-current={activeCategory === slug ? "page" : undefined}><i className="far fa-arrow-right" aria-hidden="true" /><span>{category.name}</span><span>({String(category.postCount ?? 0).padStart(2, "0")})</span></Link></li>;
          })}
        </ul>
      </div>

      <div className="popular_tags">
        <h3 className="sidebar_widget_title">Popular Tags</h3>
        <ul className="tags_list unordered_list">
          {tags.map((tag) => <li key={tag.id}><Link href={`/posts?tag=${tag.slug}`} aria-current={activeTag === tag.slug ? "page" : undefined}>{tag.name}</Link></li>)}
        </ul>
      </div>
    </>
  );
};
