from __future__ import annotations

from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class DistanceMetric(str, Enum):
    """Thuật toán đo khoảng cách (distance metric) dùng trong vector search"""

    COSINE = "cosine"
    """Cosine similarity — đo góc giữa 2 vector"""

    EUCLIDEAN = "euclidean"
    """Euclidean distance (L2) — khoảng cách hình học"""

    DOT_PRODUCT = "dot"
    """Dot product (inner product) — tích vô hướng giữa 2 vector"""


class ScoredItem(BaseModel):
    """Một kết quả (hit) trả về từ vector search

    Mỗi item đại diện cho một bản ghi được tìm thấy kèm
    similarity score — điểm tương đồng giữa query và bản ghi.
    """

    id: str
    """Định danh duy nhất của bản ghi trong storage"""

    content: str
    """Nội dung văn bản gốc của bản ghi"""

    score: float
    """Điểm tương đồng (similarity score) — giá trị càng cao càng giống query"""

    metadata: dict[str, Any] = Field(default_factory=dict)
    """Metadata bổ sung kèm theo bản ghi (VD: source, timestamp, tags, domain)"""
