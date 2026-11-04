import { create } from 'zustand';

export const useToastStore = create((set, get) => ({
  toasts: [],
  addToast: (toast) => {
    const rawMsg = typeof toast.message === 'string' ? toast.message : toast.message?.message || '';
    if (!rawMsg) return null;

    // Ngăn chặn duplicate toasts với cùng nội dung trong danh sách đang hiển thị
    const existing = get().toasts.find((t) => t.message === rawMsg);
    if (existing) return existing.id;

    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    const newToast = {
      id,
      type: toast.type || 'info', // 'success' | 'error' | 'warning' | 'info'
      title: toast.title || '',
      message: rawMsg,
      duration: toast.duration ?? 4000,
    };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    if (newToast.duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, newToast.duration);
    }

    return id;
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
  clearAll: () => set({ toasts: [] }),
}));

export const toast = {
  success(message, options = {}) {
    return useToastStore.getState().addToast({
      type: 'success',
      message: typeof message === 'string' ? message : message?.message || 'Thành công',
      title: options.title || 'Thành công',
      duration: options.duration ?? 4000,
    });
  },
  error(message, options = {}) {
    return useToastStore.getState().addToast({
      type: 'error',
      message: typeof message === 'string' ? message : message?.message || 'Có lỗi xảy ra',
      title: options.title || 'Thông báo',
      duration: options.duration ?? 5000,
    });
  },
  warning(message, options = {}) {
    return useToastStore.getState().addToast({
      type: 'warning',
      message: typeof message === 'string' ? message : message?.message || '',
      title: options.title || 'Cảnh báo',
      duration: options.duration ?? 4500,
    });
  },
  info(message, options = {}) {
    return useToastStore.getState().addToast({
      type: 'info',
      message: typeof message === 'string' ? message : message?.message || '',
      title: options.title || 'Thông tin',
      duration: options.duration ?? 4000,
    });
  },
};
