import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/apiClient';
import { PathApi } from '@/constants/PathApi';
import { CourseCategory } from '@/types/course';
import { Post } from '@/types/post';
import { resolveMediaUrl } from '@/lib/media/url';
import { cn } from '@/lib/utils';

interface BlogSidebarProps {
  tocContent?: React.ReactNode;
  activeTag?: string | null;
  activeCategory?: string | null;
}

export const BlogSidebar = ({
  tocContent,
  activeTag,
  activeCategory,
}: BlogSidebarProps = {}) => {
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [tags, setTags] = useState<{id: string, name: string, slug: string}[]>([]);
  
  useEffect(() => {
    const fetchSidebarData = async () => {
      try {
        const [catRes, postRes, tagRes] = await Promise.all([
          apiClient.get(PathApi.categories.list, { params: { type: 'post', status: 'active' } }),
          apiClient.get(PathApi.posts.list, { params: { page: 1, limit: 3, status: 'published' } }),
          apiClient.get(PathApi.tags.list, { params: { type: 'post' } })
        ]) as [any, any, any];
        
        if (catRes?.data) setCategories(catRes.data);
        if (postRes?.data) setRecentPosts(postRes.data);
        if (tagRes?.data) setTags(tagRes.data);
      } catch (error) {
        console.error('Error fetching sidebar data:', error);
      }
    };
    fetchSidebarData();
  }, []);

  return (
    <div className="w-full lg:w-[320px] shrink-0 space-y-10">
      {/* Category */}
      <div>
        <h3 className="text-[2rem] font-bold text-[#111827] font-heading mb-6 pb-2 border-b border-border/10">
          Danh mục
        </h3>
        <div className="space-y-4">
          {categories.map((opt) => {
            const slug = opt.slug || opt.id;
            const isActive = activeCategory === slug;
            return (
              <Link
                href={`/posts?category=${slug}`}
                key={opt.id}
                className={cn(
                  "w-full flex items-center justify-between text-[1.4rem] font-medium transition-colors",
                  isActive ? "text-primary" : "text-slate-600 hover:text-primary",
                )}
              >
                <span>{opt.name}</span>
                <span className="text-slate-400 font-normal">
                  {opt.postCount ?? 0}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {tocContent}

      {/* Recent Posts */}
      <div>
        <h3 className="text-[2rem] font-bold text-[#111827] font-heading mb-6 pb-2 border-b border-border/10">
          Bài viết mới
        </h3>
        <div className="space-y-6">
          {recentPosts.map((post) => {
            const date = post.publishedAt || post.createdAt
              ? new Intl.DateTimeFormat('vi-VN', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                }).format(new Date(post.publishedAt || post.createdAt))
              : '';
            return (
              <Link key={post.id} href={`/posts/${post.slug}`} className="flex gap-4 group">
                <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-slate-100">
                  {post.thumbnail && (
                    <img 
                      src={resolveMediaUrl(post.thumbnail)} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                    />
                  )}
                </div>
                <div className="flex flex-col">
                  <h4 className="text-[1.4rem] font-bold text-[#111827] line-clamp-2 group-hover:text-primary transition-colors leading-tight mb-2">
                    {post.title}
                  </h4>
                  <span className="text-[1.2rem] text-slate-500">
                    {date}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Tags */}
      <div>
        <h3 className="text-[2rem] font-bold text-[#111827] font-heading mb-6 pb-2 border-b border-border/10">
          Từ khóa
        </h3>
        <div className="flex flex-wrap gap-2">
          {tags.length > 0 ? (
            tags.map(tag => {
              const isActive = activeTag === tag.slug;
              return (
                <Link 
                  href={`/posts?tag=${tag.slug}`}
                  key={tag.id}
                  className={cn(
                    "px-4 py-2 text-[1.3rem] rounded-md border transition-colors",
                    isActive
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-slate-200 text-slate-600 hover:border-primary hover:text-primary",
                  )}
                >
                  {tag.name}
                </Link>
              );
            })
          ) : (
            <span className="text-slate-400 text-[1.3rem]">Không có từ khóa nào</span>
          )}
        </div>
      </div>
    </div>
  );
};
