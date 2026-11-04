import { httpClient } from '@/shared/api-client/httpClient';
import { API } from '@/shared/constants/api';

/**
 * authService - Quản lý toàn bộ API xác thực người dùng
 */
export const authService = {
  /**
   * Đăng nhập bằng Email/Tên đăng nhập và Mật khẩu
   * @param {{ email?: string, user_name?: string, identifier?: string, password: string }} data
   */
  async login(data) {
    const res = await httpClient.post(API.AUTH.LOGIN, data);
    const token = res?.token || res?.data?.token || res?.accessToken;
    if (token) {
      localStorage.setItem('access_token', token);
    }
    return res;
  },

  /**
   * Đăng ký tài khoản mới
   * @param {{ user_name: string, email: string, password: string }} data
   */
  async register(data) {
    return httpClient.post(API.AUTH.REGISTER, {
      ...data,
      type: 'default',
    });
  },

  /**
   * Đăng nhập bằng Google OAuth ID Token
   * @param {string} idToken
   */
  async googleLogin(idToken) {
    const res = await httpClient.post(API.AUTH.GOOGLE_LOGIN, { idToken });
    const token = res?.token || res?.data?.token || res?.accessToken;
    if (token) {
      localStorage.setItem('access_token', token);
    }
    return res;
  },

  /**
   * Yêu cầu đặt lại mật khẩu (Gửi email)
   * @param {string} email
   */
  async forgotPassword(email) {
    return httpClient.post(API.AUTH.FORGOT_PASSWORD, { email });
  },

  /**
   * Lấy thông tin tài khoản hiện tại (Profile)
   */
  async getMe() {
    const res = await httpClient.get(API.AUTH.ME);
    return res?.user || res?.data || res;
  },

  /**
   * Đăng xuất
   */
  logout() {
    localStorage.removeItem('access_token');
    sessionStorage.removeItem('access_token');
  },
};
