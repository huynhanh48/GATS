import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { aiToolsService } from '@/shared/services/aiToolsService';
import ApiModelCard from '@/modules/api/components/ApiModelCard';
import ApiModelDetailModal from '@/modules/api/components/ApiModelDetailModal';
import ApiModelFilterDrawer from '@/modules/api/components/ApiModelFilterDrawer';
import SkillPagination from '@/modules/skills/components/SkillPagination';
import {
  LayoutGrid,
  List,
  SlidersHorizontal,
  Loader2,
  Database,
  Search,
} from 'lucide-react';

const PAGE_SIZE = 9;

/**
 * ApiPage - Trang danh sách Mô hình AI (AI Gateway và API Models Hub)
 */
export default function ApiPage() {
  const [searchParams] = useSearchParams();

  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);

  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(() => searchParams.get('provider') || 'all');
  const [pricingFilter, setPricingFilter] = useState(() => searchParams.get('pricing') || 'all');
  const [activeSort, setActiveSort] = useState('newest');

  useEffect(() => {
    let mounted = true;
    async function loadModels() {
      setLoading(true);
      try {
        const { items } = await aiToolsService.getItems('api_provider', { page: 1, take: 20 });
        if (mounted) {
          setModels(items);
        }
      } catch (err) {
        console.warn('Lỗi tải danh sách API Models:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadModels();
    return () => {
      mounted = false;
    };
  }, []);

  const availableCategories = useMemo(() => {
    const set = new Set();
    models.forEach((m) => {
      if (m.provider) set.add(m.provider);
    });
    return Array.from(set);
  }, [models]);

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

  const filteredAndSortedModels = useMemo(() => {
    let result = [...models];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.provider.toLowerCase().includes(q) ||
          m.itemKey.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter((m) => m.provider === selectedCategory);
    }

    if (pricingFilter === 'free') {
      result = result.filter((m) => m.isFree);
    } else if (pricingFilter === 'paid') {
      result = result.filter((m) => !m.isFree);
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
  }, [models, searchQuery, selectedCategory, pricingFilter, activeSort]);

  const totalPages = Math.ceil(filteredAndSortedModels.length / PAGE_SIZE) || 1;

  const visibleModels = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredAndSortedModels.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredAndSortedModels, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const anchor = document.getElementById('api-content-anchor');
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
        <p className="text-sm font-medium text-slate-500">Đang tải danh sách mô hình AI...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen py-8 md:py-12">
      <div className="container" id="api-content-anchor">
        {/* HERO BANNER TRANG API */}
        <div className="relative w-full rounded-[12px] overflow-hidden shadow-sm bg-slate-950 select-none mb-6">
          <div className="w-full relative overflow-hidden bg-slate-900 aspect-[16/6] sm:aspect-[16/5] md:aspect-[21/7] max-h-[420px] flex items-center justify-center">
            <img
              src="/features/api_model.webp"
              alt="GATS API Gateway - Cổng API Mô Hình Trí Tuệ Nhân Tạo"
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
              Hiển thị <span className="font-bold text-[#273044]">{filteredAndSortedModels.length}</span> mô hình
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
              placeholder="Tìm kiếm mô hình, nhà cung cấp..."
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
                aria-label="Sắp xếp mô hình"
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

        {/* LƯỚI CARD */}
        <main className="w-full">
          {visibleModels.length > 0 ? (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {visibleModels.map((model) => (
                    <div key={model.id || model.itemKey} className="h-full">
                      <ApiModelCard
                        model={model}
                        onSelectModel={(m) => setSelectedModel(m)}
                        viewMode="grid"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {visibleModels.map((model) => (
                    <ApiModelCard
                      key={model.id || model.itemKey}
                      model={model}
                      onSelectModel={(m) => setSelectedModel(m)}
                      viewMode="list"
                    />
                  ))}
                </div>
              )}

              <SkillPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          ) : (
            <div className="py-20 px-4 text-center bg-white rounded-[10px] border border-slate-200/90">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#1a56db] flex items-center justify-center mx-auto mb-4">
                <Database size={26} />
              </div>
              <h3 className="text-lg font-bold text-[#273044] mb-2">
                Không tìm thấy mô hình phù hợp
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-5">
                Không có mô hình nào khớp với tiêu chí tìm kiếm hoặc bộ lọc bạn đã chọn.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-5 py-2.5 rounded-[8px] bg-[#1a56db] hover:bg-[#1545b3] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          )}
        </main>
      </div>

      <ApiModelFilterDrawer
        isOpen={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        categories={availableCategories}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setCurrentPage(1);
        }}
        pricingFilter={pricingFilter}
        onSelectPricing={(pr) => {
          setPricingFilter(pr);
          setCurrentPage(1);
        }}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setCurrentPage(1);
        }}
        onResetFilters={handleResetFilters}
        totalResults={filteredAndSortedModels.length}
      />

      <ApiModelDetailModal
        model={selectedModel}
        isOpen={Boolean(selectedModel)}
        onClose={() => setSelectedModel(null)}
      />
    </div>
  );
}
