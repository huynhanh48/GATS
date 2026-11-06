export const REFUND_REASON_CODES = [
  'wrong_course',
  'duplicate_payment',
  'content_issue',
  'within_policy',
  'other',
] as const;

export type RefundReasonCode = (typeof REFUND_REASON_CODES)[number];

export const REFUND_REASON_LABELS: Record<RefundReasonCode, string> = {
  wrong_course: 'Đăng ký nhầm khóa',
  duplicate_payment: 'Thanh toán trùng',
  content_issue: 'Không học được / lỗi nội dung',
  within_policy: 'Yêu cầu trong thời hạn chính sách hoàn tiền',
  other: 'Khác',
};
