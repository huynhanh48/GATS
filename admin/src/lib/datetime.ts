import { APP_TIME_ZONE } from "@/lib/timezone";

const VN_TZ = APP_TIME_ZONE;

/**
 * Toàn bộ thời gian hiển thị trên admin là giờ Việt Nam.
 * Dữ liệu API là ISO/UTC, luôn format kèm `timeZone: VN_TZ` để kết quả không
 * phụ thuộc múi giờ của máy chạy SSR (Docker thường là UTC).
 */
export function formatVnDateTime(value: string | Date | null | undefined): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("vi-VN", {
      timeZone: VN_TZ,
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return String(value);
  }
}

/** Chỉ ngày (dd/mm/yyyy) theo giờ Việt Nam. */
export function formatVnDate(value: string | Date | null | undefined, fallback = "—"): string {
  if (!value) return fallback;
  try {
    return new Date(value).toLocaleDateString("vi-VN", {
      timeZone: VN_TZ,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return String(value);
  }
}

/** Chỉ giờ:phút theo giờ Việt Nam. */
export function formatVnTime(value: string | Date | null | undefined): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleTimeString("vi-VN", {
      timeZone: VN_TZ,
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(value);
  }
}
