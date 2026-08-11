from __future__ import annotations

from pydantic import BaseModel


class TranscriptResult(BaseModel):
    text: str
    language: str | None = None
