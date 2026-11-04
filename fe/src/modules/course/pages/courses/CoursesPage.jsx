import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { courseService } from '@/modules/course/services/courseService';
import { CourseCard } from '@/shared/components/CourseCard';
import { CourseFilterSidebar, CoursePagination, CourseBannerSlider } from './components';
import {
  LayoutGrid,
  List,
  SlidersHorizontal,
  Loader2,
  BookOpen,
  X,
  RotateCcw,
} from 'lucide-react';

const PAGE_SIZE = 9; // 9 khóa học mỗi trang

/**
 * CoursesPage - Trang danh sách khóa học
 * - Container full width đồng bộ với mainbar
 * - Sidebar chuyển thành Drawer trượt từ bên phải
 * - Toolbar trên lưới khóa học:
 *   + Bên trái: 2 icon chuyển đổi chế độ xem Grid / List
 *   + Bên phải: Dropdown sắp xếp (Mới nhất, Giá thấp đến cao, Giá cao đến thấp...) và Nút mở Drawer Bộ lọc
 * - CourseCard hiển thị chuẩn tỉ lệ, hover popup line-clamp-2 không bị to quá
 */
export default function CoursesPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [backendCategories, setBackendCategories] = useState([]);
  const [backendTags, setBackendTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' hoặc 'list'
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Bộ lọc và Sắp xếp UI State
  const [activeSort, setActiveSort] = useState('date_high');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [selectedRating, setSelectedRating] = useState('');
  const [selectedPrices, setSelectedPrices] = useState([]);
  const [selectedAvailability, setSelectedAvailability] = useState('all');

  // Đọc params từ URL và cập nhật vào bộ lọc (nếu không có param thì reset về rỗng)
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const tagParam = searchParams.get('tag');
    const levelParam = searchParams.get('level');

    setSelectedCategories(categoryParam ? [categoryParam] : []);
    setSelectedTags(tagParam ? [tagParam] : []);
    setSelectedLevels(levelParam ? [levelParam] : []);
    setCurrentPage(1);
  }, [searchParams]);

  // Lắng nghe sự kiện reset khi người dùng click vào "Khóa học" trên Header
  useEffect(() => {
    const handleHeaderReset = () => {
      setSelectedCategories([]);
      setSelectedTags([]);
      setSelectedStatus([]);
      setSelectedLevels([]);
      setSelectedRating('');
      setSelectedPrices([]);
      setSelectedAvailability('all');
      setActiveSort('date_high');
      setCurrentPage(1);
    };

    window.addEventListener('gats-reset-course-filters', handleHeaderReset);
    return () => window.removeEventListener('gats-reset-course-filters', handleHeaderReset);
  }, []);

  // 1. Tải danh mục và tags thực tế từ Backend
  useEffect(() => {
    let mounted = true;
    async function loadMeta() {
      try {
        const [cats, tags] = await Promise.all([
          courseService.getCategories(),
          courseService.getTags(),
        ]);
        if (mounted) {
          if (Array.isArray(cats) && cats.length > 0) {
            setBackendCategories(cats.map((c) => c.name || c.slug));
          }
          if (Array.isArray(tags) && tags.length > 0) {
            setBackendTags(tags.map((t) => t.name || t.slug));
          }
        }
      } catch (err) {
        console.warn('Lỗi tải categories hoặc tags từ Backend:', err);
      }
    }
    loadMeta();
    return () => {
      mounted = false;
    };
  }, []);

  // 2. Tải danh sách khóa học thực tế từ API Backend
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const data = await courseService.getCourses();
        if (mounted) {
          if (data && data.length > 0) {
            setCourses(data);
          } else {
            setCourses([]);
          }
        }
      } catch (err) {
        console.warn('Lỗi tải danh sách khóa học từ API Backend:', err);
        if (mounted) setCourses([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSelectCourse = (course) => {
    if (course?.slug) {
      navigate(`/courses/${course.slug}`);
    }
  };

  const handleResetFilters = () => {
    setSelectedCategories([]);
    setSelectedTags([]);
    setSelectedStatus([]);
    setSelectedLevels([]);
    setSelectedRating('');
    setSelectedPrices([]);
    setSelectedAvailability('all');
    setActiveSort('date_high');
    setCurrentPage(1);
  };

  const handleFilterChange = (setter) => (value) => {
    setter(value);
    setCurrentPage(1);
  };

  // Đếm tổng số lượng tiêu chí lọc đang được kích hoạt
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategories.length > 0) count += selectedCategories.length;
    if (selectedTags.length > 0) count += selectedTags.length;
    if (selectedStatus.length > 0) count += selectedStatus.length;
    if (selectedLevels.length > 0) count += selectedLevels.length;
    if (selectedRating) count += 1;
    if (selectedPrices.length > 0) count += selectedPrices.length;
    if (selectedAvailability !== 'all') count += 1;
    return count;
  }, [
    selectedCategories,
    selectedTags,
    selectedStatus,
    selectedLevels,
    selectedRating,
    selectedPrices,
    selectedAvailability,
  ]);

  // Lọc và sắp xếp danh sách khóa học
  const filteredAndSortedCourses = useMemo(() => {
    let result = [...courses];

    // 1. Lọc theo chuyên mục (Category từ BE)
    if (selectedCategories.length > 0) {
      result = result.filter((item) =>
        selectedCategories.some(
          (cat) => (item.category || '').toLowerCase() === cat.toLowerCase()
        )
      );
    }

    // 2. Lọc theo Tag từ BE
    if (selectedTags.length > 0) {
      result = result.filter((item) => {
        const itemTags = Array.isArray(item.tags)
          ? item.tags.map((t) => (typeof t === 'string' ? t.toLowerCase() : (t.name || t.slug || '').toLowerCase()))
          : [];
        const titleLower = (item.title || '').toLowerCase();
        const descLower = (item.description || '').toLowerCase();
        return selectedTags.some((tag) => {
          const tLower = tag.toLowerCase();
          return (
            itemTags.includes(tLower) ||
            titleLower.includes(tLower) ||
            descLower.includes(tLower)
          );
        });
      });
    }

    // 3. Lọc theo trạng thái (Status: hot, new, special)
    if (selectedStatus.length > 0) {
      result = result.filter((item) => {
        const itemStatus = (item.badgeType || item.badge || '').toLowerCase();
        return selectedStatus.some((st) => itemStatus.includes(st.toLowerCase()));
      });
    }

    // 4. Lọc theo cấp độ (Level: beginner, intermediate, advanced)
    if (selectedLevels.length > 0) {
      result = result.filter((item) => {
        const itemLevel = (item.level || '').toLowerCase();
        return selectedLevels.some((lvl) => {
          const l = lvl.toLowerCase();
          if (l === 'beginner') return itemLevel.includes('begin') || itemLevel.includes('cơ bản');
          if (l === 'intermediate') return itemLevel.includes('inter') || itemLevel.includes('trung cấp');
          if (l === 'advanced') return itemLevel.includes('advan') || itemLevel.includes('nâng cao');
          return itemLevel.includes(l);
        });
      });
    }

    // 5. Lọc theo đánh giá (Rating)
    if (selectedRating) {
      const minRating = parseFloat(selectedRating);
      result = result.filter((item) => (item.rating || 5) >= minRating);
    }

    // 6. Lọc theo mức giá (Price: Free, Paid, Contact)
    if (selectedPrices.length > 0) {
      result = result.filter((item) => {
        const isContact = Boolean(item.isContact || item.pricingType === 'contact' || item.price === 'Liên hệ');
        const isFree = !isContact && Boolean(item.isFree || item.pricingType === 'free' || item.price === 'Miễn phí' || item.price === 'Free');
        const isPaid = !isContact && !isFree;

        return selectedPrices.some((p) => {
          if (p === 'free') return isFree;
          if (p === 'paid') return isPaid;
          if (p === 'contact') return isContact;
          return true;
        });
      });
    }

    // 7. Lọc theo tình trạng (Availability)
    if (selectedAvailability !== 'all') {
      result = result.filter((item) => {
        const isComingSoon =
          item.isComingSoon ||
          item.availability === 'coming_soon' ||
          (item.price || '').toLowerCase().includes('coming');

        if (selectedAvailability === 'coming_soon') {
          return isComingSoon;
        }
        if (selectedAvailability === 'available_now') {
          return !isComingSoon;
        }
        return true;
      });
    }

    // 8. Sắp xếp (Sorting)
    result.sort((a, b) => {
      if (activeSort === 'date_low') {
        return (a.id || 0) - (b.id || 0);
      }
      if (activeSort === 'price_high') {
        const pA = a.priceValue ?? (a.isFree ? 0 : parseFloat(String(a.price).replace(/[^0-9.]/g, '')) || 0);
        const pB = b.priceValue ?? (b.isFree ? 0 : parseFloat(String(b.price).replace(/[^0-9.]/g, '')) || 0);
        return pB - pA;
      }
      if (activeSort === 'price_low') {
        const pA = a.priceValue ?? (a.isFree ? 0 : parseFloat(String(a.price).replace(/[^0-9.]/g, '')) || 0);
        const pB = b.priceValue ?? (b.isFree ? 0 : parseFloat(String(b.price).replace(/[^0-9.]/g, '')) || 0);
        return pA - pB;
      }
      if (activeSort === 'popular') {
        const vA = typeof a.views === 'number' ? a.views : parseInt(String(a.views).replace(/[^0-9]/g, ''), 10) || 0;
        const vB = typeof b.views === 'number' ? b.views : parseInt(String(b.views).replace(/[^0-9]/g, ''), 10) || 0;
        return vB - vA;
      }
      if (activeSort === 'rating') {
        return (b.rating || 5) - (a.rating || 5);
      }
      // date_high (Mặc định: mới nhất)
      return (b.id || 0) - (a.id || 0);
    });

    return result;
  }, [
    courses,
    selectedCategories,
    selectedTags,
    selectedStatus,
    selectedLevels,
    selectedRating,
    selectedPrices,
    selectedAvailability,
    activeSort,
  ]);

  // Tính toán phân trang
  const totalPages = Math.ceil(filteredAndSortedCourses.length / PAGE_SIZE) || 1;

  // Cắt danh sách theo trang hiện tại
  const visibleCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredAndSortedCourses.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredAndSortedCourses, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const anchor = document.getElementById('courses-content-anchor');
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
        <p className="text-sm font-medium text-slate-500">Đang tải danh sách khóa học...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen py-10 md:py-14">
      {/* VÙNG CHỨA CÙNG CHIỀU NGANG VỚI MAINBAR / HEADER */}
      <div className="container">
        {/* Hero Banner Slider hoặc Banner Danh mục */}
        <CourseBannerSlider activeCategory={selectedCategories[0]} className="mb-8" />

        {/* ========================================================
            THANH TOOLBAR:
            - Bên trái: 2 icon Grid / List view và số lượng
            - Bên phải: Dropdown Sắp xếp và Nút mở Drawer Bộ lọc
            - Cùng 1 hàng trên cả mobile và desktop
            ======================================================== */}
        <div className="bg-white rounded-[10px] border border-slate-200/90 p-2.5 sm:p-3 mb-6 shadow-sm flex items-center justify-between gap-2 sm:gap-4 flex-nowrap">
          {/* Bên trái: Toggle Grid / List View */}
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

            {/* Ẩn trên mobile để hàng toolbar luôn gọn gàng 1 dòng, hiện trên tablet/desktop */}
            <span className="text-xs font-medium text-slate-500 hidden sm:inline-block">
              Hiển thị <span className="font-bold text-[#273044]">{filteredAndSortedCourses.length}</span> khóa học
            </span>
          </div>

          {/* Bên phải: Dropdown Sắp xếp và Nút Bộ lọc - CÙNG 1 HÀNG TRÊN MOBILE */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Dropdown Sắp xếp */}
            <div className="relative flex items-center">
              <select
                value={activeSort}
                onChange={(e) => {
                  setActiveSort(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[#273044] text-[11px] sm:text-xs font-semibold rounded-[8px] pl-2.5 sm:pl-3.5 pr-7 sm:pr-8 py-2 cursor-pointer focus:outline-none focus:border-[#1a56db] transition-colors"
                aria-label="Sắp xếp khóa học"
              >
                <option value="date_high">Mới nhất</option>
                <option value="price_low">Giá: Thấp đến cao</option>
                <option value="price_high">Giá: Cao đến thấp</option>
                <option value="rating">Đánh giá cao nhất</option>
                <option value="popular">Xem nhiều nhất</option>
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

            {/* Nút bấm mở Drawer Bộ lọc */}
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

        {/* Số lượng khóa học hiển thị gọn gàng bên dưới toolbar trên mobile */}
        <div className="sm:hidden text-[11px] font-medium text-slate-400 -mt-3.5 mb-5 px-1 flex items-center justify-between">
          <span>Hiển thị {filteredAndSortedCourses.length} khóa học</span>
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
            VÙNG HIỂN THỊ KHÓA HỌC (GRID hoặc LIST)
            ======================================================== */}
        <main className="w-full">
          {visibleCourses.length > 0 ? (
            <>
              {/* Render theo chế độ Grid (3 cột) hoặc List (hàng ngang) */}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {visibleCourses.map((course) => (
                    <div key={course.id} className="h-full">
                      <CourseCard
                        course={course}
                        onSelectCourse={handleSelectCourse}
                        viewMode="grid"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {visibleCourses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      onSelectCourse={handleSelectCourse}
                      viewMode="list"
                    />
                  ))}
                </div>
              )}

              {/* Phân trang (Pagination) */}
              <CoursePagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          ) : (
            /* Trạng thái rỗng */
            <div className="py-20 px-4 text-center bg-[#f7f9fd] rounded-[10px] border border-[#e9eef5]">
              <div className="w-16 h-16 rounded-full bg-blue-50 text-[#1a56db] flex items-center justify-center mx-auto mb-4">
                <BookOpen size={28} />
              </div>
              <h3 className="text-lg font-bold text-[#273044] mb-2">
                Không tìm thấy khóa học phù hợp
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                Không có khóa học nào khớp với các tiêu chí bộ lọc bạn vừa chọn. Vui lòng điều chỉnh hoặc hoàn tác bộ lọc.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-6 py-2.5 rounded-[8px] bg-[#1a56db] hover:bg-[#1545b3] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Xóa toàn bộ bộ lọc
              </button>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================
          DRAWER BỘ LỌC (Trượt từ bên phải khi bấm nút Bộ lọc)
          - Trên mobile: TRÀN FULL 100% TOÀN MÀN HÌNH (w-full max-w-full)
          - Trên desktop: sm:max-w-md
          ======================================================== */}
      {filterDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop mờ nền */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setFilterDrawerOpen(false)}
          />

          {/* Panel Drawer: Trên mobile tràn full 100% (w-full max-w-full), desktop sm:max-w-md */}
          <div className="relative w-full max-w-full sm:max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
            {/* Header Drawer */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-[#1a56db]" />
                <h2 className="text-base font-bold text-[#273044]">Bộ lọc tìm kiếm</h2>
                {activeFilterCount > 0 && (
                  <span className="bg-[#1a56db] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setFilterDrawerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                aria-label="Đóng bộ lọc"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body Drawer (Cuộn với thanh cuộn ẩn no-scrollbar) */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-6">
              <CourseFilterSidebar
                categories={backendCategories}
                tags={backendTags}
                selectedCategories={selectedCategories}
                selectedTags={selectedTags}
                selectedStatus={selectedStatus}
                selectedLevels={selectedLevels}
                selectedRating={selectedRating}
                selectedPrices={selectedPrices}
                selectedAvailability={selectedAvailability}
                onCategoryChange={handleFilterChange(setSelectedCategories)}
                onTagChange={handleFilterChange(setSelectedTags)}
                onStatusChange={handleFilterChange(setSelectedStatus)}
                onLevelChange={handleFilterChange(setSelectedLevels)}
                onRatingChange={handleFilterChange(setSelectedRating)}
                onPriceChange={handleFilterChange(setSelectedPrices)}
                onAvailabilityChange={handleFilterChange(setSelectedAvailability)}
                onApplyFilters={() => {
                  setCurrentPage(1);
                  setFilterDrawerOpen(false);
                }}
                onResetFilters={handleResetFilters}
                isDrawer={true}
              />
            </div>

            {/* Footer Drawer Actions */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/80 shrink-0 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setCurrentPage(1);
                  setFilterDrawerOpen(false);
                }}
                className="flex-1 py-2.5 px-4 bg-[#1a56db] hover:bg-[#1545b3] active:bg-[#0f348e] text-white text-xs font-bold rounded-[8px] transition-colors text-center cursor-pointer shadow-sm"
              >
                Áp dụng bộ lọc ({filteredAndSortedCourses.length})
              </button>

              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1.5 py-2.5 px-4 border border-slate-200 bg-white hover:bg-slate-100 text-[#273044] text-xs font-bold rounded-[8px] transition-colors cursor-pointer"
                >
                  <RotateCcw size={13} />
                  <span>Xóa lọc</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
