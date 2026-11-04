import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { skillService } from '@/modules/skills/services/skillService';
import SkillCard from '@/modules/skills/components/SkillCard';
import SkillFilterDrawer from '@/modules/skills/components/SkillFilterDrawer';
import SkillPagination from '@/modules/skills/components/SkillPagination';
import SkillDetailModal from '@/modules/skills/components/SkillDetailModal';
import {
  LayoutGrid,
  List,
  SlidersHorizontal,
  Loader2,
  BookOpen,
  Search,
} from 'lucide-react';

const PAGE_SIZE = 9;

/**
 * SkillsPage - Trang danh sách Kỹ năng AI (Skills Hub)
 * Thiết kế đồng bộ hoàn toàn với trang Khóa học (CoursesPage):
 * - Container full width đồng bộ với mainbar
 * - Hero banner công nghệ hiện đại
 * - Toolbar: Grid/List view toggle, Search input, Sort dropdown, Filter Drawer button
 * - Category filter pills chọn nhanh 1 chạm
 * - Lưới SkillCard chuẩn tỉ lệ, hover mượt mà
 * - Phân trang Pagination
 * - Drawer bộ lọc trượt từ bên phải
 * - Modal xem nhanh chi tiết skill kèm copy prompt và tải file
 */
export default function SkillsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Modal xem nhanh
  const [selectedQuickSkill, setSelectedQuickSkill] = useState(null);

  // Bộ lọc và Sắp xếp khởi tạo từ URL nếu có
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(() => searchParams.get('category') || 'all');
  const [pricingFilter, setPricingFilter] = useState(() => searchParams.get('pricing') || 'all');
  const [activeSort, setActiveSort] = useState('newest'); // 'newest' | 'oldest' | 'title_asc' | 'price_low' | 'price_high'

  // Tải danh sách Skills từ Backend API
  useEffect(() => {
    let mounted = true;
    async function loadSkills() {
      setLoading(true);
      try {
        const { skills: data } = await skillService.getSkills();
        if (mounted) {
          setSkills(data);
        }
      } catch (err) {
        console.warn('Lỗi tải danh sách skills:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadSkills();
    return () => {
      mounted = false;
    };
  }, []);

  // Trích xuất danh mục động từ danh sách skills
  const availableCategories = useMemo(() => {
    const set = new Set();
    skills.forEach((s) => {
      if (s.category) set.add(s.category);
    });
    return Array.from(set);
  }, [skills]);

  // Đếm số lượng bộ lọc đang kích hoạt
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'all') count += 1;
    if (pricingFilter !== 'all') count += 1;
    if (searchQuery.trim() !== '') count += 1;
    return count;
  }, [selectedCategory, pricingFilter, searchQuery]);

  // Xử lý reset tất cả bộ lọc
  const handleResetFilters = () => {
    setSelectedCategory('all');
    setPricingFilter('all');
    setSearchQuery('');
    setActiveSort('newest');
    setCurrentPage(1);
    setSearchParams({});
  };

  // Lọc và Sắp xếp danh sách kỹ năng
  const filteredAndSortedSkills = useMemo(() => {
    let result = [...skills];

    // 1. Tìm kiếm theo từ khóa
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          s.itemKey.toLowerCase().includes(q)
      );
    }

    // 2. Lọc theo chuyên mục
    if (selectedCategory !== 'all') {
      result = result.filter((s) => s.category === selectedCategory);
    }

    // 3. Lọc theo mức giá
    if (pricingFilter === 'free') {
      result = result.filter((s) => s.isFree);
    } else if (pricingFilter === 'paid') {
      result = result.filter((s) => !s.isFree);
    }

    // 4. Sắp xếp
    result.sort((a, b) => {
      if (activeSort === 'title_asc') {
        return a.title.localeCompare(b.title, 'vi');
      }
      if (activeSort === 'price_low') {
        return (a.priceValue || 0) - (b.priceValue || 0);
      }
      if (activeSort === 'price_high') {
        return (b.priceValue || 0) - (a.priceValue || 0);
      }
      if (activeSort === 'oldest') {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }
      // 'newest' (Mặc định)
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    return result;
  }, [skills, searchQuery, selectedCategory, pricingFilter, activeSort]);

  // Tính toán phân trang
  const totalPages = Math.ceil(filteredAndSortedSkills.length / PAGE_SIZE) || 1;

  const visibleSkills = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredAndSortedSkills.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredAndSortedSkills, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const anchor = document.getElementById('skills-content-anchor');
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
        <p className="text-sm font-medium text-slate-500">Đang tải danh sách kỹ năng AI...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen py-8 md:py-12">
      <div className="container" id="skills-content-anchor">
        {/* ========================================================
            HERO BANNER TRANG SKILLS
            ======================================================== */}
        <div className="relative w-full rounded-[12px] overflow-hidden shadow-sm bg-slate-950 select-none mb-6">
          <div className="w-full relative overflow-hidden bg-slate-900 aspect-[16/6] sm:aspect-[16/5] md:aspect-[21/7] max-h-[420px] flex items-center justify-center">
            <img
              src="/features/skills.webp"
              alt="GATS Skills Hub - Kho Kỹ Năng và Prompt AI Thực Chiến"
              className="w-full h-full object-cover block"
              loading="eager"
              decoding="async"
            />
          </div>
        </div>

        {/* ========================================================
            THANH TOOLBAR (Chế độ xem, Tìm kiếm, Sắp xếp, Bộ lọc)
            ======================================================== */}
        <div className="bg-white rounded-[10px] border border-slate-200/90 p-2.5 sm:p-3 mb-6 shadow-2xs flex items-center justify-between gap-2 sm:gap-4 flex-wrap sm:flex-nowrap">
          {/* Bên trái: Toggle Grid / List View và Số lượng */}
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
              Hiển thị <span className="font-bold text-[#273044]">{filteredAndSortedSkills.length}</span> kỹ năng
            </span>
          </div>

          {/* Ô tìm kiếm nhanh trên Desktop */}
          <div className="relative flex-1 max-w-xs hidden sm:block">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm kiếm kỹ năng..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-[6px] focus:outline-none focus:border-[#1a56db] focus:bg-white transition-colors"
            />
          </div>

          {/* Bên phải: Dropdown Sắp xếp và Nút Bộ lọc */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
            {/* Dropdown Sắp xếp */}
            <div className="relative flex items-center">
              <select
                value={activeSort}
                onChange={(e) => {
                  setActiveSort(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[#273044] text-[11px] sm:text-xs font-semibold rounded-[8px] pl-2.5 sm:pl-3 pr-7 py-2 cursor-pointer focus:outline-none focus:border-[#1a56db] transition-colors"
                aria-label="Sắp xếp kỹ năng"
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="title_asc">Tên: A đến Z</option>
                <option value="price_low">Giá: Thấp đến cao</option>
                <option value="price_high">Giá: Cao đến thấp</option>
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

            {/* Nút Bộ lọc */}
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


        {/* ========================================================
            VÙNG HIỂN THỊ KỸ NĂNG (GRID HOẶC LIST)
            ======================================================== */}
        <main className="w-full">
          {visibleSkills.length > 0 ? (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {visibleSkills.map((skill) => (
                    <div key={skill.id || skill.itemKey} className="h-full">
                      <SkillCard
                        skill={skill}
                        onSelectSkill={(s) => setSelectedQuickSkill(s)}
                        viewMode="grid"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {visibleSkills.map((skill) => (
                    <SkillCard
                      key={skill.id || skill.itemKey}
                      skill={skill}
                      onSelectSkill={(s) => setSelectedQuickSkill(s)}
                      viewMode="list"
                    />
                  ))}
                </div>
              )}

              {/* Phân trang */}
              <SkillPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          ) : (
            /* Trạng thái rỗng */
            <div className="py-20 px-4 text-center bg-white rounded-[10px] border border-slate-200/90">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#1a56db] flex items-center justify-center mx-auto mb-4">
                <BookOpen size={26} />
              </div>
              <h3 className="text-lg font-bold text-[#273044] mb-2">
                Không tìm thấy kỹ năng phù hợp
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-5">
                Không có kỹ năng nào khớp với tiêu chí tìm kiếm hoặc bộ lọc bạn đã chọn. Vui lòng điều chỉnh hoặc xóa bộ lọc.
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

      {/* Drawer Bộ lọc */}
      <SkillFilterDrawer
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
        totalResults={filteredAndSortedSkills.length}
      />

      {/* Modal xem nhanh chi tiết skill */}
      <SkillDetailModal
        skill={selectedQuickSkill}
        isOpen={Boolean(selectedQuickSkill)}
        onClose={() => setSelectedQuickSkill(null)}
      />
    </div>
  );
}
