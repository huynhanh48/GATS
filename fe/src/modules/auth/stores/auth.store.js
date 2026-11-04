import { create } from 'zustand';
import { authService } from '../services/authService';

/**
 * useAuthStore - Zustand Store quản lý phiên đăng nhập và trạng thái người dùng
 */
export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: Boolean(localStorage.getItem('access_token')),
  loading: false,
  error: null,

  /**
   * Khởi tạo và kiểm tra phiên đăng nhập hiện tại
   */
  initAuth: async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      set({ user: null, isAuthenticated: false });
      return;
    }

    try {
      set({ loading: true });
      const user = await authService.getMe();
      set({ user, isAuthenticated: true, error: null });
    } catch {
      authService.logout();
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ loading: false });
    }
  },

  /**
   * Đăng nhập tài khoản
   */
  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const res = await authService.login(credentials);
      // Tải profile người dùng sau khi login
      try {
        const user = await authService.getMe();
        set({ user, isAuthenticated: true, loading: false });
      } catch {
        set({
          user: { email: credentials.email || credentials.identifier, userName: credentials.user_name || 'Học viên' },
          isAuthenticated: true,
          loading: false,
        });
      }
      return res;
    } catch (err) {
      set({ error: err?.message || 'Đăng nhập thất bại', loading: false });
      throw err;
    }
  },

  /**
   * Đăng ký tài khoản
   */
  register: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await authService.register(data);
      set({ loading: false });
      return res;
    } catch (err) {
      set({ error: err?.message || 'Đăng ký thất bại', loading: false });
      throw err;
    }
  },

  /**
   * Đăng nhập bằng Google
   */
  loginWithGoogle: async (idToken) => {
    set({ loading: true, error: null });
    try {
      const res = await authService.googleLogin(idToken);
      const user = await authService.getMe();
      set({ user, isAuthenticated: true, loading: false });
      return res;
    } catch (err) {
      set({ error: err?.message || 'Đăng nhập Google thất bại', loading: false });
      throw err;
    }
  },

  /**
   * Đăng xuất
   */
  logout: () => {
    authService.logout();
    set({ user: null, isAuthenticated: false, error: null });
  },

  /**
   * Xóa lỗi
   */
  clearError: () => set({ error: null }),
}));

/**
 * useAuthUiStore - Zustand Store quản lý trạng thái hiển thị Popup/Modal Auth
 */
export const useAuthUiStore = create((set) => ({
  isAuthModalOpen: false,
  authModalTab: 'login', // 'login' | 'register' | 'forgot'
  openAuthModal: (tab = 'login') => set({ isAuthModalOpen: true, authModalTab: tab }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
  setAuthModalTab: (tab) => set({ authModalTab: tab }),
}));
