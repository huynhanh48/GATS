from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any

from core.doc_status import DocProcessingStatus, DocStatus
from core.graph_storage import GraphEdge, GraphNode, KnowledgeGraph

from .models import (
    DocChunk,
    DocInsert,
    GenerationOutput,
    GenerationParam,
    RAGDeleteResult,
    RetrievalContext,
    RetrievalParam,
)


class BaseRAG(ABC):
    """Interface cho RAG capability — retrieval + LLM generation.

    Implementation nằm ở ``plugins/logic/retrieval_augmented_generation/``.
    Mọi dependency (embedding, vector store, graph store, LLM, ...)
    được inject qua constructor DI — không gọi provider trực tiếp.
    """

    # === Ingest ===

    @abstractmethod
    async def ainsert(self, input: DocInsert) -> str:
        """Insert documents với checkpoint support.

        Process inline (chunk → extract → embed → store),
        trả về track_id để theo dõi trạng thái.
        """
        ...

    @abstractmethod
    async def ainsert_custom_chunks(
        self, full_text: str, chunks: list[DocChunk], doc_id: str | None = None
    ) -> str:
        """Insert document với chunks đã được chia sẵn từ bên ngoài.

        Args:
            full_text: Toàn bộ nội dung document (để lưu trữ tham khảo).
            chunks: Danh sách các chunk đã chia sẵn, có chunk_order_index.
            doc_id: ID tùy chọn cho document.

        Returns:
            ID của document đã insert.
        """
        ...

    # === Retrieval ===

    @abstractmethod
    async def aretrieve(
        self, query: str, param: RetrievalParam = RetrievalParam()
    ) -> RetrievalContext:
        """Retrieval mix mode — kết hợp KG traversal + vector similarity search.

        Trả về raw context (entities, relations, chunks, references)
        để tầng trên tự quyết định cách dùng (đưa vào LLM prompt, hiển thị, ...).
        """
        ...

    # === Generation ===

    @abstractmethod
    async def agenerate(
        self,
        query: str,
        context: RetrievalContext,
        param: GenerationParam = GenerationParam(),
    ) -> GenerationOutput:
        """Dùng LLM sinh câu trả lời từ context đã retrieve.

        Args:
            query: Câu hỏi gốc của người dùng.
            context: Kết quả từ aretrieve().
            param: Tham số generation (response_type, user_prompt, ...).

        Returns:
            GenerationOutput với content (câu trả lời) và raw_context gốc.
        """
        ...


    @abstractmethod
    async def amerge_entities(
    ) -> dict[str, Any]:
        ...


    @abstractmethod
    async def amerge_relationships(
    ) -> dict[str, Any]:
        ...


    # === Lifecycle ===

    @abstractmethod
    async def initialize(self) -> None:
        """Khởi tạo storage backends. Phải gọi trước khi dùng bất kỳ method nào."""
        ...

    @abstractmethod
    async def finalize(self) -> None:
        """Đóng storage backends, flush pending writes. Gọi trước khi destroy."""
        ...
