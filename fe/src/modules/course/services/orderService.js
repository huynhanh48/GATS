import { httpClient } from '@/shared/api-client/httpClient';
import { API } from '@/shared/constants/api';

/**
 * orderService - Quản lý tạo đơn hàng, thanh toán VietQR / SePay và kiểm tra trạng thái
 */
export const orderService = {
  /**
   * Tạo đơn hàng mua khóa học chuẩn Backend
   * @param {{ courseId?: string, courseIds?: string[], couponCode?: string, paymentMethod?: string }} params
   */
  async createCourseOrder({ courseId, courseIds, couponCode, paymentMethod = 'bank_transfer' }) {
    const ids = courseIds || (courseId ? [courseId] : []);
    const items = ids.map((id) => ({
      courseId: id,
      quantity: 1,
    }));

    const resolvedMethod =
      paymentMethod === 'vietqr' || !paymentMethod ? 'bank_transfer' : paymentMethod;

    const res = await httpClient.post(API.ORDERS.CREATE, {
      items,
      couponCode: couponCode || undefined,
      paymentMethod: resolvedMethod,
    });
    return res?.data || res;
  },

  /**
   * Lấy chi tiết đơn hàng
   * @param {string} orderId
   */
  async getOrderDetail(orderId) {
    const res = await httpClient.get(API.ORDERS.DETAIL(orderId));
    return res?.data || res;
  },

  /**
   * Kiểm tra trạng thái thanh toán từ SePay
   * @param {string} txnRef - Mã giao dịch (VD: ORD1789...)
   */
  async checkSepayStatus(txnRef) {
    if (!txnRef) return null;
    try {
      const res = await httpClient.get(API.PAYMENT.CHECK_SEPAY(txnRef));
      return res?.data || res;
    } catch (err) {
      console.warn('Lỗi kiểm tra trạng thái SePay:', err);
      return null;
    }
  },

  /**
   * Hủy đơn hàng
   * @param {string} orderId
   */
  async cancelOrder(orderId) {
    const res = await httpClient.post(API.ORDERS.CANCEL(orderId));
    return res?.data || res;
  },
};
