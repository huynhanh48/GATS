from __future__ import annotations

from pydantic import BaseModel, Field


class OCRPage(BaseModel):
    page_number: int
    text: str
    confidence: float | None = None


class OCRResult(BaseModel):
    text: str
    pages: list[OCRPage] = Field(default_factory=list)
    metadata: dict = Field(default_factory=dict)
