import React from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { ChevronRight } from 'lucide-react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';

/**
 * Helper trích xuất thông tin an toàn từ đối tượng bài viết
 */
const getPostMeta = (post) => {
  if (!post) return {};
  const authorStr =
    typeof post.author === 'string'
      ? post.author
      : post.author?.userName || post.author?.name || 'GATS Academy';
  const titleStr =
    typeof post.title === 'string' ? post.title : 'Bài viết chuyên môn';
  const categoryStr =
    typeof post.category === 'string'
      ? post.category
      : post.category?.name || 'Chuyên mục';
  const dateStr =
    typeof post.date === 'string' ? post.date : '05/03/2026';
  const slugStr =
    typeof post.slug === 'string' ? post.slug : `bai-viet-${post.id || 1}`;
  const thumbnail =
    post.thumbnail ||
    post.coverImage ||
    post.image ||
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80';

  return { authorStr, titleStr, categoryStr, dateStr, slugStr, thumbnail };
};

/**
 * BlogFeaturedSection - Khối bài viết nổi bật đầu trang Blog
 * - Trên Desktop (>= 1024px) khi có >= 3 bài: Hiển thị Magazine Hero Grid 7/3 (70% trái + 30% phải) trong 1 container liền mạch
 * - Trên Mobile (< 1024px) hoặc khi có 1-2 bài: Hiển thị dạng Swiper Slider 1 bài mỗi lần trượt, tự động chuyển sau 5s với 3 dots tinh tế không nền
 */
export default function BlogFeaturedSection({ posts = [], className = '' }) {
  if (!posts || posts.length === 0) return null;

  // Lấy danh sách bài viết nổi bật (ưu tiên tối đa 3-6 bài đầu)
  const featuredPosts = posts.slice(0, 6);

  const mainPost = getPostMeta(featuredPosts[0]);
  const secondPost = getPostMeta(featuredPosts[1]);
  const thirdPost = getPostMeta(featuredPosts[2]);

  return (
    <div className={`w-full mb-8 ${className}`}>
      {/* Breadcrumb Navigation chuẩn Header */}
      <nav className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-4 select-none">
        <Link to="/" className="hover:text-[#1a56db] transition-colors">
          Trang chủ
        </Link>
        <ChevronRight size={13} className="text-slate-400" />
        <Link to="/blog" className="hover:text-[#1a56db] transition-colors">
          Bài viết
        </Link>
        <ChevronRight size={13} className="text-slate-400" />
        <span className="text-[#273044] font-bold">Xem tất cả</span>
      </nav>

      {/* ======================================================================
          1. GIAO DIỆN DESKTOP (>= lg): MAGAZINE GRID 7/3 TRONG 1 CONTAINER LIỀN MẠCH
          (Chỉ hiển thị khi có từ 3 bài trở lên trên Desktop)
          ====================================================================== */}
      {featuredPosts.length >= 3 && (
        <div className="hidden lg:grid grid-cols-10 w-full rounded-[12px] overflow-hidden border border-slate-200/80 bg-slate-950 shadow-sm items-stretch">
          {/* CỘT TRÁI (LỚN - 70%): BÀI VIẾT NỔI BẬT CHÍNH */}
          <Link
            to={`/post/${mainPost.slugStr}`}
            className="col-span-7 group relative min-h-[380px] xl:min-h-[440px] flex flex-col justify-end p-8 xl:p-10 transition-all block overflow-hidden"
          >
            {/* Ảnh Cover */}
            <img
              src={mainPost.thumbnail}
              alt={mainPost.titleStr}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              loading="eager"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

            {/* Content Thông tin bài viết */}
            <div className="relative z-10 space-y-2 max-w-2xl">
              <div>
                <span className="inline-block px-3 py-1 rounded-[4px] text-[11px] font-extrabold bg-[#1a56db] text-white tracking-wider uppercase shadow-xs">
                  {mainPost.categoryStr}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl xl:text-3xl font-extrabold text-white leading-tight group-hover:text-blue-200 transition-colors line-clamp-2">
                {mainPost.titleStr}
              </h2>

              <div className="text-xs sm:text-sm text-slate-300 font-medium pt-0.5">
                <span>Bởi {mainPost.authorStr}</span>
              </div>
            </div>
          </Link>

          {/* CỘT PHẢI (NHỎ - 30%): 2 BÀI VIẾT XẾP CHỒNG DỌC KHÍT LIỀN */}
          <div className="col-span-3 flex flex-col items-stretch border-l border-white/10">
            {/* Bài 2 (Nửa trên) */}
            <Link
              to={`/post/${secondPost.slugStr}`}
              className="group relative flex-1 min-h-0 flex flex-col justify-end p-5 xl:p-6 transition-all block overflow-hidden border-b border-white/10"
            >
              <img
                src={secondPost.thumbnail}
                alt={secondPost.titleStr}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent pointer-events-none" />

              <div className="relative z-10 space-y-1.5">
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-[4px] text-[10px] font-extrabold bg-[#1a56db] text-white tracking-wider uppercase shadow-xs">
                    {secondPost.categoryStr}
                  </span>
                </div>

                <h3 className="text-xs sm:text-sm xl:text-base font-bold text-white leading-snug group-hover:text-blue-200 transition-colors line-clamp-2">
                  {secondPost.titleStr}
                </h3>

                <div className="text-[11px] text-slate-300 font-medium">
                  <span>Bởi {secondPost.authorStr}</span>
                </div>
              </div>
            </Link>

            {/* Bài 3 (Nửa dưới) */}
            <Link
              to={`/post/${thirdPost.slugStr}`}
              className="group relative flex-1 min-h-0 flex flex-col justify-end p-5 xl:p-6 transition-all block overflow-hidden"
            >
              <img
                src={thirdPost.thumbnail}
                alt={thirdPost.titleStr}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent pointer-events-none" />

              <div className="relative z-10 space-y-1.5">
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-[4px] text-[10px] font-extrabold bg-[#1a56db] text-white tracking-wider uppercase shadow-xs">
                    {thirdPost.categoryStr}
                  </span>
                </div>

                <h3 className="text-xs sm:text-sm xl:text-base font-bold text-white leading-snug group-hover:text-blue-200 transition-colors line-clamp-2">
                  {thirdPost.titleStr}
                </h3>

                <div className="text-[11px] text-slate-300 font-medium">
                  <span>Bởi {thirdPost.authorStr}</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* ======================================================================
          2. GIAO DIỆN MOBILE (< lg) HOẶC KHI CHỈ CÓ 1-2 BÀI: SWIPER SLIDER CHỈ 1 SLIDE
          (Tự động chuyển sau 5s, 3 dynamic dots không nền, vuốt mượt mà)
          ====================================================================== */}
      <div
        className={`${
          featuredPosts.length >= 3 ? 'block lg:hidden' : 'block'
        } relative w-full rounded-[12px] overflow-hidden shadow-sm border border-slate-200/80 bg-slate-950 select-none`}
      >
        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={0}
          slidesPerView={1}
          loop={featuredPosts.length > 1}
          speed={700}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          pagination={{
            clickable: true,
            dynamicBullets: true,
            dynamicMainBullets: 3,
            el: '.gats-blog-swiper-dots',
          }}
          className="w-full h-full"
        >
          {featuredPosts.map((p, idx) => {
            const postMeta = getPostMeta(p);
            return (
              <SwiperSlide key={p.id || idx}>
                <Link
                  to={`/post/${postMeta.slugStr}`}
                  className="group relative block w-full overflow-hidden bg-slate-900 aspect-[16/10] sm:aspect-[16/8] max-h-[360px] flex items-end p-5 sm:p-7"
                >
                  <img
                    src={postMeta.thumbnail}
                    alt={postMeta.titleStr}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading={idx === 0 ? 'eager' : 'lazy'}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent pointer-events-none" />

                  <div className="relative z-10 space-y-1.5 max-w-full">
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded-[4px] text-[10px] sm:text-[11px] font-extrabold bg-[#1a56db] text-white tracking-wider uppercase shadow-xs">
                        {postMeta.categoryStr}
                      </span>
                    </div>

                    <h2 className="text-base sm:text-xl font-extrabold text-white leading-snug group-hover:text-blue-200 transition-colors line-clamp-2">
                      {postMeta.titleStr}
                    </h2>

                    <div className="text-[11px] sm:text-xs text-slate-300 font-medium">
                      <span>Bởi {postMeta.authorStr}</span>
                    </div>
                  </div>
                </Link>
              </SwiperSlide>
            );
          })}
        </Swiper>

        {/* Phân trang 3 dots tinh tế không nền */}
        {featuredPosts.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
            <div className="gats-blog-swiper-dots flex items-center justify-center gap-1.5" />
          </div>
        )}
      </div>

      {/* CSS tùy chỉnh dots không nền */}
      <style>{`
        .gats-blog-swiper-dots {
          position: static !important;
          transform: none !important;
        }
        .gats-blog-swiper-dots .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background: rgba(255, 255, 255, 0.55);
          opacity: 1;
          transition: all 0.3s ease;
          margin: 0 3px !important;
          cursor: pointer;
        }
        .gats-blog-swiper-dots .swiper-pagination-bullet:hover {
          background: rgba(255, 255, 255, 0.9);
        }
        .gats-blog-swiper-dots .swiper-pagination-bullet-active {
          width: 22px;
          border-radius: 9999px;
          background: #1a56db !important;
        }
        @media (min-width: 640px) {
          .gats-blog-swiper-dots .swiper-pagination-bullet-active {
            width: 28px;
          }
        }
      `}</style>
    </div>
  );
}
