import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Loader2, Star, Clock, Trash2 } from 'lucide-react';
import { courseService } from '@/modules/course/services/courseService';

export default function Wishlist() {
  const navigate = useNavigate();
  const [wishlistCourses, setWishlistCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadWishlist() {
      setLoading(true);
      try {
        // Lấy wishlist từ localStorage hoặc API
        const savedIds = JSON.parse(localStorage.getItem('gats_wishlist') || '[]');
        if (savedIds.length > 0) {
          const list = await courseService.getCourses();
          if (mounted) {
            const filtered = (list || []).filter((c) =>
              savedIds.includes(String(c.id)) || savedIds.includes(c.slug)
            );
            setWishlistCourses(filtered);
          }
        } else {
          if (mounted) setWishlistCourses([]);
        }
      } catch (err) {
        console.warn('Lỗi tải danh sách yêu thích:', err);
        if (mounted) {
          setWishlistCourses([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadWishlist();
    return () => {
      mounted = false;
    };
  }, []);

  const handleRemove = (courseId) => {
    setWishlistCourses((prev) => prev.filter((c) => (c.id || c.slug) !== courseId));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#273044]">
            Whishlist
          </h2>

        </div>
        <Link
          to="/courses"
          className="text-xs font-bold text-[#1a56db] hover:underline shrink-0"
        >
          Xem thêm
        </Link>
      </div>

      {loading ? (
        <div className="min-h-[250px] flex flex-col items-center justify-center gap-3 bg-slate-50/50 rounded-[10px] border border-slate-100">
          <Loader2 size={32} className="animate-spin text-[#1a56db]" />
          <p className="text-xs font-medium text-slate-500">Đang tải danh sách yêu thích...</p>
        </div>
      ) : wishlistCourses.length === 0 ? (
        <div className="bg-slate-50/80 rounded-[10px] border border-dashed border-slate-200 p-12 text-center">
          <Heart size={44} className="text-slate-300 mx-auto mb-3" />
          <h3 className="font-extrabold text-[#273044] text-sm mb-1">
            Chưa có mục yêu thích nào
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
            Hãy nhấn biểu tượng trái tim trên các khóa học để lưu vào danh sách này.
          </p>
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[8px] bg-[#1a56db] hover:bg-[#1545b3] active:bg-[#0f348e] text-white text-xs font-bold transition-all shadow-2xs"
          >
            <ShoppingBag size={15} />
            <span>Xem khóa học phổ biến</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {wishlistCourses.map((item) => {
            const courseId = item.id || item.slug;
            return (
              <div
                key={courseId}
                className="bg-white rounded-[10px] border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group hover:-translate-y-0.5"
              >
                <div>
                  {/* Course Image */}
                  <div
                    className="relative aspect-video w-full overflow-hidden bg-slate-900 cursor-pointer"
                    onClick={() => navigate(`/courses/${item.slug || item.id}`)}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(courseId);
                      }}
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/90 hover:bg-rose-50 text-rose-500 hover:text-rose-600 transition-colors shadow-sm cursor-pointer"
                      title="Xóa khỏi yêu thích"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 space-y-2.5">
                    <span className="text-[11px] font-bold text-[#1a56db] uppercase tracking-wider block truncate">
                      {item.category || 'Khóa học GATS'}
                    </span>

                    <h3
                      className="text-sm font-extrabold text-[#273044] group-hover:text-[#1a56db] transition-colors line-clamp-2 leading-snug cursor-pointer min-h-[38px]"
                      onClick={() => navigate(`/courses/${item.slug || item.id}`)}
                    >
                      {item.title}
                    </h3>

                    {/* Meta specs */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-1 border-t border-slate-100">
                      <span className="flex items-center gap-1">
                        <Clock size={12} className="text-slate-400" /> {item.duration || '6 giờ'}
                      </span>
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star size={12} className="fill-current" />
                        <span>{item.rating || 5.0}</span>
                      </div>
                      <span className="font-extrabold text-[#1a56db] text-xs">
                        {item.price || 'Miễn phí'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 pt-0">
                  <button
                    type="button"
                    onClick={() => navigate(`/courses/${item.slug || item.id}`)}
                    className="w-full py-2 px-3 rounded-[6px] bg-[#1a56db] hover:bg-[#1545b3] active:bg-[#0f348e] text-white text-xs font-bold transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <span>Xem chi tiết khóa học</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
