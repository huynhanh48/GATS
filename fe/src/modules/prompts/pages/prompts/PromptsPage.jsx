import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { aiToolsService } from '@/shared/services/aiToolsService';
import PromptCard from '@/modules/prompts/components/PromptCard';
import PromptDetailModal from '@/modules/prompts/components/PromptDetailModal';
import PromptFilterDrawer from '@/modules/prompts/components/PromptFilterDrawer';
import { DEFAULT_PROMPTS } from '@/modules/prompts/data/defaultPrompts';
import { formatPrompt } from '@/shared/services/aiToolsService';
import SkillPagination from '@/modules/skills/components/SkillPagination';
import BookFinLoading from '@/shared/components/BookFinLoading';
import {
  LayoutGrid,
  List,
  SlidersHorizontal,
  Search,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

const PAGE_SIZE = 9;

export default function PromptsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState(null);

  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(() => searchParams.get('category') || 'all');
  const [selectedModel, setSelectedModel] = useState(() => searchParams.get('model') || 'all');
  const [pricingFilter, setPricingFilter] = useState(() => searchParams.get('pricing') || 'all');
  const [activeSort, setActiveSort] = useState('newest');

  useEffect(() => {
    let mounted = true;
    async function loadPrompts() {
      setLoading(true);
      try {
        const { items } = await aiToolsService.getItems('prompt');
        if (mounted) {
          if (Array.isArray(items) && items.length > 0) {
            setPrompts(items);
          } else {
            // Tải danh sách fallback chuẩn hóa khi API local chưa có bản ghi
            setPrompts(DEFAULT_PROMPTS.map(formatPrompt));
          }
        }
      } catch (err) {
        console.warn('Lỗi tải danh sách Prompts từ API, sử dụng dữ liệu mặc định:', err);
        if (mounted) {
          setPrompts(DEFAULT_PROMPTS.map(formatPrompt));
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadPrompts();
    return () => {
      mounted = false;
    };
  }, []);

  const availableCategories = useMemo(() => {
    const set = new Set();
    prompts.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [prompts]);

  const availableModels = useMemo(() => {
    const set = new Set();
    prompts.forEach((p) => {
      if (p.model) set.add(p.model);
    });
    return Array.from(set);
  }, [prompts]);

  const filteredPrompts = useMemo(() => {
    let result = [...prompts];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.title?.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.template?.toLowerCase().includes(q) ||
          item.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter(
        (item) => item.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (selectedModel !== 'all') {
      result = result.filter(
        (item) => item.model?.toLowerCase() === selectedModel.toLowerCase()
      );
    }

    if (pricingFilter === 'free') {
      result = result.filter((item) => item.isFree);
    } else if (pricingFilter === 'paid') {
      result = result.filter((item) => !item.isFree);
    }

    if (activeSort === 'title_asc') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (activeSort === 'newest') {
      result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return result;
  }, [prompts, searchQuery, selectedCategory, selectedModel, pricingFilter, activeSort]);

  const totalPages = Math.ceil(filteredPrompts.length / PAGE_SIZE) || 1;
  const paginatedPrompts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredPrompts.slice(start, start + PAGE_SIZE);
  }, [filteredPrompts, currentPage]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 320, behavior: 'smooth' });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedModel('all');
    setPricingFilter('all');
    setActiveSort('newest');
    setCurrentPage(1);
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Top Banner Hero */}
      <section className="bg-transparent pt-6 sm:pt-8">
        <div className="container">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-4">
            <Link to="/" className="hover:text-[#1a56db] transition-colors">
              Trang chủ
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-500">Tính năng</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-semibold">Prompts</span>
          </div>

          {/* Hero Banner Box (Đồng bộ tỉ lệ 16:6/21:7 chuẩn như Skills, MCP, Tools, STEM) */}
          <div className="relative w-full rounded-[12px] overflow-hidden shadow-sm bg-slate-950 select-none mb-6">
            <div className="w-full relative overflow-hidden bg-slate-900 aspect-[16/6] sm:aspect-[16/5] md:aspect-[21/7] max-h-[420px] flex items-center justify-center">
              <img
                src="/features/prompts.svg"
                alt="GATS Prompts Library - Kho Câu Lệnh và Prompt AI Chuẩn Hóa"
                className="w-full h-full object-cover block"
                loading="eager"
                decoding="async"
              />
            </div>
          </div>

          {/* Quick Category Filter Pills */}
          <div className="-mx-1 flex items-center gap-2 overflow-x-auto px-1 py-1 no-scrollbar mb-6">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setCurrentPage(1);
              }}
              className={`cursor-pointer px-4 py-2 rounded-[8px] text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                selectedCategory === 'all'
                  ? 'bg-[#1a56db] text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              Tất cả ({prompts.length})
            </button>
            {availableCategories.map((cat) => {
              const isSelected = selectedCategory === cat;
              const count = prompts.filter((p) => p.category === cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat);
                    setCurrentPage(1);
                  }}
                  className={`cursor-pointer px-4 py-2 rounded-[8px] text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                    isSelected
                      ? 'bg-[#1a56db] text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="container">
        {/* Toolbar Bar */}
        <div className="bg-white rounded-[8px] border border-slate-200 p-3 sm:p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 mb-6">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm kiếm prompt, từ khóa..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-[6px] focus:outline-none focus:border-[#1a56db] focus:bg-white text-slate-800"
            />
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-[6px] border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-[4px] cursor-pointer transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-[#1a56db] shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Dạng lưới"
              >
                <LayoutGrid size={15} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-[4px] cursor-pointer transition-colors ${
                  viewMode === 'list' ? 'bg-white text-[#1a56db] shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Dạng danh sách"
              >
                <List size={15} />
              </button>
            </div>

            {/* Filter Drawer Button */}
            <button
              type="button"
              onClick={() => setFilterDrawerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-[6px] text-xs font-bold text-slate-700 transition-colors cursor-pointer"
            >
              <SlidersHorizontal size={14} />
              <span>Bộ lọc</span>
            </button>
          </div>
        </div>

        {/* Prompts Grid / List */}
        {loading ? (
          <div className="min-h-[40vh] flex flex-col items-center justify-center">
            <BookFinLoading />
            <p className="mt-4 text-xs font-semibold text-slate-500 uppercase tracking-widest">
              Đang tải danh sách prompts...
            </p>
          </div>
        ) : paginatedPrompts.length === 0 ? (
          <div className="bg-white rounded-[10px] border border-slate-200 p-12 text-center my-6">
            <MessageSquare size={40} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-800 mb-1">
              Không tìm thấy câu lệnh phù hợp
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Hãy thử thay đổi từ khóa tìm kiếm hoặc đặt lại bộ lọc.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-2 bg-[#1a56db] text-white text-xs font-bold rounded-[6px] hover:bg-[#1545b3] transition-colors cursor-pointer"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        ) : (
          <>
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'
                  : 'flex flex-col gap-4'
              }
            >
              {paginatedPrompts.map((prompt) => (
                <PromptCard
                  key={prompt.id || prompt.itemKey}
                  prompt={prompt}
                  viewMode={viewMode}
                  onSelectPrompt={(p) => setSelectedPrompt(p)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <SkillPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </section>

      {/* Filter Drawer */}
      <PromptFilterDrawer
        isOpen={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        categories={availableCategories}
        models={availableModels}
        selectedCategory={selectedCategory}
        onCategoryChange={(c) => {
          setSelectedCategory(c);
          setCurrentPage(1);
        }}
        selectedModel={selectedModel}
        onModelChange={(m) => {
          setSelectedModel(m);
          setCurrentPage(1);
        }}
        pricingFilter={pricingFilter}
        onPricingChange={(p) => {
          setPricingFilter(p);
          setCurrentPage(1);
        }}
        onResetFilters={handleResetFilters}
      />

      {/* Detail Modal */}
      <PromptDetailModal
        prompt={selectedPrompt}
        isOpen={Boolean(selectedPrompt)}
        onClose={() => setSelectedPrompt(null)}
      />
    </div>
  );
}

