import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { stemService } from '@/modules/stem/services/stemService';
import StemCard from '@/modules/stem/components/StemCard';
import StemDetailModal from '@/modules/stem/components/StemDetailModal';
import StemFilterDrawer from '@/modules/stem/components/StemFilterDrawer';
import SkillPagination from '@/modules/skills/components/SkillPagination';
import {
  LayoutGrid,
  List,
  SlidersHorizontal,
  Loader2,
  Atom,
  Search,
} from 'lucide-react';

const PAGE_SIZE = 9;

/**
 * StemPage - Trang danh sách mô-đun STEM & AI Robotics (STEM Hub)
 * Chuẩn hóa 100% theo format tính năng của GATS Academy (Skills, MCP, Tools, API)
 */
export default function StemPage() {
  const [searchParams] = useSearchParams();

  const [stemList, setStemList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [selectedStem, setSelectedStem] = useState(null);

  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(() => searchParams.get('category') || 'all');
  const [pricingFilter, setPricingFilter] = useState(() => searchParams.get('pricing') || 'all');
  const [activeSort, setActiveSort] = useState('newest');

  useEffect(() => {
    let mounted = true;
    async function loadStem() {
      setLoading(true);
      try {
        const { items } = await stemService.getStemItems();
        if (mounted) {
          setStemList(items);
        }
      } catch (err) {
        console.warn('Lỗi tải danh sách STEM:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadStem();
    return () => {
      mounted = false;
    };
  }, []);

  const availableCategories = useMemo(() => {
    const set = new Set();
    stemList.forEach((s) => {
      if (s.category) set.add(s.category);
    });
    return Array.from(set);
  }, [stemList]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'all') count += 1;
    if (pricingFilter !== 'all') count += 1;
    if (searchQuery.trim() !== '') count += 1;
    return count;
  }, [selectedCategory, pricingFilter, searchQuery]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setPricingFilter('all');
    setSearchQuery('');
    setActiveSort('newest');
    setCurrentPage(1);
  };

  const filteredAndSortedStem = useMemo(() => {
    let result = [...stemList];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          s.provider.toLowerCase().includes(q) ||
          s.itemKey.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter((s) => s.category === selectedCategory);
    }

    if (pricingFilter === 'free') {
      result = result.filter((s) => s.isFree);
    } else if (pricingFilter === 'paid') {
      result = result.filter((s) => !s.isFree);
    }

    result.sort((a, b) => {
      if (activeSort === 'title_asc') {
        return a.title.localeCompare(b.title, 'vi');
      }
      if (activeSort === 'oldest') {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    return result;
  }, [stemList, searchQuery, selectedCategory, pricingFilter, activeSort]);

  const totalPages = Math.ceil(filteredAndSortedStem.length / PAGE_SIZE) || 1;

  const visibleStem = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredAndSortedStem.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredAndSortedStem, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const anchor = document.getElementById('stem-content-anchor');
    if (anchor) {
      anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 100, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[600px] flex flex-col items-center justify-center gap-3 bg-white">
        <Loader2 size={36} className="animate-spin text-[#1a56db]" />
        <p className="text-sm font-medium text-slate-500">Đang tải danh sách mô-đun STEM & Robotics...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen py-8 md:py-12">
      <div className="container" id="stem-content-anchor">
        {/* HERO BANNER TRANG STEM */}
        <div className="relative w-full rounded-[12px] overflow-hidden shadow-sm bg-slate-950 select-none mb-6">
          <div className="w-full relative overflow-hidden bg-slate-900 aspect-[16/6] sm:aspect-[16/5] md:aspect-[21/7] max-h-[420px] flex items-center justify-center">
            <img
              src="/features/stem.svg"
              alt="GATS STEM Hub - Kho Mô-đun & Giáo Cụ STEM Thực Chiến"
              className="w-full h-full object-cover block"
              loading="eager"
              decoding="async"
            />
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="bg-white rounded-[10px] border border-slate-200/90 p-2.5 sm:p-3 mb-6 shadow-2xs flex items-center justify-between gap-2 sm:gap-4 flex-wrap sm:flex-nowrap">
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

            <span className="text-xs font-medium text-slate-500 hidden md:inline-block">
              Hiển thị <span className="font-bold text-[#273044]">{filteredAndSortedStem.length}</span> mô-đun STEM
            </span>
          </div>

          <div className="relative flex-1 max-w-xs hidden sm:block">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm kiếm mô-đun STEM, kit thực hành..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-[6px] focus:outline-none focus:border-[#1a56db] focus:bg-white transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
            <div className="relative flex items-center">
              <select
                value={activeSort}
                onChange={(e) => {
                  setActiveSort(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[#273044] text-[11px] sm:text-xs font-semibold rounded-[8px] pl-2.5 sm:pl-3 pr-7 py-2 cursor-pointer focus:outline-none focus:border-[#1a56db] transition-colors"
                aria-label="Sắp xếp mô-đun STEM"
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="title_asc">Tên: A đến Z</option>
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
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-[8px] bg-[#1a56db] hover:bg-[#1545b3] active:bg-[#0f348e] text-white text-[11px] sm:text-xs font-bold transition-all shadow-xs cursor-pointer select-none shrink-0"
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

        {/* DANH MỤC PILLS */}
        {availableCategories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-4">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-[6px] text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#1a56db] text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              Tất cả ({stemList.length})
            </button>

            {availableCategories.map((cat) => {
              const count = stemList.filter((m) => m.category === cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-[6px] text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#1a56db] text-white shadow-2xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* DANH SÁCH MÔ-ĐUN STEM */}
        {visibleStem.length === 0 ? (
          <div className="bg-white rounded-[10px] border border-slate-200 p-12 text-center my-6">
            <Atom size={40} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-[#273044] mb-1">
              Không tìm thấy mô-đun STEM nào
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn các bộ lọc hiện tại.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-2 bg-[#1a56db] text-white text-xs font-bold rounded-[6px] hover:bg-[#1545b3] transition-colors cursor-pointer"
            >
              Xóa bộ lọc
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleStem.map((item) => (
              <StemCard
                key={item.id}
                stem={item}
                onSelectStem={setSelectedStem}
                viewMode="grid"
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {visibleStem.map((item) => (
              <StemCard
                key={item.id}
                stem={item}
                onSelectStem={setSelectedStem}
                viewMode="list"
              />
            ))}
          </div>
        )}

        {/* PHÂN TRANG */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <SkillPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        {/* FILTER DRAWER */}
        <StemFilterDrawer
          isOpen={filterDrawerOpen}
          onClose={() => setFilterDrawerOpen(false)}
          categories={availableCategories}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            setCurrentPage(1);
          }}
          pricingFilter={pricingFilter}
          onSelectPricing={(p) => {
            setPricingFilter(p);
            setCurrentPage(1);
          }}
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
            setCurrentPage(1);
          }}
          onResetFilters={handleResetFilters}
          totalResults={filteredAndSortedStem.length}
        />

        {/* MODAL CHI TIẾT */}
        <StemDetailModal
          stem={selectedStem}
          isOpen={Boolean(selectedStem)}
          onClose={() => setSelectedStem(null)}
        />
      </div>
    </div>
  );
}
