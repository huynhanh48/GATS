from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field


class ExtractedFile(BaseModel):
    content: str
    metadata: dict = Field(default_factory=dict)
    source: str
    format: str
    filename: str
    page_count: Optional[int] = None
