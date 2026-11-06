import { drizzle } from 'drizzle-orm/node-postgres';

import EnvVars from '@src/common/constants/env';
import { DB_TIME_ZONE } from '@src/common/constants/time';

import { relations } from './relations';

/**
 * Các cột thời gian là `timestamp without time zone`: Drizzle ghi/đọc chúng
 * theo UTC (xem `common/constants/time.ts`). Vì vậy session Postgres phải cũng
 * là UTC, nếu không `now()`/`defaultNow()` sẽ ghi giờ Việt Nam và bị lệch 7 giờ
 * khi đọc lên.
 *
 * `options=-c timezone=UTC` ghim điều này cho MỌI kết nối của pool, không phụ
 * thuộc cấu hình máy chủ Postgres.
 */
function withDbTimeZone(databaseUrl: string): string {
  const separator = databaseUrl.includes('?') ? '&' : '?';
  const options = encodeURIComponent(`-c timezone=${DB_TIME_ZONE}`);
  return `${databaseUrl}${separator}options=${options}`;
}

export const db = drizzle(withDbTimeZone(EnvVars.DatabaseUrl), { relations });

export default db;
