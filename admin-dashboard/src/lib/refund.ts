export const REFUND_REASON_OPTIONS = [
  { value: "wrong_course", label: "Đăng ký nhầm khóa" },
  { value: "duplicate_payment", label: "Thanh toán trùng" },
  { value: "content_issue", label: "Không học được / lỗi nội dung" },
  { value: "within_policy", label: "Yêu cầu trong thời hạn chính sách hoàn tiền" },
  { value: "other", label: "Khác" },
] as const;

export type RefundReasonCode = (typeof REFUND_REASON_OPTIONS)[number]["value"];

export const REFUND_REASON_LABELS: Record<RefundReasonCode, string> = {
  wrong_course: "Đăng ký nhầm khóa",
  duplicate_payment: "Thanh toán trùng",
  content_issue: "Không học được / lỗi nội dung",
  within_policy: "Yêu cầu trong thời hạn chính sách hoàn tiền",
  other: "Khác",
};
