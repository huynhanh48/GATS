import { toast } from "sonner";

export const showToast = {
  success: (message: string, description?: string) => {
    toast.success(message, { description });
  },
  error: (message: string, description?: string) => {
    toast.error(message, { description });
  },
  warning: (message: string, description?: string) => {
    toast.warning(message, { description });
  },
  info: (message: string, description?: string) => {
    toast.info(message, { description });
  },
  apiError: (error: any, defaultMessage = "Đã xảy ra lỗi khi kết nối với máy chủ") => {
    // Axios response data fallback structure
    const errorMessage = error?.error || error?.message || defaultMessage;
    toast.error("Lỗi kết nối API", {
      description: errorMessage,
    });
  }
};
