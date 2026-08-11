from __future__ import annotations

from enum import StrEnum
from typing import Any

from pydantic import BaseModel, Field


class DocStatus(StrEnum):
    """Document processing status.
    Pipeline order: PENDING -> PARSING -> ANALYZING (optional) -> PROCESSING -> PROCESSED | FAILED.
    PREPROCESSED is deprecated, kept for backward compatibility.
    """

    PENDING = "pending"
    PARSING = "parsing"  # Phase 1: content extraction (parse_native/mineru/docling)
    PROCESSING = "processing"  # Phase 3: entity/relation extraction
    PREPROCESSED = "preprocessed"  # Deprecated: use ANALYZING in new pipeline
    PROCESSED = "processed"
    FAILED = "failed"

class DocProcessingStatus(BaseModel):
    doc_id: str
    status: DocStatus
    track_id: str | None = None
    file_path: str | None = None
    content_summary: str | None = None
    content_length: int = 0
    content_hash: str | None = None
    chunks_count: int = 0
    entities_count: int = 0
    relations_count: int = 0
    error: str | None = None
    created_at: str | None = None
    updated_at: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)
