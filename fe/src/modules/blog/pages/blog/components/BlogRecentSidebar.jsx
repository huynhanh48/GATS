import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, BookOpen, Tag } from 'lucide-react';

/**
 * BlogRecentSidebar - Cột bên trái hiển thị Tìm kiếm, Danh mục, Bài viết gần nhất và Thẻ tags
 * - Thiết kế tối giản, sạch sẽ, không dùng màu AI lòe loẹt
 * - Bảo vệ 100% không để Object lọt vào React Child
 */
export default function BlogRecentSidebar({
  searchQuery = '',
  onSearchChange,
  categories = [],
  activeCategory = 'all',
  onCategorySelect,
  categoryCounts = {},
  recentPosts = [],
  tags = [],
  activeTag = '',
  onTagSelect,
}) {
  return (
    <aside className="space-y-6">
      {/* 1. HỘP TÌM KIẾM BÀI VIẾT */}
      <div className="bg-white rounded-[10px] border border-slate-200/90 p-5 shadow-2xs">
        <h3 className="text-sm font-extrabold text-[#273044] mb-3">
          Search
        </h3>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Nhập từ khóa tìm kiếm..."
            className="w-full pl-9 pr-3 py-2 rounded-[8px] border border-slate-200 text-xs sm:text-sm text-[#273044] focus:outline-none focus:border-[#1a56db] transition-colors"
          />
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </div>
      </div>

      {/* 2. DANH MỤC BÀI VIẾT */}
      <div className="bg-white rounded-[10px] border border-slate-200/90 p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-100">
          <h3 className="text-sm font-extrabold text-[#273044] flex items-center gap-2">
            <BookOpen size={16} className="text-[#1a56db]" />
            <span>Danh mục</span>
          </h3>
          {activeCategory !== 'all' && (
            <button
              type="button"
              onClick={() => onCategorySelect?.('all')}
              className="text-xs text-[#1a56db] hover:underline font-semibold cursor-pointer"
            >
              Tất cả
            </button>
          )}
        </div>

        <ul className="space-y-1.5">
          <li>
            <button
              type="button"
              onClick={() => onCategorySelect?.('all')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-[6px] text-xs font-semibold transition-all cursor-pointer select-none text-left ${
                activeCategory === 'all'
                  ? 'bg-blue-50 text-[#1a56db] font-bold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-[#273044]'
              }`}
            >
              <span>Tất cả bài viết</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                {Object.values(categoryCounts).reduce((a, b) => a + b, 0)}
              </span>
            </button>
          </li>
          {categories.map((cat) => {
            const catName = typeof cat === 'string' ? cat : (cat?.name || 'Chuyên mục');
            const isActive = activeCategory === catName;
            const count = categoryCounts[catName] || 0;
            return (
              <li key={catName}>
                <button
                  type="button"
                  onClick={() => onCategorySelect?.(isActive ? 'all' : catName)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-[6px] text-xs font-semibold transition-all cursor-pointer select-none text-left ${
                    isActive
                      ? 'bg-blue-50 text-[#1a56db] font-bold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-[#273044]'
                  }`}
                >
                  <span className="truncate pr-2">{catName}</span>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-blue-100 text-[#1a56db]'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* 3. BÀI VIẾT GẦN NHẤT (RECENT POSTS) */}
      <div className="bg-white rounded-[10px] border border-slate-200/90 p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-slate-100">
          <h3 className="text-sm font-extrabold text-[#273044]">
            News recently
          </h3>
        </div>

        {recentPosts.length === 0 ? (
          <p className="text-xs text-slate-400 py-2 text-center">
            Chưa có bài viết gần đây
          </p>
        ) : (
          <div className="space-y-4">
            {recentPosts.slice(0, 5).map((post) => {
              const titleStr = typeof post.title === 'string' ? post.title : 'Bài viết';
              const dateStr = typeof post.date === 'string' ? post.date : '05/03/2026';
              const slugStr = typeof post.slug === 'string' ? post.slug : `bai-viet-${post.id || 1}`;

              return (
                <article
                  key={post.id || slugStr}
                  className="flex items-start gap-3.5 group cursor-pointer"
                >
                  <Link
                    to={`/post/${slugStr}`}
                    className="w-16 h-16 rounded-[8px] overflow-hidden shrink-0 bg-slate-100 block border border-slate-200/60"
                  >
                    <img
                      src={post.thumbnail}
                      alt={titleStr}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </Link>

                  <div className="min-w-0 flex-1 space-y-1">
                    <h4 className="text-xs font-bold text-[#273044] group-hover:text-[#1a56db] transition-colors line-clamp-2 leading-snug">
                      <Link to={`/post/${slugStr}`}>{titleStr}</Link>
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        {dateStr}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. THẺ TỪ KHÓA (TAGS CLOUD) */}
      {tags.length > 0 && (
        <div className="bg-white rounded-[10px] border border-slate-200/90 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-100">
            <h3 className="text-sm font-extrabold text-[#273044] flex items-center gap-2">
              <Tag size={15} className="text-[#1a56db]" />
              <span>Tags</span>
            </h3>
            {activeTag && (
              <button
                type="button"
                onClick={() => onTagSelect?.('')}
                className="text-xs text-[#1a56db] hover:underline font-semibold cursor-pointer"
              >
                Xóa lọc
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {tags.map((t) => {
              const tagStr = typeof t === 'string' ? t : (t?.name || '');
              if (!tagStr) return null;
              const isSelected = activeTag === tagStr;
              return (
                <button
                  key={tagStr}
                  type="button"
                  onClick={() => onTagSelect?.(isSelected ? '' : tagStr)}
                  className={`px-2.5 py-1 rounded-[6px] text-xs font-semibold transition-colors cursor-pointer select-none ${
                    isSelected
                      ? 'bg-[#1a56db] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-[#273044]'
                  }`}
                >
                  #{tagStr}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
}
