'use client';

import React, { useEffect, useState } from 'react';
import { NatureHero } from '@/components/animations/NatureHero';
import { CategoryTabs } from '@/components/posts/CategoryTabs';
import { PostCard } from '@/components/posts/PostCard';
import apiClient from '@/lib/apiClient';
import { PathApi } from '@/constants/PathApi';
import { CourseCategory } from '@/types/course';
import { Post } from '@/types/post';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MOCK_CATEGORIES, MOCK_POSTS } from '@/constants/mockPosts';

// MOCK DATA FALLBACK
export const PostsClient = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
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

  // Reset page to 1 when category changes
  const handleCategorySelect = (id: string | null) => {
    setActiveCategory(id);
    setPage(1);
  };

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get(PathApi.categories.list, { params: { type: 'post' } });
        const data = response as any;
        if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
          setCategories(data.data);
        } else {
          setCategories(MOCK_CATEGORIES);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories(MOCK_CATEGORIES);
      }
    };
    fetchCategories();
  }, []);

  // Fetch Posts
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const params: any = { page, limit };
        if (activeCategory) {
          params.category = activeCategory;
        }
        if (debouncedSearch) {
          params.search = debouncedSearch;
        }
        const response = await apiClient.get(PathApi.posts.list, { params });
        const data = response as any;
        if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
          setPosts(data.data);
          if (data.pagination) {
            setTotalPages(data.pagination.totalPages || Math.ceil(data.pagination.total / limit));
          }
        } else {
          // Fallback to mock data with manual pagination and search
          const filtered = MOCK_POSTS.filter(p => {
            const matchesCategory = activeCategory ? (p.category?.slug === activeCategory || p.category?.id === activeCategory) : true;
            const matchesSearch = debouncedSearch ? p.title.toLowerCase().includes(debouncedSearch.toLowerCase()) : true;
            return matchesCategory && matchesSearch;
          });
          
          setTotalPages(Math.ceil(filtered.length / limit) || 1);
          setPosts(filtered.slice((page - 1) * limit, page * limit));
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
        const filtered = MOCK_POSTS.filter(p => {
          const matchesCategory = activeCategory ? (p.category?.slug === activeCategory || p.category?.id === activeCategory) : true;
          const matchesSearch = debouncedSearch ? p.title.toLowerCase().includes(debouncedSearch.toLowerCase()) : true;
          return matchesCategory && matchesSearch;
        });
        
        setTotalPages(Math.ceil(filtered.length / limit) || 1);
        setPosts(filtered.slice((page - 1) * limit, page * limit));
      } finally {
        setLoading(false);
        setIsInitialLoad(false);
      }
    };
    fetchPosts();
  }, [activeCategory, page, debouncedSearch]);

  return (
    <div className="w-full flex flex-col relative z-10">
      {/* Animated Hero Section with Custom Search */}
      <NatureHero>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto w-full flex flex-col items-center justify-center gap-6"
        >
          <div className="w-full relative group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
              <Search className="w-5 h-5" />
            </div>
            <Input 
              placeholder="Tìm kiếm bài viết, chủ đề..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-14 pr-6 py-7 w-full text-lg rounded-full border-2 border-border/50 bg-background/80 backdrop-blur-md shadow-xl focus-visible:ring-0 focus-visible:border-primary transition-all hover:border-primary/50 text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </motion.div>
      </NatureHero>

      {/* Tabs Section */}
      <CategoryTabs 
        categories={categories} 
        activeCategoryId={activeCategory} 
        onSelectCategory={handleCategorySelect} 
      />

      {/* Posts Grid */}
      <main className="flex-1 container mx-auto px-4 py-12 md:py-16 flex flex-col min-h-[600px] relative">
        {isInitialLoad ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse bg-muted rounded-3xl h-[400px] w-full"></div>
            ))}
          </div>
        ) : (
          <div className={cn("flex flex-col flex-1 transition-all duration-300", loading ? "opacity-50 scale-[0.99] pointer-events-none blur-[2px]" : "opacity-100 scale-100 blur-0")}>
            {posts.length > 0 ? (
              <>
                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
                  <AnimatePresence mode="popLayout">
                    {posts.map(post => (
                      <motion.div
                        key={post.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.25, type: 'spring', bounce: 0.3 }}
                      >
                        <PostCard post={post} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-auto">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="rounded-full w-10 h-10 border-border/50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    
                    <div className="flex items-center gap-1 mx-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                        <Button
                          key={p}
                          variant={page === p ? "default" : "ghost"}
                          size="icon"
                          onClick={() => setPage(p)}
                          className={`rounded-full w-10 h-10 ${page === p ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                          {p}
                        </Button>
                      ))}
                    </div>

                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="rounded-full w-10 h-10 border-border/50"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20 text-muted-foreground flex-1 flex flex-col items-center justify-center"
              >
                <div className="w-20 h-20 mb-6 rounded-full bg-muted flex items-center justify-center">
                  <Search className="w-10 h-10 text-muted-foreground/50" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-foreground">Không tìm thấy bài viết nào</h3>
                <p>Thử điều chỉnh lại từ khóa hoặc danh mục xem sao nhé.</p>
              </motion.div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
