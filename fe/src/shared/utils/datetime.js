/**
 * Quy ước thời gian hiển thị của website: GIỜ VIỆT NAM.
 *
 * Dữ liệu API là ISO/UTC, vì vậy mọi chỗ format thời gian đều phải truyền
 * `timeZone` để kết quả không phụ thuộc múi giờ của máy người dùng.
 */
const VN_TZ = 'Asia/Ho_Chi_Minh';

function toDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** dd/mm/yyyy theo giờ Việt Nam. */
export function formatVnDate(value, fallback = '') {
  const date = toDate(value);
  if (!date) return fallback;
  return date.toLocaleDateString('vi-VN', {
    timeZone: VN_TZ,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/** dd/mm/yyyy hh:mm theo giờ Việt Nam. */
export function formatVnDateTime(value, fallback = '') {
  const date = toDate(value);
  if (!date) return fallback;
  return date.toLocaleString('vi-VN', {
    timeZone: VN_TZ,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** hh:mm theo giờ Việt Nam. */
export function formatVnTime(value, fallback = '') {
  const date = toDate(value);
  if (!date) return fallback;
  return date.toLocaleTimeString('vi-VN', {
    timeZone: VN_TZ,
    hour: '2-digit',
    minute: '2-digit',
  });
}
