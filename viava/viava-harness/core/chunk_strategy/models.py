from typing import Any
from pydantic import BaseModel, Field

class Chunk(BaseModel):
    """Một chunk sau khi split."""
    content: str
    index: int
    metadata: dict[str, Any] = Field(default_factory=dict)
    token_count: int = 0

class ChunkResult(BaseModel):
    """Kết quả trả về từ strategy."""
    chunks: list[Chunk]
    total_tokens: int
    strategy_name: str
    execution_time_ms: float

