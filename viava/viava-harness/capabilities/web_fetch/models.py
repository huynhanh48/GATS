from __future__ import annotations

from pydantic import BaseModel


class WebFetchItem(BaseModel):
    url: str
    status_code: int
    content_type: str
    content: str
    truncated: bool = False
