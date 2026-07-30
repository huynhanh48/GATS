from __future__ import annotations

from abc import ABC, abstractmethod

from .models import ExtractionResult


class BaseExtractor(ABC):
    """Trích xuất entity + relationship từ văn bản — interface trừu tượng

    Triển khai dùng LLM (GPT, Azure OpenAI, v.v.) để trích xuất
    thực thể (entity) và mối quan hệ (relationship) từ văn bản đầu vào.
    Kết quả dùng cho RAG knowledge graph construction.

    Dùng được cho:
      - RAG: trích xuất entity + relation từ passage chunk để build KG
      - Knowledge graph: populate graph storage với node/edge mới
      - Document understanding: phân tích cấu trúc ngữ nghĩa của văn bản
    """

    @abstractmethod
    async def extract(self, text: str) -> ExtractionResult:
        """Trích xuất entity + relationship từ một đoạn văn bản

        Args:
            text: Văn bản đầu vào cần trích xuất

        Returns:
            ExtractionResult chứa danh sách entities và relationships
        """
        pass

    @abstractmethod
    async def extract_batch(self, texts: list[str]) -> list[ExtractionResult]:
        """Trích xuất entity + relationship từ nhiều đoạn văn bản

        Mặc định triển khai tuần tự gọi extract(). Backend có thể override
        để tối ưu batch (VD: gọi LLM song song nhiều chunk).

        Args:
            texts: Danh sách văn bản đầu vào

        Returns:
            Danh sách ExtractionResult, thứ tự tương ứng với texts đầu vào
        """
        pass
