import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { httpClient } from '@/shared/api-client/httpClient';
import { API } from '@/shared/constants/api';
import { resolveMediaUrl } from '@/shared/utils/media';
import {
  BlogFilterDrawer,
  BlogRecentSidebar,
  BlogCard,
  BlogPagination,
  BlogFeaturedSection,
} from './components';
import {
  LayoutGrid,
  List,
  SlidersHorizontal,
  Loader2,
  BookOpen,
} from 'lucide-react';

const PAGE_SIZE = 6; // 6 bài viết mỗi trang

/**
 * Blog Page - Trang danh sách bài viết & tin tức chuyên môn
 * - Chỉ sử dụng dữ liệu thực tế 100% từ API Backend (/api/posts)
 * - Cột bên trái hiển thị Tìm kiếm, Danh mục, Bài viết gần nhất (Recent Posts) và Thẻ tags
 * - Cột bên phải hiển thị Lưới bài viết (Grid / List view) và Phân trang chuẩn
 */
export default function Blog() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Bộ lọc State khởi tạo trực tiếp từ searchParams
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '');
  const [activeCategory, setActiveCategory] = useState(() => searchParams.get('category') || 'all');
  const [activeTag, setActiveTag] = useState(() => searchParams.get('tag') || '');
  const [selectedAuthors, setSelectedAuthors] = useState([]);
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [activeSort, setActiveSort] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);

  // 1. Tải danh sách bài viết thực tế từ Backend API
  useEffect(() => {
    let mounted = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    async function fetchPosts() {
      setLoading(true);
      try {
        const res = await httpClient.get(API.POSTS.LIST);
        const data = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.posts)
            ? res.posts
            : Array.isArray(res)
              ? res
              : [];

        if (mounted) {
          if (data.length > 0) {
            const formatted = data.map((p, idx) => {
              let authorStr = 'GATS Academy';
              if (typeof p.author === 'string') {
                authorStr = p.author;
              } else if (p.author && typeof p.author === 'object') {
                authorStr =
                  p.author.userName ||
                  p.author.name ||
                  p.author.fullName ||
                  p.author.email ||
                  'GATS Academy';
              } else if (typeof p.userName === 'string') {
                authorStr = p.userName;
              }

              let catStr = 'Chuyên mục';
              if (typeof p.category === 'string') {
                catStr = p.category;
              } else if (p.category && typeof p.category === 'object') {
                catStr =
                  p.category.name ||
                  p.category.title ||
                  p.category.slug ||
                  'Chuyên mục';
              }

              const tagList = Array.isArray(p.tags)
                ? p.tags.map((t) => (typeof t === 'string' ? t : t.name || t.slug))
                : [];

              return {
                id: p.id || p._id || idx + 1,
                slug: p.slug || `bai-viet-${p.id || idx + 1}`,
                title:
                  typeof p.title === 'string'
                    ? p.title
                    : 'Bài viết chuyên môn',
                description:
                  p.excerpt ||
                  p.description ||
                  p.summary ||
                  '',
                category: catStr,
                tags: tagList,
                date:
                  p.publishedAt || p.createdAt
                    ? new Date(p.publishedAt || p.createdAt).toLocaleDateString(
                        'vi-VN'
                      )
                    : '',
                rawDate: p.publishedAt || p.createdAt || new Date().toISOString(),
                author: authorStr,
                thumbnail: resolveMediaUrl(
                  p.thumbnail || p.image || p.coverImage,
                  '/logo.svg'
                ),
                views: p.views || p.viewCount || 0,
              };
            });

            setPosts(formatted);
          } else {
            setPosts([]);
          }
        }
      } catch (err) {
        console.warn('Lỗi tải bài viết từ API Backend:', err);
        if (mounted) setPosts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchPosts();
    return () => {
      mounted = false;
    };
  }, []);

  // 3. Trích xuất danh sách Categories, Tags và Authors
  const allCategories = useMemo(() => {
    const set = new Set();
    posts.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [posts]);

  const allTags = useMemo(() => {
    const set = new Set();
    posts.forEach((p) => {
      (p.tags || []).forEach((t) => set.add(t));
    });
    return Array.from(set);
  }, [posts]);

  const allAuthors = useMemo(() => {
    const set = new Set();
    posts.forEach((p) => {
      if (p.author) set.add(p.author);
    });
    return Array.from(set);
  }, [posts]);

  // Đếm số lượng bài theo từng category
  const categoryCounts = useMemo(() => {
    const map = {};
    posts.forEach((p) => {
      if (p.category) {
        map[p.category] = (map[p.category] || 0) + 1;
      }
    });
    return map;
  }, [posts]);

  // 4. Lọc và Sắp xếp bài viết
  const filteredAndSortedPosts = useMemo(() => {
    let result = [...posts];

    // Lọc theo tìm kiếm từ khóa
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      );
    }

    // Lọc theo Danh mục
    if (activeCategory !== 'all') {
      result = result.filter(
        (p) => p.category?.toLowerCase() === activeCategory.toLowerCase()
      );
    }

    // Lọc theo Thẻ Tag
    if (activeTag) {
      result = result.filter((p) =>
        (p.tags || []).some(
          (t) => t.toLowerCase() === activeTag.toLowerCase()
        )
      );
    }

    // Lọc theo Tác giả
    if (selectedAuthors.length > 0) {
      result = result.filter((p) => selectedAuthors.includes(p.author));
    }

    // Lọc theo Khoảng thời gian
    if (selectedDateRange !== 'all') {
      const now = new Date().getTime();
      result = result.filter((p) => {
        const itemTime = new Date(p.rawDate || p.date).getTime();
        if (isNaN(itemTime)) return true;
        const diffDays = (now - itemTime) / (1000 * 3600 * 24);
        if (selectedDateRange === 'week') return diffDays <= 7;
        if (selectedDateRange === 'month') return diffDays <= 30;
        if (selectedDateRange === 'year') return diffDays <= 365;
        return true;
      });
    }

    // Sắp xếp
    result.sort((a, b) => {
      if (activeSort === 'oldest') {
        return (a.id || 0) - (b.id || 0);
      }
      if (activeSort === 'popular') {
        return (b.views || 0) - (a.views || 0);
      }
      if (activeSort === 'title') {
        return (a.title || '').localeCompare(b.title || '');
      }
      // Mặc định: newest
      return (b.id || 0) - (a.id || 0);
    });

    return result;
  }, [
    posts,
    searchQuery,
    activeCategory,
    activeTag,
    selectedAuthors,
    selectedDateRange,
    activeSort,
  ]);

  // Phân trang
  const totalPages = Math.ceil(filteredAndSortedPosts.length / PAGE_SIZE) || 1;
  const visiblePosts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredAndSortedPosts.slice(start, start + PAGE_SIZE);
  }, [filteredAndSortedPosts, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const anchor = document.getElementById('blog-content-anchor');
    if (anchor) {
      anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 100, behavior: 'smooth' });
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveCategory('all');
    setActiveTag('');
    setSelectedAuthors([]);
    setSelectedDateRange('all');
    setActiveSort('newest');
    setCurrentPage(1);
    setSearchParams({});
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (activeCategory !== 'all') count++;
    if (activeTag) count++;
    if (selectedAuthors.length > 0) count += selectedAuthors.length;
    if (selectedDateRange !== 'all') count++;
    if (searchQuery) count++;
    return count;
  }, [activeCategory, activeTag, selectedAuthors, selectedDateRange, searchQuery]);

  return (
    <div className="bg-[#f8fafc] min-h-screen py-10 md:py-14">
      {/* VÙNG CHỨA CÙNG CHIỀU NGANG VỚI COURSES VÀ MAINBAR */}
      <div className="container" id="blog-content-anchor">
        {/* ========================================================
            1. BÀI VIẾT NỔI BẬT: MAGAZINE HERO GRID (>=3) HOẶC SLIDER (1-2)
            ======================================================== */}
        <BlogFeaturedSection posts={posts} className="mb-8" />

        {/* ========================================================
            2. THANH TOOLBAR ĐỒNG BỘ COURSES
            ======================================================== */}
        <div className="bg-white rounded-[10px] border border-slate-200/90 p-2.5 sm:p-3 mb-6 shadow-sm flex items-center justify-between gap-2 sm:gap-4 flex-nowrap">
          {/* Bên trái: Toggle Grid / List View & Số lượng bài */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center bg-slate-100 rounded-[6px] p-1 gap-1">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-[4px] transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-[#1a56db] shadow-xs'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Chế độ xem dạng lưới"
                aria-label="Chế độ xem dạng lưới"
              >
                <LayoutGrid size={17} />
              </button>

              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-[4px] transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white text-[#1a56db] shadow-xs'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Chế độ xem dạng danh sách"
                aria-label="Chế độ xem dạng danh sách"
              >
                <List size={17} />
              </button>
            </div>

            <span className="text-xs font-medium text-slate-500 hidden sm:inline-block">
              Hiển thị <span className="font-bold text-[#273044]">{filteredAndSortedPosts.length}</span> bài viết
            </span>
          </div>

          {/* Bên phải: Dropdown Sắp xếp và Nút mở Drawer Bộ lọc */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="relative flex items-center">
              <select
                value={activeSort}
                onChange={(e) => {
                  setActiveSort(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[#273044] text-[11px] sm:text-xs font-semibold rounded-[8px] pl-2.5 sm:pl-3.5 pr-7 sm:pr-8 py-2 cursor-pointer focus:outline-none focus:border-[#1a56db] transition-colors"
                aria-label="Sắp xếp bài viết"
              >
                <option value="newest">Mới nhất</option>
                <option value="popular">Xem nhiều nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="title">Tiêu đề: A đến Z</option>
              </select>
              <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setFilterDrawerOpen(true)}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-[8px] bg-[#1a56db] hover:bg-[#1545b3] active:bg-[#0f348e] text-white text-[11px] sm:text-xs font-bold transition-all shadow-sm cursor-pointer select-none shrink-0"
            >
              <SlidersHorizontal size={14} />
              <span>Bộ lọc</span>
              {activeFilterCount > 0 && (
                <span className="bg-white text-[#1a56db] text-[10px] px-1.5 py-0.2 rounded-full font-extrabold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Số lượng bài viết hiển thị gọn gàng trên mobile */}
        <div className="sm:hidden text-[11px] font-medium text-slate-400 -mt-3.5 mb-5 px-1 flex items-center justify-between">
          <span>Hiển thị {filteredAndSortedPosts.length} bài viết</span>
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[#1a56db] font-semibold text-[11px] underline cursor-pointer"
            >
              Xóa bộ lọc ({activeFilterCount})
            </button>
          )}
        </div>

        {/* ========================================================
            3. LAYOUT CHÍNH: CỘT TRÁI (RECENT SIDEBAR) + CỘT PHẢI (POSTS GRID)
            ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* CỘT TRÁI: 4 Cột (Sidebar chứa Tìm kiếm, Danh mục, Bài viết gần nhất, Tags) */}
          <div className="lg:col-span-4 hidden lg:block">
            <BlogRecentSidebar
              searchQuery={searchQuery}
              onSearchChange={(val) => {
                setSearchQuery(val);
                setCurrentPage(1);
              }}
              categories={allCategories}
              activeCategory={activeCategory}
              onCategorySelect={(cat) => {
                setActiveCategory(cat);
                setCurrentPage(1);
              }}
              categoryCounts={categoryCounts}
              recentPosts={posts}
              tags={allTags}
              activeTag={activeTag}
              onTagSelect={(t) => {
                setActiveTag(t);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* CỘT PHẢI: 8 Cột (Lưới hoặc Danh sách bài viết) */}
          <div className="lg:col-span-8">
            {loading ? (
              <div className="min-h-[400px] flex flex-col items-center justify-center gap-3 bg-white rounded-[10px] border border-slate-200/80">
                <Loader2 size={36} className="animate-spin text-[#1a56db]" />
                <p className="text-xs font-medium text-slate-500">Đang tải bài viết...</p>
              </div>
            ) : visiblePosts.length === 0 ? (
              <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-white rounded-[10px] border border-slate-200/80 space-y-3">
                <BookOpen size={40} className="text-slate-300" />
                <h4 className="text-base font-bold text-[#273044]">
                  Không tìm thấy bài viết phù hợp
                </h4>
                <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                  Vui lòng thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn các tiêu chí lọc để xem thêm bài viết.
                </p>
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="mt-2 px-4 py-2 rounded-[8px] bg-[#1a56db] text-white text-xs font-bold hover:bg-[#1545b3] transition-colors"
                  >
                    Xóa tất cả bộ lọc
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {visiblePosts.map((post) => (
                      <BlogCard key={post.id} post={post} viewMode="grid" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-5">
                    {visiblePosts.map((post) => (
                      <BlogCard key={post.id} post={post} viewMode="list" />
                    ))}
                  </div>
                )}

                {/* Phân trang */}
                <BlogPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================
          4. DRAWER BỘ LỌC BÀI VIẾT (TRƯỢT TỪ BÊN PHẢI)
          ======================================================== */}
      <BlogFilterDrawer
        isOpen={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        categories={allCategories}
        tags={allTags}
        authors={allAuthors}
        selectedCategories={activeCategory !== 'all' ? [activeCategory] : []}
        selectedTags={activeTag ? [activeTag] : []}
        selectedAuthors={selectedAuthors}
        selectedDateRange={selectedDateRange}
        onCategoryChange={(cats) => {
          setActiveCategory(cats.length > 0 ? cats[cats.length - 1] : 'all');
          setCurrentPage(1);
        }}
        onTagChange={(tList) => {
          setActiveTag(tList.length > 0 ? tList[tList.length - 1] : '');
          setCurrentPage(1);
        }}
        onAuthorChange={(aList) => {
          setSelectedAuthors(aList);
          setCurrentPage(1);
        }}
        onDateRangeChange={(range) => {
          setSelectedDateRange(range);
          setCurrentPage(1);
        }}
        onResetFilters={handleResetFilters}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setCurrentPage(1);
        }}
      />
    </div>
  );
}
