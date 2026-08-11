from __future__ import annotations

from pydantic import BaseModel


class TimeResult(BaseModel):
    timezone: str
    local_time: str
    date: str
    weekday: str
    utc_offset: str
    iso_8601: str
    unix_timestamp: int
