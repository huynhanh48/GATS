import { httpClient } from '@/shared/api-client/httpClient';
import { API } from '@/shared/constants/api';

/**
 * leadService - Gửi và quản lý thông tin khách hàng liên hệ tư vấn khóa học
 */
export const leadService = {
  /**
   * Gửi biểu mẫu yêu cầu tư vấn khóa học
   * @param {Object} data
   * @param {string} data.fullName - Họ và tên
   * @param {string} data.phone - Số điện thoại
   * @param {string} [data.email] - Email liên hệ
   * @param {string} [data.courseId] - ID khóa học
   * @param {string} [data.courseTitle] - Tên khóa học
   * @param {string} [data.note] - Lời nhắn hoặc nhu cầu học tập
   * @param {string} [data.source] - Nguồn gửi (mặc định: 'course_consultation')
   */
  async submitLead(data) {
    const payload = {
      fullName: data.fullName || data.name || '',
      name: data.fullName || data.name || '',
      phone: data.phone || '',
      email: data.email || undefined,
      courseId: data.courseId || undefined,
      courseTitle: data.courseTitle || data.courseName || undefined,
      notes: data.note || data.notes || data.message || '',
      message: data.note || data.notes || data.message || '',
      source: data.source || 'course_consultation',
    };

    const res = await httpClient.post(API.LEADS.CREATE, payload);
    return res?.data || res;
  },
};
