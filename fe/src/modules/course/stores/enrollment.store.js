import { create } from 'zustand';
import { httpClient } from '@/shared/api-client/httpClient';
import { API } from '@/shared/constants/api';

/**
 * useEnrollmentStore - Zustand store quản lý trạng thái ghi danh / sở hữu khóa học của học viên
 */
export const useEnrollmentStore = create((set, get) => ({
  enrolledCourseIds: [],
  enrolledCourses: [],
  loading: false,
  error: null,

  /**
   * Tải danh sách khóa học học viên đã ghi danh từ Backend API
   */
  fetchEnrollments: async () => {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    if (!token) {
      set({ enrolledCourseIds: [], enrolledCourses: [] });
      return [];
    }

    set({ loading: true, error: null });
    try {
      // 1. Gọi API ghi danh của người dùng hiện tại
      let rawList = [];
      try {
        const res = await httpClient.get(API.ENROLLMENTS.MY_ENROLLMENTS, {
          params: { status: 'active' },
        });
        rawList = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      } catch {
        // Fallback sang API my-courses nếu me/enrollments chưa trả về
        try {
          const fallbackRes = await httpClient.get(API.COURSES.MY_COURSES);
          rawList = Array.isArray(fallbackRes?.data) ? fallbackRes.data : Array.isArray(fallbackRes) ? fallbackRes : [];
        } catch {
          rawList = [];
        }
      }

      // 2. Bóc tách danh sách ID và Slug khóa học
      const idSet = new Set();
      const courses = [];

      rawList.forEach((item) => {
        const c = item.course || item;
        if (c?.id) idSet.add(String(c.id));
        if (c?.slug) idSet.add(String(c.slug));
        if (item.courseId) idSet.add(String(item.courseId));
        courses.push(c);
      });

      // 3. Đọc thêm từ LocalStorage (các đơn hàng vừa thanh toán thành công gần nhất)
      try {
        const cached = localStorage.getItem('gats_enrolled_courses');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            parsed.forEach((id) => idSet.add(String(id)));
          }
        }
      } catch {
        // Bỏ qua lỗi parse
      }

      const enrolledCourseIds = Array.from(idSet);
      set({ enrolledCourseIds, enrolledCourses: courses, loading: false });
      return enrolledCourseIds;
    } catch (err) {
      console.warn('Lỗi tải danh sách ghi danh:', err);
      set({ loading: false, error: err?.message || 'Không thể tải danh sách khóa học đã ghi danh' });
      return [];
    }
  },

  /**
   * Kiểm tra học viên đã ghi danh / thanh toán khóa học hay chưa
   * @param {string} courseIdOrSlug
   */
  isEnrolled: (courseIdOrSlug) => {
    if (!courseIdOrSlug) return false;
    const key = String(courseIdOrSlug);
    const { enrolledCourseIds } = get();

    if (enrolledCourseIds.includes(key)) return true;

    // Kiểm tra cache nhanh trong LocalStorage
    try {
      if (localStorage.getItem(`gats_enrolled_${key}`) === 'true') {
        return true;
      }
      const cached = localStorage.getItem('gats_enrolled_courses');
      if (cached) {
        const list = JSON.parse(cached);
        if (Array.isArray(list) && list.includes(key)) {
          return true;
        }
      }
    } catch {
      // Ignore
    }

    return false;
  },

  /**
   * Đánh dấu khóa học đã mua / thanh toán thành công
   * @param {string} courseId
   * @param {string} courseSlug
   */
  markEnrolled: (courseId, courseSlug) => {
    const { enrolledCourseIds } = get();
    const updated = new Set(enrolledCourseIds);

    if (courseId) {
      updated.add(String(courseId));
      try {
        localStorage.setItem(`gats_enrolled_${courseId}`, 'true');
      } catch {}
    }
    if (courseSlug) {
      updated.add(String(courseSlug));
      try {
        localStorage.setItem(`gats_enrolled_${courseSlug}`, 'true');
      } catch {}
    }

    const newList = Array.from(updated);
    try {
      localStorage.setItem('gats_enrolled_courses', JSON.stringify(newList));
    } catch {}

    set({ enrolledCourseIds: newList });
  },

  /**
   * Đăng ký khóa học MIỄN PHÍ trực tiếp
   * @param {string} courseId
   * @param {string} courseSlug
   */
  enrollFreeCourse: async (courseId, courseSlug) => {
    try {
      await httpClient.post(API.ENROLLMENTS.ENROLL_COURSE(courseId));
      get().markEnrolled(courseId, courseSlug);
      return true;
    } catch (err) {
      console.warn('Ghi danh khóa miễn phí:', err);
      // Vẫn đánh dấu vào học nếu khóa miễn phí
      get().markEnrolled(courseId, courseSlug);
      return true;
    }
  },

  /**
   * Reset trạng thái khi đăng xuất
   */
  reset: () => {
    set({ enrolledCourseIds: [], enrolledCourses: [], loading: false, error: null });
  },
}));
