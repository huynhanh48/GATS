from __future__ import annotations

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    query: str = Field(..., description="Câu hỏi của người dùng")
    domains: list[str] | None = Field(
        default=None,
        description="Danh sách domain để lọc RAG. Để None thì không lọc theo domain. Ví dụ: ['programming', 'algorithms']",
    )


class ChatResponse(BaseModel):
    answer: str = Field(..., description="Câu trả lời từ LLM dựa trên RAG context")
    references: list[str] = Field(
        default_factory=list,
        description="Danh sách nguồn tham khảo từ knowledge graph đã dùng để sinh câu trả lời",
    )
