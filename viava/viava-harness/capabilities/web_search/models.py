from __future__ import annotations

from typing import List, Optional
from pydantic import BaseModel, Field


class WebSearchItem(BaseModel):
    title: str
    url: str
    snippet: str


class WebSearchResult(BaseModel):
    items: List[WebSearchItem] = Field(default_factory=list)
    total_estimated: Optional[int] = None
