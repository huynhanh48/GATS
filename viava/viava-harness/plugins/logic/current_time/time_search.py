from __future__ import annotations

import logging
import re
from datetime import datetime, timezone, timedelta

from zoneinfo import ZoneInfo

from capabilities.current_time import CurrentTimeBase, TimeResult

logger = logging.getLogger(__name__)

_UTC_OFFSET_RE = re.compile(r"^UTC([+-])(\d{1,2})(?::(\d{2}))?$", re.IGNORECASE)


class ZoneInfoCurrentTime(CurrentTimeBase):
    async def get_current_time(self, timezone: str) -> TimeResult:
        tz = self._resolve_timezone(timezone)
        now = datetime.now(tz)

        offset = now.strftime("%z")
        utc_offset = f"UTC{offset[:3]}:{offset[3:]}"

        weekday_map = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        weekday_en = weekday_map[now.weekday()]

        weekday_vn = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"]
        weekday = f"{weekday_vn[now.weekday()]} ({weekday_en})"

        return TimeResult(
            timezone=str(tz),
            local_time=now.strftime("%H:%M:%S"),
            date=now.strftime("%Y-%m-%d"),
            weekday=weekday,
            utc_offset=utc_offset,
            iso_8601=now.isoformat(),
            unix_timestamp=int(now.timestamp()),
        )

    def _resolve_timezone(self, name: str) -> timezone | ZoneInfo:
        match = _UTC_OFFSET_RE.match(name.strip())
        if match:
            sign = 1 if match.group(1) == "+" else -1
            hours = int(match.group(2))
            minutes = int(match.group(3)) if match.group(3) else 0
            offset = timedelta(hours=sign * hours, minutes=sign * minutes)
            return timezone(offset)
        return ZoneInfo(name)
