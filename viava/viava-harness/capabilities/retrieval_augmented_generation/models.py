from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field

from core.doc_status import DocProcessingStatus, DocStatus
from core.graph_storage import GraphEdge, GraphNode


# === Ingest ===

class DocInsert(BaseModel):
    """Đầu vào cho ainsert() — batch document insert như LightRAG"""

    contents: str | list[str]
    ids: str | list[str] | None = None
    file_paths: str | list[str] | None = None
    track_id: str | None = None
    domain: str | None = None
    category: str | dict[str, str] = "documentation"


class DocChunk(BaseModel):
    """Một chunk đã được chia sẵn từ bên ngoài, dùng với ainsert_custom_chunks()"""

    content: str
    chunk_order_index: int
    tokens: int | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class RAGDeleteResult(BaseModel):
    """Kết quả của thao tác xóa"""

    status: str
    doc_id: str | None = None
    message: str = ""


# === Retrieval ===

class RetrievalParam(BaseModel):
    """Tham số cho aretrieve() — mix mode (KG + vector retrieval)"""

    top_k: int = 60
    chunk_top_k: int = 20
    max_entity_tokens: int = 6000
    max_relation_tokens: int = 8000
    max_total_tokens: int = 30000
    hl_keywords: list[str] = Field(default_factory=list)
    ll_keywords: list[str] = Field(default_factory=list)
    enable_rerank: bool = True
    include_references: bool = True
    domain: str | None = None



class RetrievalContext(BaseModel):
    """Kết quả retrieval — raw context, không qua LLM generate"""

    entities: list[GraphNode] = Field(default_factory=list)
    relations: list[GraphEdge] = Field(default_factory=list)
    chunks: list[dict[str, Any]] = Field(default_factory=list)
    references: list[str] = Field(default_factory=list)
    metadata: dict[str, Any] = Field(default_factory=dict)


# === Generation ===


class GenerationParam(BaseModel):
    """Tham số cho agenerate() — LLM sinh câu trả lời từ context"""

    response_type: str = "Multiple Paragraphs"
    user_prompt: str | None = None


class GenerationOutput(BaseModel):
    """Kết quả generation — câu trả lời LLM + context đã dùng"""

    content: str
    raw_context: RetrievalContext = Field(default_factory=RetrievalContext)
