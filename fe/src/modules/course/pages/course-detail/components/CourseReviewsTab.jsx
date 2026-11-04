import React from 'react';
import { Star, MessageSquare } from 'lucide-react';

/**
 * CourseReviewsTab - Tab 5: Đánh giá của học viên
 * - Điểm trung bình và số lượng đánh giá
 * - Biểu đồ phân bổ tỷ lệ phần trăm từ 5 sao đến 1 sao (đồng bộ ratingDistribution thực tế từ BE)
 * - Danh sách nhận xét của học viên (nếu chưa có review thực tế sẽ dùng danh sách review mẫu chất lượng cao)
 */
export default function CourseReviewsTab({ course }) {
  const stats = course?.raw?.stats || {};
  const hasRealStats = stats.ratingCount > 0 && stats.averageRating !== null;

  const ratingValue = hasRealStats
    ? Number(stats.averageRating)
    : Number(course?.rating || 5.0);

  const ratingCount = hasRealStats
    ? Number(stats.ratingCount)
    : 12; // Mẫu dự phòng

  // Phân bố sao thực tế từ Backend nếu có
  const rawDist = stats.ratingDistribution || {};
  const totalDistCount = Object.values(rawDist).reduce((a, b) => a + Number(b), 0);

  const distribution = [5, 4, 3, 2, 1].map((stars) => {
    if (totalDistCount > 0 && rawDist[stars] !== undefined) {
      const cnt = Number(rawDist[stars] || 0);
      const pct = Math.round((cnt / totalDistCount) * 100);
      return { stars, percentage: pct, count: cnt };
    }
    // Template mẫu dự phòng
    const fallbackPct = stars === 5 ? 85 : stars === 4 ? 12 : stars === 3 ? 3 : 0;
    return {
      stars,
      percentage: fallbackPct,
      count: Math.round(ratingCount * (fallbackPct / 100)),
    };
  });

  // Danh sách review mẫu dự phòng chất lượng cao
  const sampleReviews = [
    {
      id: 1,
      name: 'Nguyễn Văn Hùng',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      rating: 5,
      date: '3 ngày trước',
      content:
        'Khóa học cực kỳ thực chiến, nội dung rõ ràng và súc tích. Tôi đã áp dụng ngay vào công việc hàng ngày và tiết kiệm được ít nhất 2 giờ mỗi ngày.',
    },
    {
      id: 2,
      name: 'Trần Thị Mai',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      rating: 5,
      date: '1 tuần trước',
      content:
        'Giảng viên giải thích rất tận tâm và dễ hiểu. Bộ tài liệu đính kèm kèm prompt mẫu rất giá trị, đáng từng đồng đầu tư.',
    },
    {
      id: 3,
      name: 'Lê Minh Tuấn',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
      rating: 4,
      date: '2 tuần trước',
      content:
        'Chất lượng âm thanh và hình ảnh bài giảng rất tốt. Hy vọng học viện sẽ có thêm nhiều chuyên đề nâng cao hơn nữa trong tương lai.',
    },
  ];

  // Lấy reviews thực từ course nếu có, ngược lại dùng fallback
  const realReviews = Array.isArray(course?.raw?.reviews) && course.raw.reviews.length > 0
    ? course.raw.reviews
    : [];

  const displayReviews = realReviews.length > 0 ? realReviews : sampleReviews;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-2.5 pb-4 border-b border-slate-200">
        <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
          <MessageSquare size={18} />
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#273044]">
          Đánh giá từ học viên
        </h2>
      </div>

      {/* Khung tổng quan điểm số và Biểu đồ sao */}
      <div className="bg-[#f8fafc] border border-slate-200/90 rounded-[10px] p-6 sm:p-8 flex flex-col md:flex-row items-center gap-8">
        {/* Điểm tổng quan */}
        <div className="text-center md:border-r md:border-slate-200 md:pr-8 shrink-0">
          <div className="text-5xl font-extrabold text-[#273044] mb-2">
            {ratingValue.toFixed(1)}
          </div>
          <div className="flex items-center justify-center text-amber-400 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={18}
                className={
                  i < Math.floor(ratingValue)
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-slate-200 text-slate-200'
                }
              />
            ))}
          </div>
          <p className="text-xs font-semibold text-slate-500">
            Dựa trên {ratingCount} đánh giá
          </p>
        </div>

        {/* Biểu đồ phân bổ sao */}
        <div className="w-full flex-1 space-y-2.5">
          {distribution.map((item) => (
            <div key={item.stars} className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1 w-12 font-semibold text-[#273044]">
                <span>{item.stars}</span>
                <Star size={12} className="fill-amber-400 text-amber-400" />
              </div>

              <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>

              <span className="w-10 text-right text-slate-400 font-medium">
                {item.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Danh sách bình luận & nhận xét */}
      <div className="space-y-4">
        {displayReviews.map((review, idx) => {
          const authorName = review.userName || review.name || review.user?.name || 'Học viên GATS';
          const authorAvatar =
            review.userAvatar ||
            review.avatar ||
            review.user?.avatar ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${authorName}`;
          const reviewRating = review.rating || 5;
          const reviewContent = review.content || 'Khóa học rất hữu ích và mang tính ứng dụng cao.';
          const reviewDate = review.createdAt
            ? new Date(review.createdAt).toLocaleDateString('vi-VN')
            : review.date || 'Gần đây';

          return (
            <div
              key={review.id || idx}
              className="p-5 bg-white border border-slate-200 rounded-[10px] shadow-2xs space-y-3"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={authorAvatar}
                    alt={authorName}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#273044]">
                      {authorName}
                    </h4>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {reviewDate}
                    </span>
                  </div>
                </div>

                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={
                        i < reviewRating
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-slate-200 text-slate-200'
                      }
                    />
                  ))}
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {reviewContent}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
