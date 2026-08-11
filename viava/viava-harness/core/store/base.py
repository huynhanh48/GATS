from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any


class BaseStore(ABC):
    """Kho lưu trữ  — interface trừu tượng

    Mỗi instance quản lý một namespace (VD: "doc_status", "full_docs").
    Hỗ trợ: CRUD dữ liệu dạng dict theo ID, batch operations, filter keys.

    Khác với vector storage: KV storage không có tìm kiếm ngữ nghĩa,
    chỉ tra cứu chính xác theo key (ID). Dùng để lưu document metadata,
    processing status, full content, hoặc bất kỳ dữ liệu không cần vector.

    Dùng được cho nhiều use-case:
      - Doc status: lưu trạng thái xử lý document (pending/processing/processed)
      - Full docs: lưu toàn bộ nội dung document (không phải chunk)
      - Session state: lưu session metadata, token counts, conversation history
      - Cache: lưu kết quả trung gian, embedding cache

    Kiến trúc:
      - Mỗi instance = 1 namespace (1 collection/table/shared file)
      - Pattern in-memory: upsert/delete ghi vào buffer, index_done_callback() flush
      - Pattern multi-worker: buffer là process-local, cần dùng KG-storage-log để đồng bộ
    """

    # ------------------------------------------------------------------
    # Vòng đời (Lifecycle)
    # ------------------------------------------------------------------

    async def initialize(self) -> None:
        """Khởi tạo storage — tạo collection/table/file, kết nối backend, v.v.

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
        """Chèn hoặc cập nhật dữ liệu theo batch (batch upsert)

        Args:
            data: Dict ánh xạ ID -> payload. Mỗi payload là một dict với các key tuỳ ý.
                {
                    "<id>": {"key1": "value1", "key2": 123, ...},
                    ...
                }

        Lưu ý với storage in-memory:
          1. Thay đổi chưa được persist ngay. Gọi index_done_callback() để flush.
          2. Cập nhật flag để thông báo process khác rằng data cần persistence.

        Lưu ý với multi-worker:
          Backend buffer writes trong process memory giữ buffer process-local.
          Trong multi-worker deployment (VD: lightrag-gunicorn), worker khác
          sẽ không thấy dữ liệu cho đến khi worker ghi gọi index_done_callback().
          Nếu cần cross-worker read-after-write, phải await index_done_callback()
          trước khi đọc từ worker khác.
        """
        pass

    @abstractmethod
    async def get_by_id(self, id: str) -> dict[str, Any] | None:
        """Lấy toàn bộ payload của một bản ghi theo ID

        Args:
            id: Định danh duy nhất của bản ghi

        Returns:
            Dict payload đầy đủ nếu tìm thấy, None nếu ID không tồn tại.
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
          2. Cập nhật flag để thông báo process khác rằng data cần persistence.

        Lưu ý với multi-worker: giống upsert — tombstones buffer là process-local
        cho đến khi index_done_callback() chạy.

        Args:
            ids: Danh sách định danh cần xoá
        """
        pass

    # ------------------------------------------------------------------
    # Utility
    # ------------------------------------------------------------------

    @abstractmethod
    async def filter_keys(self, keys: set[str]) -> set[str]:
        """Lọc ra những key chưa tồn tại trong storage

        Dùng để kiểm tra xem những ID nào cần được tạo mới.
        Hữu ích trong pipeline insert: chỉ upsert những key chưa có,
        tránh ghi đè dữ liệu đã tồn tại.

        Args:
            keys: Tập hợp các key cần kiểm tra

        Returns:
            Tập hợp các key KHÔNG tồn tại trong storage.
        """
        pass

    @abstractmethod
    async def is_empty(self) -> bool:
        """Kiểm tra storage có rỗng không

        Returns:
            True nếu storage không chứa bản ghi nào, ngược lại False.
        """
        pass
