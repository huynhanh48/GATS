import { httpClient } from '@/shared/api-client/httpClient';
import { API } from '@/shared/constants/api';

export function formatCourse(raw) {
  if (!raw) return null;

  // 1. Phân loại Liên hệ (Contact): price âm (-1, -2), null/undefined hoặc cờ isContact / chuỗi 'Liên hệ'
  const isContact =
    raw.isContact === true ||
    raw.pricingType === 'contact' ||
    raw.priceType === 'contact' ||
    raw.price === -1 ||
    raw.price === -2 ||
    raw.price === null ||
    raw.price === undefined ||
    String(raw.price).toLowerCase().includes('liên hệ') ||
    String(raw.price).toLowerCase().includes('contact');

  // 2. Phân loại Miễn phí (Free): price === 0 hoặc salePrice === 0 (và không phải liên hệ)
  const isFree =
    !isContact &&
    (raw.price === 0 ||
      raw.salePrice === 0 ||
      String(raw.price).toLowerCase() === 'free' ||
      String(raw.price).toLowerCase() === 'miễn phí');

  // 3. Phân loại Có phí (Paid)
  const isPaid = !isContact && !isFree;

  let priceValue = 0;
  let originalPriceValue = 0;
  let priceFormatted = 'Miễn phí';
  let originalPriceFormatted = null;

  if (isContact) {
    priceFormatted = 'Liên hệ';
    priceValue = 0;
  } else if (isFree) {
    priceFormatted = 'Miễn phí';
    priceValue = 0;
  } else {
    const basePrice = typeof raw.price === 'number' ? raw.price : parseFloat(String(raw.price).replace(/[^0-9]/g, '')) || 0;
    const salePrice = typeof raw.salePrice === 'number' ? raw.salePrice : parseFloat(String(raw.salePrice).replace(/[^0-9]/g, '')) || 0;

    if (salePrice > 0 && salePrice < basePrice) {
      priceValue = salePrice;
      originalPriceValue = basePrice;
      priceFormatted = `${salePrice.toLocaleString('vi-VN')}đ`;
      originalPriceFormatted = `${basePrice.toLocaleString('vi-VN')}đ`;
    } else if (salePrice > 0) {
      priceValue = salePrice;
      priceFormatted = `${salePrice.toLocaleString('vi-VN')}đ`;
    } else {
      priceValue = basePrice;
      priceFormatted = `${basePrice.toLocaleString('vi-VN')}đ`;
    }
  }

  return {
    id: raw.id,
    title: raw.title,
    slug: raw.slug,
    description:
      raw.description ||
      'Khóa học thực chiến giúp bạn làm chủ công nghệ và tự động hóa quy trình.',
    image:
      raw.thumbnail ||
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
    category: raw.category?.name || raw.category || 'Khóa học GATS',
    tags: Array.isArray(raw.tags) ? raw.tags.map((t) => (typeof t === 'string' ? t : t.name || t.slug)) : [],
    price: priceFormatted,
    originalPrice: originalPriceFormatted,
    priceValue,
    originalPriceValue,
    isFree,
    isContact,
    isPaid,
    pricingType: isContact ? 'contact' : isFree ? 'free' : 'paid',
    badge: raw.badge || null,
    badgeType: raw.badgeType || null,
    rating: raw.stats?.averageRating ? Number(raw.stats.averageRating) : (raw.rating || 5.0),
    students: raw.stats?.enrollmentCount ?? raw.students ?? 120,
    views: raw.stats?.lessonCount ? `${raw.stats.lessonCount} bài học` : raw.views || '24 bài học',
    lectures: `${raw.stats?.lessonCount || raw.lectures || 12} bài học`,
    duration: raw.stats?.totalDurationSeconds
      ? `${Math.max(1, Math.round(raw.stats.totalDurationSeconds / 3600))} giờ`
      : raw.duration || '6 giờ',
    level:
      raw.level === 'advanced'
        ? 'Advanced'
        : raw.level === 'intermediate'
          ? 'Intermediate'
          : 'Beginner',
    instructor: raw.author?.userName || raw.instructor || 'GATS Academy',
    instructorAvatar:
      raw.author?.avatar ||
      raw.instructorAvatar ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    raw,
  };
}

export const courseService = {
  async getCourses(params = {}) {
    const res = await httpClient.get(API.COURSES.LIST, { params });
    const list = Array.isArray(res?.data) ? res.data : [];
    return list.map(formatCourse);
  },

  async getCoursesWithPagination(params = {}) {
    const res = await httpClient.get(API.COURSES.LIST, { params });
    const list = Array.isArray(res?.data) ? res.data : [];
    return {
      courses: list.map(formatCourse),
      pagination: res?.pagination || {
        total: list.length,
        page: params.page || 1,
        totalPages: 1,
        hasMore: false,
      },
    };
  },

  async getCourseBySlug(slug) {
    try {
      const res = await httpClient.get(API.COURSES.DETAIL_BY_SLUG(slug));
      const courseData = res?.course || res?.data;
      return courseData ? formatCourse(courseData) : null;
    } catch {
      return null;
    }
  },

  async getCategories() {
    try {
      const res = await httpClient.get(API.COURSES.CATEGORIES);
      return Array.isArray(res?.data) ? res.data : [];
    } catch (err) {
      console.warn('Failed to fetch course categories:', err);
      return [];
    }
  },

  async getTags() {
    try {
      const res = await httpClient.get(API.COURSES.TAGS);
      return Array.isArray(res?.data) ? res.data : [];
    } catch (err) {
      console.warn('Failed to fetch course tags:', err);
      return [];
    }
  },

  async getCourseCurriculum(courseId, slug) {
    if (courseId) {
      try {
        const res = await httpClient.get(API.COURSES.CURRICULUM(courseId));
        if (Array.isArray(res?.data) && res.data.length > 0) {
          return res.data;
        }
      } catch {
        // Fallback to detail by slug
      }
    }

    if (slug) {
      try {
        const res = await httpClient.get(API.COURSES.DETAIL_BY_SLUG(slug));
        if (Array.isArray(res?.course?.sections) && res.course.sections.length > 0) {
          return res.course.sections;
        }
      } catch {
        // Ignore
      }
    }

    return [];
  },

  async getCourseSections(courseId) {
    try {
      const res = await httpClient.get(API.COURSES.SECTIONS(courseId));
      return Array.isArray(res?.data) ? res.data : [];
    } catch {
      return [];
    }
  },

  async getLessonDetail(slug, lessonSlugOrId) {
    try {
      const res = await httpClient.get(API.COURSES.LESSON(slug, lessonSlugOrId));
      return res?.lesson || res?.data || res || null;
    } catch {
      return null;
    }
  },

  async getLessonPlayback(courseId, lessonId) {
    try {
      const playbackRes = await httpClient.get(API.VIDEO.LESSON_PLAYBACK(courseId, lessonId));
      const data = playbackRes?.data || playbackRes;
      if (data?.playbackUrl) {
        return {
          videoId: data.videoId || null,
          playbackUrl: data.playbackUrl,
          audioFlacUrl: data.audioFlacUrl || null,
        };
      }
    } catch {
      // Fallback legacy 2-hop
      try {
        const lessonVideoRes = await httpClient.get(API.VIDEO.LESSON_VIDEO(courseId, lessonId));
        const videoId = lessonVideoRes?.data?.videoId || lessonVideoRes?.videoId;
        if (videoId) {
          const playbackRes = await httpClient.get(API.VIDEO.PLAYBACK(courseId, videoId));
          const pData = playbackRes?.data || playbackRes;
          return {
            videoId,
            playbackUrl: pData?.playbackUrl || '',
            audioFlacUrl: pData?.audioFlacUrl || null,
          };
        }
      } catch {
        // Ignore fallback error
      }
    }
    return { videoId: null, playbackUrl: '', audioFlacUrl: null };
  },

  async getCourseProgress(courseId) {
    try {
      const res = await httpClient.get(API.COURSES.PROGRESS(courseId));
      const data = res?.data || res || null;
      if (!data) return null;

      // Hỗ trợ cả camelCase, snake_case và nested array từ Backend
      const rawCompleted =
        data.completedLessonIds ||
        data.completed_lesson_ids ||
        (Array.isArray(data.completedLessons)
          ? data.completedLessons.map((l) => (typeof l === 'string' ? l : l.id || l.lesson_id || l.lessonId))
          : []) ||
        (Array.isArray(data.completed_lessons)
          ? data.completed_lessons.map((l) => (typeof l === 'string' ? l : l.id || l.lesson_id || l.lessonId))
          : []) ||
        [];

      const completedLessonIds = rawCompleted.map(String);

      return {
        completedLessons:
          typeof data.completedLessons === 'number'
            ? data.completedLessons
            : typeof data.completed_lessons_count === 'number'
              ? data.completed_lessons_count
              : completedLessonIds.length,
        totalLessons: data.totalLessons ?? data.total_lessons ?? 0,
        percent: data.percent ?? (data.totalLessons ? Math.round((completedLessonIds.length / data.totalLessons) * 100) : 0),
        completedLessonIds,
        nextLessonId: data.nextLessonId || data.next_lesson_id || null,
      };
    } catch {
      return null;
    }
  },

  /**
   * Quiz của một bài học (member view).
   * Trả về { id, title, description, questions[] } — KHÔNG kèm đáp án đúng.
   */
  async getLessonQuiz(courseId, lessonId) {
    try {
      const res = await httpClient.get(API.QUIZ.LESSON_QUIZ(courseId, lessonId));
      return res?.data || null;
    } catch (err) {
      // 404 = bài học chưa có quiz, coi như rỗng thay vì lỗi
      return null;
    }
  },

  /**
   * Nộp bài quiz một lần.
   * @param {string} quizId
   * @param {Array<{questionId: string, selectedAnswerId?: string, selectedAnswerIds?: string[], textAnswer?: string}>} answers
   */
  async submitQuiz(quizId, answers) {
    const res = await httpClient.post(API.QUIZ.SUBMIT(quizId), { answers });
    return res?.data || null;
  },

  async updateLessonProgress(courseId, lessonId, payload = {}) {
    try {
      // Backend BE schema:
      // PUT /api/courses/:courseId/lessons/:lessonId/progress
      // Body: { watched_seconds: number, duration_seconds?: number, video_id?: string }
      const watchedSecs = payload.watched_seconds ?? payload.watchedSeconds ?? 999999;
      const durationSecs = payload.duration_seconds ?? payload.durationSeconds ?? 600;
      const videoId = payload.video_id || payload.videoId || undefined;

      const body = {
        watched_seconds: Math.round(Number(watchedSecs)),
        duration_seconds: Math.round(Number(durationSecs)),
        ...(videoId ? { video_id: String(videoId) } : {}),
      };

      const res = await httpClient.put(API.COURSES.LESSON_PROGRESS(courseId, lessonId), body);
      return res?.data || res || null;
    } catch (err) {
      console.warn('Failed to update lesson progress:', err);
      return null;
    }
  },

  async getMyCourses() {
    try {
      const res = await httpClient.get(API.COURSES.MY_COURSES);
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      return list.map(formatCourse);
    } catch {
      return [];
    }
  },
};
