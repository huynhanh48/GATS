/**
 * Quy ước thời gian của toàn hệ thống GATS.
 *
 * Các cột thời gian trong DB là `timestamp without time zone` (giờ tường, không
 * kèm offset). Drizzle ORM LUÔN ghi/đọc các cột này theo UTC
 * (`value.toISOString()` khi ghi, `+0000` khi đọc), nên:
 *
 *   - Mọi giá trị `timestamp` trong DB là UTC (nguồn dữ liệu duy nhất).
 *   - `now()` / `defaultNow()` của Postgres phải cũng là UTC ⇒ session DB được
 *     ghim `timezone=UTC` (xem `src/db/index.ts` và `docker/dev-entrypoint.sh`).
 *   - be/fe/admin HIỂN THỊ theo giờ Việt Nam (`APP_TIME_ZONE`).
 *
 * Nếu session DB lệch khỏi UTC, giá trị do `defaultNow()` sinh ra sẽ lệch đúng
 * 7 giờ khi đọc lên (đây là lỗi "17h thay vì 10h" đã gặp).
 */

/** Múi giờ hiển thị của hệ thống (giờ Việt Nam, GMT+7). */
export const APP_TIME_ZONE = 'Asia/Ho_Chi_Minh';

/** Múi giờ lưu trữ trong DB — luôn UTC để khớp với Drizzle. */
export const DB_TIME_ZONE = 'UTC';

/** Ghim TZ cho tiến trình Node (quyết định cách hiển thị/hiển thị log). */
export function applyProcessTimeZone(): void {
  if (process.env.TZ !== APP_TIME_ZONE) {
    process.env.TZ = APP_TIME_ZONE;
  }
}
