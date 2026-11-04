import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';

const COURSE_BANNER_SLIDES = [
  {
    id: 'working-ai',
    title: 'AI Coworking và Ứng dụng Thực chiến',
    image: '/courses/cowork.webp',
    alt: 'Working AI GATS Academy',
    categoryKey: 'coworking',
  },
  {
    id: 'mastery',
    title: 'Chương trình Đào tạo AI Toàn diện',
    image: '/courses/mastery.webp',
    alt: 'AI Mastery GATS Academy',
    categoryKey: 'mastery',
  },
  {
    id: 'studio',
    title: 'Xưởng Sáng tạo và Thiết kế Đa phương tiện AI',
    image: '/courses/studio.webp',
    alt: 'AI Studio GATS Academy',
    categoryKey: 'studio',
  },
  {
    id: 'automation',
    title: 'Tự động hóa Quy trình Doanh nghiệp với AI',
    image: '/courses/automation.webp',
    alt: 'AI Automation GATS Academy',
    categoryKey: 'automation',
  },
  {
    id: 'coding',
    title: 'Lập trình và Phát triển Ứng dụng cùng AI',
    image: '/courses/coding.webp',
    alt: 'AI Coding GATS Academy',
    categoryKey: 'coding',
  },
  {
    id: 'agent',
    title: 'Hệ thống Trợ lý Tự hành AI Agents',
    image: '/courses/agents.webp',
    alt: 'Autonomous AI Agents GATS Academy',
    categoryKey: 'agent',
  },
];

/**
 * Tìm banner phù hợp theo danh mục được chọn trên URL hoặc bộ lọc
 */
function getCategoryBanner(category) {
  if (!category) return null;
  const c = category.toLowerCase().trim();
  if (c.includes('cowork') || c.includes('working') || c.includes('làm việc') || c.includes('lam viec')) {
    return COURSE_BANNER_SLIDES[0];
  }
  if (c.includes('mastery') || c.includes('toàn diện') || c.includes('toan dien')) {
    return COURSE_BANNER_SLIDES[1];
  }
  if (c.includes('studio') || c.includes('thiết kế') || c.includes('thiet ke') || c.includes('media')) {
    return COURSE_BANNER_SLIDES[2];
  }
  if (c.includes('auto') || c.includes('tự động') || c.includes('tu dong')) {
    return COURSE_BANNER_SLIDES[3];
  }
  if (c.includes('cod') || c.includes('vibe') || c.includes('lập trình') || c.includes('lap trinh') || c.includes('program')) {
    return COURSE_BANNER_SLIDES[4];
  }
  if (c.includes('agent') || c.includes('trợ lý') || c.includes('tro ly') || c.includes('tự hành') || c.includes('tu hanh')) {
    return COURSE_BANNER_SLIDES[5];
  }
  return null;
}

/**
 * CourseBannerSlider - Slider trình chiếu banner khóa học:
 * - Khi có danh mục (URL ?category=... hoặc activeCategory): Hiển thị duy nhất ảnh banner tương ứng với danh mục đó
 * - Khi ở trạng thái Tất cả khóa học (mặc định): Tự động chuyển 6 slide mỗi 5s qua Swiper
 */
export default function CourseBannerSlider({
  slides = COURSE_BANNER_SLIDES,
  activeCategory = null,
  autoPlayInterval = 5000,
  className = '',
}) {
  const [searchParams] = useSearchParams();
  const currentCategory = activeCategory || searchParams.get('category');

  const singleCategoryBanner = useMemo(() => {
    return getCategoryBanner(currentCategory);
  }, [currentCategory]);

  // Nếu đang lọc theo 1 danh mục cụ thể và có ảnh banner tương ứng, hiển thị ảnh đơn tĩnh
  if (singleCategoryBanner) {
    return (
      <div
        className={`relative w-full rounded-[12px] overflow-hidden shadow-sm bg-slate-950 select-none ${className}`}
        id="courses-content-anchor"
      >
        <div className="w-full relative overflow-hidden bg-slate-900 aspect-[16/6] sm:aspect-[16/5] md:aspect-[21/7] max-h-[420px] flex items-center justify-center">
          <img
            src={singleCategoryBanner.image}
            alt={singleCategoryBanner.alt || singleCategoryBanner.title}
            className="w-full h-full object-cover block animate-in fade-in duration-300"
            loading="eager"
            decoding="async"
          />
        </div>
      </div>
    );
  }

  if (!slides || slides.length === 0) return null;

  return (
    <div
      className={`relative w-full rounded-[12px] overflow-hidden shadow-sm bg-slate-950 select-none ${className}`}
      id="courses-content-anchor"
    >
      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={0}
        slidesPerView={1}
        loop={true}
        speed={700}
        autoplay={{
          delay: autoPlayInterval,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
          dynamicMainBullets: 3,
          el: '.gats-swiper-pagination-dots',
        }}
        className="w-full h-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={slide.id || index}>
            <div className="w-full relative overflow-hidden bg-slate-900 aspect-[16/6] sm:aspect-[16/5] md:aspect-[21/7] max-h-[420px] flex items-center justify-center">
              <img
                src={slide.image}
                alt={slide.alt || slide.title || `Banner Khóa học ${index + 1}`}
                className="w-full h-full object-cover block"
                loading={index === 0 ? 'eager' : 'lazy'}
                decoding="async"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Phân trang 3 dots tinh tế, không nền */}
      <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
        <div className="gats-swiper-pagination-dots flex items-center justify-center gap-1.5" />
      </div>

      {/* CSS tùy chỉnh cho 3 dots không nền */}
      <style>{`
        .gats-swiper-pagination-dots {
          position: static !important;
          transform: none !important;
        }
        .gats-swiper-pagination-dots .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background: rgba(255, 255, 255, 0.55);
          opacity: 1;
          transition: all 0.3s ease;
          margin: 0 3px !important;
          cursor: pointer;
        }
        .gats-swiper-pagination-dots .swiper-pagination-bullet:hover {
          background: rgba(255, 255, 255, 0.9);
        }
        .gats-swiper-pagination-dots .swiper-pagination-bullet-active {
          width: 24px;
          border-radius: 9999px;
          background: #1a56db !important;
        }
        @media (min-width: 640px) {
          .gats-swiper-pagination-dots .swiper-pagination-bullet-active {
            width: 28px;
          }
        }
      `}</style>
    </div>
  );
}
