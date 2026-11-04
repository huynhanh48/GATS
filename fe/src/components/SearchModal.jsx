import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, BookOpen, FileText, Star, Clock, Loader2, Sparkles } from 'lucide-react';
import { courseService } from '@/modules/course/services/courseService';
import { postService } from '@/modules/blog/services/postService';

export default function SearchModal({ isOpen, onClose, onSelectCourse }) {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'courses' | 'posts'
  const [courses, setCourses] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Tải dữ liệu khóa học và bài viết khi mở modal
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setActiveTab('all');
      document.body.style.overflow = '';
      return;
    }

    document.body.style.overflow = 'hidden';
    setTimeout(() => inputRef.current?.focus(), 100);

    let mounted = true;
    async function loadSearchData() {
      setLoading(true);
      try {
        const [courseList, postList] = await Promise.all([
          courseService.getCourses(),
          postService.getPosts(),
        ]);
        if (mounted) {
          setCourses(Array.isArray(courseList) ? courseList : []);
          setPosts(Array.isArray(postList) ? postList : []);
        }
      } catch {
        if (mounted) {
          setCourses([]);
          setPosts([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadSearchData();

    // Lắng nghe phím Escape
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      mounted = false;
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const normalizedQuery = query.trim().toLowerCase();

  // Lọc khóa học
  const matchedCourses = normalizedQuery
    ? courses.filter(
        (c) =>
          c.title?.toLowerCase().includes(normalizedQuery) ||
          c.category?.toLowerCase().includes(normalizedQuery) ||
          c.description?.toLowerCase().includes(normalizedQuery)
      )
    : [];

  // Lọc bài viết
  const matchedPosts = normalizedQuery
    ? posts.filter(
        (p) =>
          p.title?.toLowerCase().includes(normalizedQuery) ||
          p.category?.toLowerCase().includes(normalizedQuery) ||
          p.subtitle?.toLowerCase().includes(normalizedQuery) ||
          (Array.isArray(p.tags) && p.tags.some((t) => t.toLowerCase().includes(normalizedQuery)))
      )
    : [];

  const handleCourseClick = (course) => {
    onClose();
    if (onSelectCourse) {
      onSelectCourse(course);
    } else if (course.slug) {
      navigate(`/courses/${course.slug}`);
    }
  };

  const handlePostClick = (post) => {
    onClose();
    if (post.slug) {
      navigate(`/post/${post.slug}`);
    }
  };

  const totalResults =
    activeTab === 'courses'
      ? matchedCourses.length
      : activeTab === 'posts'
        ? matchedPosts.length
        : matchedCourses.length + matchedPosts.length;

  return (
    <div
      className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs flex items-start justify-center p-4 sm:p-6 pt-16 sm:pt-24 z-[99999] animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-[12px] shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input Bar */}
        <div className="flex items-center gap-3 p-4 sm:p-5 border-b border-slate-100 bg-white">
          <Search size={20} className="text-[#1a56db] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Tìm kiếm khóa học, bài viết, chuyên đề AI..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-sm sm:text-base font-medium text-[#273044] placeholder:text-slate-400 outline-none bg-transparent"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X size={16} />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-[#273044] rounded-[6px] hover:bg-slate-100 transition-colors cursor-pointer"
            title="Đóng cửa sổ"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filter Tabs */}
        {query.trim() !== '' && (
          <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-50/80 border-b border-slate-100 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-[6px] transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-[#1a56db] text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              Tất cả ({matchedCourses.length + matchedPosts.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('courses')}
              className={`px-3 py-1 rounded-[6px] transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'courses'
                  ? 'bg-[#1a56db] text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <BookOpen size={13} />
              <span>Khóa học ({matchedCourses.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('posts')}
              className={`px-3 py-1 rounded-[6px] transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'posts'
                  ? 'bg-[#1a56db] text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <FileText size={13} />
              <span>Bài viết ({matchedPosts.length})</span>
            </button>
          </div>
        )}

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 size={24} className="animate-spin text-[#1a56db]" />
              <span className="text-xs font-medium">Đang tìm kiếm dữ liệu...</span>
            </div>
          ) : query.trim() === '' ? (
            /* Gợi ý khi chưa nhập từ khóa */
            <div className="py-6 px-2 space-y-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <Sparkles size={14} className="text-[#1a56db]" />
                <span>Từ khóa phổ biến</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {['AI Coding', 'React 19', 'Prompt Engineering', 'NotebookLM', 'Automation', 'Google Gemini'].map(
                  (tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setQuery(tag)}
                      className="px-3 py-1.5 rounded-[6px] bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-[#1a56db] text-xs font-semibold transition-colors cursor-pointer border border-slate-200/60"
                    >
                      {tag}
                    </button>
                  )
                )}
              </div>
            </div>
          ) : totalResults === 0 ? (
            /* Không tìm thấy kết quả */
            <div className="py-12 text-center space-y-2">
              <p className="text-sm font-bold text-[#273044]">
                Không tìm thấy kết quả phù hợp cho "{query}"
              </p>
              <p className="text-xs text-slate-400">
                Hãy thử tìm kiếm với từ khóa khác như "AI", "React", "Prompt"...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Danh sách Khóa học */}
              {(activeTab === 'all' || activeTab === 'courses') && matchedCourses.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <BookOpen size={14} className="text-[#1a56db]" /> Khóa học
                    </span>
                    <span>{matchedCourses.length} kết quả</span>
                  </div>

                  <div className="space-y-2">
                    {matchedCourses.map((c) => (
                      <div
                        key={c.id || c.slug}
                        onClick={() => handleCourseClick(c)}
                        className="flex items-center gap-3.5 p-3 rounded-[8px] hover:bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all cursor-pointer group"
                      >
                        <img
                          src={c.image}
                          alt={c.title}
                          className="w-16 h-12 rounded-[6px] object-cover bg-slate-900 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-bold text-[#1a56db] uppercase tracking-wider">
                            {c.category || 'Khóa học'}
                          </span>
                          <h4 className="text-xs sm:text-sm font-bold text-[#273044] group-hover:text-[#1a56db] transition-colors truncate">
                            {c.title}
                          </h4>
                          <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                            <span className="flex items-center gap-1">
                              <Clock size={11} /> {c.duration || '6 giờ'}
                            </span>
                            <span className="flex items-center gap-1 text-amber-500 font-bold">
                              <Star size={11} className="fill-current" /> {c.rating || 5.0}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-extrabold text-[#1a56db] shrink-0">
                          {c.price || 'Miễn phí'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Danh sách Bài viết */}
              {(activeTab === 'all' || activeTab === 'posts') && matchedPosts.length > 0 && (
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <FileText size={14} className="text-[#1a56db]" /> Bài viết
                    </span>
                    <span>{matchedPosts.length} kết quả</span>
                  </div>

                  <div className="space-y-2">
                    {matchedPosts.map((p) => (
                      <div
                        key={p.id || p.slug}
                        onClick={() => handlePostClick(p)}
                        className="flex items-center gap-3.5 p-3 rounded-[8px] hover:bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all cursor-pointer group"
                      >
                        <img
                          src={p.thumbnail || p.image}
                          alt={p.title}
                          className="w-16 h-12 rounded-[6px] object-cover bg-slate-900 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-bold text-[#1a56db] uppercase tracking-wider">
                            {p.category || 'Bài viết'}
                          </span>
                          <h4 className="text-xs sm:text-sm font-bold text-[#273044] group-hover:text-[#1a56db] transition-colors truncate">
                            {p.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 truncate">
                            {p.date || 'GATS Academy'} • {p.readingTime || 5} phút đọc
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
