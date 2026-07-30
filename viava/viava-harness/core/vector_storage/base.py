from __future__ import annotations

import re
from abc import ABC, abstractmethod
from typing import Any

from core.embedding.base import BaseEmbedding
from .models import ScoredItem


class BaseVectorStorage(ABC):
    """Kho lưu trữ vector (vector storage) — interface trừu tượng

    Mỗi instance quản lý một namespace (VD: "rag_chunks", "agent_memory").
    Hỗ trợ: tìm kiếm ngữ nghĩa (semantic search), CRUD vector, batch operations.

    Dùng được cho nhiều use-case:
      - RAG: lưu passage chunks, entities, facts
      - SQL knowledge base: lưu DDL statements, documentation, query examples
      - Agent memory: lưu tool usage history, text memory, session context
      - Knowledge graph: lưu entity embeddings, relation embeddings

    Kiến trúc:
      - Mỗi instance = 1 namespace (1 collection trong Qdrant, 1 table trong Postgres)
      - Constructor nhận BaseEmbedding — storage tự tính embedding khi cần
      - Pattern in-memory: upsert/delete ghi vào buffer, index_done_callback() flush
      - Pattern multi-worker: buffer là process-local, cần dùng KG-storage-log để đồng bộ
    """

    # ------------------------------------------------------------------
    # Vòng đời (Lifecycle)
    # ------------------------------------------------------------------

    async def initialize(self) -> None:
        """Khởi tạo storage — tạo collection/table, kết nối backend, v.v.

        Triển khai mặc định là no-op.
        Backend concrete override method này để setup resources.
        """
        pass

    async def finalize(self) -> None:
        """Dọn dẹp storage — đóng kết nối, flush buffer cuối cùng, v.v.

        Triển khai mặc định là no-op.
        """
        pass

    @abstractmethod
    async def index_done_callback(self) -> None:
        """Commit toàn bộ pending writes (buffer) xuống storage backend

        Gọi sau khi hoàn tất một batch indexing để flush buffer.
        Backend dùng write-behind pattern (buffer in-memory, flush batch)
        cần override method này.

        Backend ghi trực tiếp (immediate write) có thể để no-op.
        """
        pass

    async def drop_pending_index_ops(self) -> None:
        """Hủy toàn bộ pending writes đang nằm trong buffer

        Pipeline gọi khi batch indexing gặp lỗi nội bộ:
          - Mọi bản ghi còn trong buffer thuộc về document đang bị đánh FAILED
          - Discard buffer là an toàn — tránh lưu dữ liệu lỗi/hỏng xuống storage
          - Document sẽ được xử lý lại từ đầu ở lần chạy tiếp theo

        Mặc định no-op. Backend dùng buffer override method này.
        """
        return None

    @abstractmethod
    async def drop(self) -> dict[str, str]:
        """Xoá toàn bộ dữ liệu và reset storage về trạng thái ban đầu

        Yêu cầu:
          1. Xoá hết data trong memory và/hoặc external storage
          2. Xoá các file liên quan (nếu có)
          3. Reset storage về trạng thái khởi tạo
          4. Dọn dẹp tài nguyên (resources)
          5. Thông báo tới process khác nếu cần
          6. Phải persist thay đổi xuống disk ngay lập tức

        Returns:
            {"status": "success", "message": "data dropped"} — thành công
            {"status": "error", "message": "<lỗi chi tiết>"} — thất bại
            {"status": "error", "message": "unsupported"} — không hỗ trợ
        """
        pass

    # ------------------------------------------------------------------
    # CRUD cơ bản (Basic CRUD)
    # ------------------------------------------------------------------

    @abstractmethod
    async def upsert(self, data: dict[str, dict[str, Any]]) -> None:
        """Chèn hoặc cập nhật dữ liệu vector theo batch (batch upsert)

        Args:
            data: Dict ánh xạ ID -> payload. Mỗi payload có format:
                {
                    "<id>": {
                        "content": str,                    # Bắt buộc — nội dung văn bản
                        "vector": list[float] | None,      # Tuỳ chọn — embedding đã tính sẵn
                        "<metadata_key>": <value>,          # Tuỳ chọn — metadata bất kỳ
                        ...
                    },
                    ...
                }

        Quy tắc xử lý:
          - "content" là bắt buộc — dùng để tính embedding nếu "vector" không có
          - "vector" nếu được cung cấp: dùng trực tiếp, không tính lại
          - Các key còn lại (trừ "content" và "vector") được lưu vào metadata

        Lưu ý với storage in-memory:
          1. Thay đổi chưa được persist ngay. Gọi index_done_callback() để flush.
          2. Chỉ một process cập nhật storage tại một thời điểm trước index_done_callback.
             Dùng KG-storage-log để tránh data corruption.

        Lưu ý với multi-worker:
          Buffer là process-local. Worker khác sẽ không thấy dữ liệu cho đến khi
          worker ghi gọi index_done_callback(). Nếu cần cross-worker read-after-write,
          phải await index_done_callback() trước khi đọc từ worker khác.
        """
        pass

    @abstractmethod
    async def query(
        self,
        query_text: str,
        top_k: int,
        *,
        query_embedding: list[float] | None = None,
        filter: dict[str, Any] | None = None,
    ) -> list[ScoredItem]:
        """Tìm kiếm ngữ nghĩa (semantic search) trong storage

        Args:
            query_text: Câu query dạng văn bản (dùng để log/trace/debug)
            top_k: Số lượng kết quả tối đa trả về
            query_embedding: Vector embedding của query — nếu None,
                            storage tự tính embedding từ query_text
            filter: Điều kiện lọc metadata (backend-specific), VD:
                {"tool_name": "bash", "success": True}
                {"domain": "billing"}
                Pass None nếu không cần lọc.

        Returns:
            Danh sách ScoredItem đã sắp xếp theo score giảm dần.
            Danh sách rỗng nếu không tìm thấy kết quả nào.
        """
        pass

    @abstractmethod
    async def get_by_id(self, id: str) -> dict[str, Any] | None:
        """Lấy toàn bộ payload của một bản ghi theo ID

        Args:
            id: Định danh duy nhất của bản ghi

        Returns:
            Dict payload đầy đủ (content + metadata + vector) nếu tìm thấy,
            None nếu ID không tồn tại.
        """
        pass

    @abstractmethod
    async def get_by_ids(self, ids: list[str]) -> list[dict[str, Any]]:
        """Lấy payload của nhiều bản ghi theo danh sách ID

        Args:
            ids: Danh sách định danh cần truy vấn

        Returns:
            Danh sách payload (chỉ những bản ghi được tìm thấy).
            Thứ tự không đảm bảo giống input.
        """
        pass

    @abstractmethod
    async def delete(self, ids: list[str]) -> None:
        """Xoá các bản ghi theo danh sách ID

        Lưu ý với storage in-memory:
          1. Thay đổi chưa được persist ngay. Gọi index_done_callback() để flush.
          2. Chỉ một process cập nhật storage tại một thời điểm.

        Lưu ý với multi-worker: giống upsert — tombstones buffer là process-local
        cho đến khi index_done_callback() chạy.

        Args:
            ids: Danh sách định danh cần xoá
        """
        pass

    @abstractmethod
    async def get_vectors_by_ids(self, ids: list[str]) -> dict[str, list[float]]:
        """Lấy vector embedding của các bản ghi theo ID (chỉ vector, không payload)

        Dùng cho các thao tác cần tính toán lại similarity hoặc clustering
        mà không cần đọc toàn bộ payload.

        Args:
            ids: Danh sách định danh cần lấy vector

        Returns:
            Dict ánh xạ ID -> vector embedding:
            {"id-1": [0.12, -0.34, ...], "id-2": [0.56, 0.78, ...]}
        """
        pass

    # ------------------------------------------------------------------
    # Entity-specific — dùng với Knowledge Graph
    # ------------------------------------------------------------------

    @abstractmethod
    async def delete_entity(self, entity_name: str) -> None:
        """Xoá một entity và toàn bộ dữ liệu liên quan khỏi storage

        Dùng trong knowledge graph pipeline khi entity bị xoá hoặc merge.

        Lưu ý: tương tự upsert, cần index_done_callback() để persist.

        Args:
            entity_name: Tên entity cần xoá
        """
        pass

    @abstractmethod
    async def delete_entity_relation(self, entity_name: str) -> None:
        """Xoá toàn bộ relation (mối quan hệ) của một entity

        Dùng trong knowledge graph pipeline khi entity thay đổi relation.
        Backend có thể prune in-process buffer ngoài việc gửi server-side delete.

        Lưu ý: tương tự upsert, cross-worker visibility cần index_done_callback().

        Args:
            entity_name: Tên entity có relation cần xoá
        """
        pass

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    @property
    @abstractmethod
    def embedding(self) -> BaseEmbedding:
        """Embedding provider — dùng để tính vector khi caller không cung cấp sẵn

        Mọi implementation PHẢI có attribute này.
        Được set trong __init__() của subclass, VD:
            self._embedding = embedding
        """
        ...

    def _validate_embedding(self) -> None:
        """Kiểm tra embedding đã được cung cấp

        Gọi ở đầu constructor của mọi implementation.

        Raises:
            ValueError: Nếu self.embedding là None
        """
        if self.embedding is None:
            raise ValueError(
                "embedding là bắt buộc với vector storage. "
                "Vui lòng cung cấp một BaseEmbedding instance hợp lệ qua constructor."
            )

    def _build_collection_suffix(self) -> str | None:
        """Sinh suffix cho tên collection/table từ thông tin embedding model

        Trả về suffix nếu model_name tồn tại trong embedding,
        ngược lại trả về None.

        Returns:
            str | None: Suffix VD "text_embedding_3_large_3072d",
                       hoặc None nếu không có model_name
        """
        model_name: str | None = getattr(self.embedding, "model_name", None)
        if not isinstance(model_name, str):
            return None

        model_name = model_name.strip()
        if not model_name:
            return None

        embedding_dim: int = self.embedding.embedding_dim
        safe_model_name: str = re.sub(r"[^a-zA-Z0-9_]", "_", model_name.lower())
        return f"{safe_model_name}_{embedding_dim}d"
