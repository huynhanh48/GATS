'use client';

import React, { useEffect, useState } from 'react';
import { PostCard } from '@/components/posts/PostCard';
import { BlogSidebar } from '@/components/posts/BlogSidebar';
import apiClient from '@/lib/apiClient';
import { PathApi } from '@/constants/PathApi';
import { CourseCategory } from '@/types/course';
import { Post } from '@/types/post';
import { ChevronLeft, ChevronRight, Search, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Container } from '@/components/layout/Container';
import Link from 'next/link';
import { resolveMediaUrl } from '@/lib/media/url';
import { theme as designTheme } from '@/lib/theme';

export const PostsClient = () => {
  const [activeCategory, setActiveCategory] = useState<string | 'all'>('all');
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 6;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset page on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get(PathApi.categories.list, { params: { type: 'post', status: 'active' } });
        const data = response as any;
        if (data?.data && Array.isArray(data.data)) {
          setCategories(data.data);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Fetch Posts
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const params: any = { page, limit, status: 'published' };
        if (activeCategory && activeCategory !== 'all') {
          params.category = activeCategory;
        }
        if (debouncedSearch) {
          params.search = debouncedSearch;
        }
        const response = await apiClient.get(PathApi.posts.list, { params });
        const data = response as any;
        if (data?.data && Array.isArray(data.data)) {
          setPosts(data.data);
          
          if (isInitialLoad && !debouncedSearch && activeCategory === 'all' && page === 1) {
            setRecentPosts(data.data.slice(0, 3));
          }

          if (data.pagination) {
            setTotalPages(data.pagination.totalPages || Math.ceil(data.pagination.total / limit) || 1);
          } else {
            setTotalPages(1);
          }
        } else {
          setPosts([]);
          setTotalPages(1);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
        setPosts([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
        setIsInitialLoad(false);
      }
    };
    fetchPosts();
  }, [activeCategory, page, debouncedSearch, isInitialLoad]);

  const MOCK_TAGS = ['Free couses', 'Marketing', 'Idea', 'LMS', 'LearnPress', 'Instructor'];

  return (
    <div className="w-full flex flex-col relative z-10 bg-white">
      {/* Breadcrumb Area */}
      <div
        className="w-full bg-[#f8f9fa] py-4 border-b border-border/10"
        style={{
          marginTop: `calc(${designTheme.layout.headerHeight} + 1px)`,
        }}
      >
        <Container size="xl">
          <div className="text-[1.3rem] font-medium text-slate-500 flex items-center gap-2">
            <Link href="/" className="hover:text-primary transition-colors">Homepage</Link>
            <span>›</span>
            <span className="text-slate-800">Blog</span>
          </div>
        </Container>
      </div>

      <Container size="xl" className="py-12 md:py-16">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6 border-b border-border/10 pb-6">
          <h1 className="text-[2.8rem] md:text-[3.2rem] font-bold text-[#111827] font-heading">
            All Articles
          </h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-[260px] h-[4rem] border-b border-slate-300 bg-transparent px-2 pr-10 text-[1.4rem] text-slate-700 outline-none focus:border-primary transition-colors"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors">
                <Search className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setViewMode("grid")}
                className={`w-[4rem] h-[4rem] flex items-center justify-center transition-colors ${viewMode === 'grid' ? 'text-primary' : 'text-slate-400 hover:text-primary'}`}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setViewMode("list")}
                className={`w-[4rem] h-[4rem] flex items-center justify-center transition-colors ${viewMode === 'list' ? 'text-primary' : 'text-slate-400 hover:text-primary'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-12 min-h-[600px]">
          
          {/* Main Content (Posts) */}
          <div className="flex-1 flex flex-col">
            {isInitialLoad ? (
              <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-8" : "flex flex-col gap-8"}>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="animate-pulse bg-muted rounded-xl h-[360px] w-full"></div>
                ))}
              </div>
            ) : (
              <div className={cn("flex flex-col flex-1 transition-all duration-300", loading ? "opacity-50 pointer-events-none" : "opacity-100")}>
                {posts.length > 0 ? (
                  <>
                    <motion.div layout className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-8 mb-12" : "flex flex-col gap-8 mb-12"}>
                      <AnimatePresence mode="popLayout">
                        {posts.map(post => (
                          <motion.div
                            key={post.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className="h-full"
                          >
                            <PostCard post={post} isList={viewMode === 'list'} />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </motion.div>

                    {/* Pagination */}
                    {true && (
                      <div className="flex justify-center mt-auto pb-10">
                        <div className="flex select-none items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                            disabled={page === 1}
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-all hover:border-primary hover:bg-primary hover:text-white disabled:pointer-events-none disabled:opacity-30"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setPage(p)}
                              className={`flex h-10 w-10 items-center justify-center rounded-full text-[1.4rem] font-bold transition-all ${
                                page === p
                                  ? "bg-[#111827] text-white"
                                  : "bg-white border border-slate-200 text-slate-700 hover:border-primary hover:text-primary"
                              }`}
                            >
                              {p}
                            </button>
                          ))}

                          <button
                            type="button"
                            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={page === totalPages}
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-all hover:border-primary hover:bg-primary hover:text-white disabled:pointer-events-none disabled:opacity-30"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-20 text-slate-500 flex-1 flex flex-col items-center justify-center"
                  >
                    <Search className="w-12 h-12 text-slate-300 mb-4" />
                    <h3 className="text-2xl font-bold mb-2 text-[#111827]">Không tìm thấy bài viết nào</h3>
                    <p>Thử điều chỉnh lại từ khóa hoặc danh mục xem sao nhé.</p>
                  </motion.div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <BlogSidebar />
        </div>
      </Container>
    </div>
  );
};
