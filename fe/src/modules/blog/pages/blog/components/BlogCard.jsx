import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, Clock } from 'lucide-react';

/**
 * BlogCard - Card bài viết chuẩn thiết kế GATS
 * - Hỗ trợ cả 2 chế độ 'grid' và 'list'
 * - Typography chuyên nghiệp, bo góc [10px]/[12px], border-slate-200/90
 * - Bảo vệ 100% không để Object lọt vào React Child
 */
export default function BlogCard({ post, viewMode = 'grid' }) {
  if (!post) return null;

  const authorStr =
    typeof post.author === 'string'
      ? post.author
      : post.author?.userName || post.author?.name || 'GATS Academy';
  const titleStr =
    typeof post.title === 'string' ? post.title : 'Bài viết chuyên môn';
  const categoryStr =
    typeof post.category === 'string'
      ? post.category
      : post.category?.name || 'Insights';
  const descStr =
    typeof post.description === 'string'
      ? post.description
      : typeof post.excerpt === 'string'
        ? post.excerpt
        : '';
  const dateStr =
    typeof post.date === 'string' ? post.date : '05/03/2026';
  const slugStr =
    typeof post.slug === 'string' ? post.slug : `bai-viet-${post.id || 1}`;

  const tagsList = Array.isArray(post.tags)
    ? post.tags
        .map((t) => (typeof t === 'string' ? t : t?.name || t?.slug || ''))
        .filter(Boolean)
    : [];

  if (viewMode === 'list') {
    return (
      <article className="bg-white rounded-[10px] border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col sm:flex-row group hover:-translate-y-0.5">
        <Link
          to={`/post/${slugStr}`}
          className="sm:w-72 shrink-0 aspect-[16/10] sm:aspect-auto overflow-hidden bg-slate-900 relative block"
        >
          <img
            src={post.thumbnail}
            alt={titleStr}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-0.5 rounded-[4px] text-[11px] font-bold bg-[#1a56db] text-white tracking-wider uppercase shadow-xs">
              {categoryStr}
            </span>
          </div>
        </Link>

        <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1.5 text-slate-600 font-semibold">
                <User size={13} className="text-[#1a56db]" /> {authorStr}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Calendar size={13} /> {dateStr}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock size={13} /> 5 phút đọc
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-extrabold text-[#273044] leading-snug group-hover:text-[#1a56db] transition-colors line-clamp-2">
              <Link to={`/post/${slugStr}`}>{titleStr}</Link>
            </h3>

            {descStr && (
              <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                {descStr}
              </p>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            {tagsList.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {tagsList.slice(0, 2).map((t) => (
                  <span
                    key={t}
                    className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-[4px] font-medium"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            ) : <div />}

            <Link
              to={`/post/${slugStr}`}
              className="px-3.5 py-1.5 rounded-[6px] bg-slate-50 hover:bg-blue-50 text-[#1a56db] text-xs font-bold transition-colors border border-blue-100"
            >
              Xem chi tiết
            </Link>
          </div>
        </div>
      </article>
    );
  }

  // Grid Mode
  return (
    <article className="bg-white rounded-[10px] border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col group hover:-translate-y-1">
      <Link
        to={`/post/${slugStr}`}
        className="block aspect-[16/10] overflow-hidden bg-slate-900 relative"
      >
        <img
          src={post.thumbnail}
          alt={titleStr}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-0.5 rounded-[4px] text-[11px] font-bold bg-[#1a56db] text-white tracking-wider uppercase shadow-xs">
            {categoryStr}
          </span>
        </div>
      </Link>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5 text-slate-600 font-semibold truncate">
              <User size={13} className="text-[#1a56db] shrink-0" /> {authorStr}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 shrink-0">
              <Calendar size={13} /> {dateStr}
            </span>
          </div>

          <h3 className="text-base font-extrabold text-[#273044] leading-snug group-hover:text-[#1a56db] transition-colors line-clamp-2">
            <Link to={`/post/${slugStr}`}>{titleStr}</Link>
          </h3>

          {descStr && (
            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
              {descStr}
            </p>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-400 flex items-center gap-1 font-medium text-[11px]">
            <Clock size={12} /> 5 phút đọc
          </span>
          <Link
            to={`/post/${slugStr}`}
            className="px-3 py-1.5 rounded-[6px] bg-slate-50 hover:bg-blue-50 text-[#1a56db] font-bold transition-colors border border-blue-100 text-xs"
          >
            Xem chi tiết
          </Link>
        </div>
      </div>
    </article>
  );
}
