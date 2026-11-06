export type VerifyEmailResultStatus = 'success' | 'error' | 'info';

export const VERIFY_EMAIL_RESULT_STATUS_CONFIG = {
  success: {
    iconClass: 'fa-solid fa-circle-check text-success',
    iconBgClass: 'bg-green-50 border border-green-100',
    titleClass: 'text-success',
    badgeClass: 'bg-green-50 text-success border border-green-200',
    badgeIconClass: 'fa-solid fa-check',
    badgeText: 'Xác thực hoàn tất',
  },
  error: {
    iconClass: 'fa-solid fa-circle-xmark text-error',
    iconBgClass: 'bg-red-50 border border-red-100',
    titleClass: 'text-error',
    badgeClass: 'bg-red-50 text-error border border-red-200',
    badgeIconClass: 'fa-solid fa-xmark',
    badgeText: 'Không thành công',
  },
  info: {
    iconClass: 'fa-solid fa-circle-info text-primary',
    iconBgClass: 'bg-blue-50 border border-blue-100',
    titleClass: 'text-primary',
    badgeClass: 'bg-blue-50 text-primary border border-blue-200',
    badgeIconClass: 'fa-solid fa-info',
    badgeText: 'Đã xác thực trước đó',
  },
} as const;
