from __future__ import annotations

from abc import abstractmethod
from typing import Any

from core.store import BaseStore

from .models import DocProcessingStatus, DocStatus


class DocStatusStorage(BaseStore):
    @abstractmethod
    async def get_status_counts(self) -> dict[str, int]:
        """Đếm số lượng document theo từng trạng thái (status)

        Dùng cho dashboard monitoring — biết có bao nhiêu document đang
        pending, processing, processed, failed.

        Returns:
            Dict ánh xạ status value -> số lượng:
            {"pending": 3, "processing": 1, "processed": 10, "failed": 2}
        """
        ...

    @abstractmethod
    async def get_docs_by_status(
        self, status: DocStatus
    ) -> dict[str, DocProcessingStatus]:
        """Lấy tất cả document có một trạng thái cụ thể

        Args:
            status: Trạng thái cần lọc (VD: DocStatus.PENDING)

        Returns:
            Dict ánh xạ doc_id -> DocProcessingStatus
        """
        ...

    @abstractmethod
    async def get_docs_by_statuses(
        self, statuses: list[DocStatus]
    ) -> dict[str, DocProcessingStatus]:
        """Lấy tất cả document khớp với một trong các trạng thái cho trước

        Args:
            statuses: Danh sách trạng thái cần lọc (VD: [PENDING, FAILED])

        Returns:
            Dict ánh xạ doc_id -> DocProcessingStatus, **không đảm bảo thứ tự**.
            Caller nên tự sort theo updated_at nếu cần ưu tiên:
            ``sorted(docs.keys(), key=lambda d: docs[d].updated_at or "", reverse=True)``
        """
        ...

    @abstractmethod
    async def get_docs_by_track_id(
        self, track_id: str
    ) -> dict[str, DocProcessingStatus]:
        """Lấy tất cả document thuộc cùng một track (cùng lần gọi ainsert)

        Dùng để theo dõi tiến độ xử lý của một batch insert.

        Args:
            track_id: ID của track cần truy vấn

        Returns:
            Dict ánh xạ doc_id -> DocProcessingStatus
        """
        ...

    @abstractmethod
    async def get_docs_paginated(
        self,
        status_filter: DocStatus | None = None,
        status_filters: list[DocStatus] | None = None,
        page: int = 1,
        page_size: int = 50,
        sort_field: str = "updated_at",
        sort_direction: str = "desc",
    ) -> tuple[list[tuple[str, DocProcessingStatus]], int]:
        """Lấy danh sách document với phân trang (pagination) và lọc theo status

        ``status_filters`` được ưu tiên hơn ``status_filter``.
        Nếu không có filter nào, trả về tất cả document.

        Args:
            status_filter: Filter đơn (legacy), bỏ qua nếu status_filters được set
            status_filters: Filter theo nhiều status, None = tất cả
            page: Số trang (bắt đầu từ 1)
            page_size: Số lượng document mỗi trang (giới hạn 10-200)
            sort_field: Field để sắp xếp ('created_at', 'updated_at', 'id')
            sort_direction: Hướng sắp xếp ('asc' hoặc 'desc')

        Returns:
            Tuple gồm (danh sách (doc_id, DocProcessingStatus), tổng số lượng)
        """
        ...

    @abstractmethod
    async def get_all_status_counts(self) -> dict[str, int]:
        """Đếm số lượng document theo từng trạng thái cho toàn bộ storage

        Returns:
            Dict mapping tên status -> số lượng.
            Tên status là giá trị của DocStatus enum (pending, processing, etc.).
        """
        ...

    @abstractmethod
    async def get_doc_by_file_path(self, file_path: str) -> dict[str, Any] | None:
        """Tìm document theo file path

        Args:
            file_path: Đường dẫn file cần tìm

        Returns:
            dict[str, Any] | None: Document data nếu tìm thấy, None nếu không.
            Format giống get_by_ids().
        """
        ...

    @abstractmethod
    async def get_doc_by_file_basename(
        self, basename: str
    ) -> tuple[str, dict[str, Any]] | None:
        """Tìm document theo canonical file basename.

        Dùng cho filename-based deduplication. Caller phải truyền basename
        đã chuẩn hóa (canonical); implementation chỉ so sánh với ``file_path``
        đã được persist bởi business layer.

        Args:
            basename: Tên file cần tìm (VD: "report.pdf").

        Returns:
            (doc_id, doc_data) nếu tìm thấy, None nếu không.
        """
        ...

    @abstractmethod
    async def get_doc_by_content_hash(
        self, content_hash: str
    ) -> tuple[str, dict[str, Any]] | None:
        """Tìm document theo content_hash field.

        Dùng cho content-hash deduplication — phát hiện document trùng nhau
        dù khác tên file nhưng cùng nội dung.

        Args:
            content_hash: Giá trị content_hash cần tìm

        Returns:
            (doc_id, doc_data) nếu tìm thấy, None nếu không.
        """
        ...
