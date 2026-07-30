from __future__ import annotations

from pathlib import Path
from typing import Any

from core.doc_status.models import DocProcessingStatus, DocStatus

from .store import JsonStore


class JsonDocStatusStorage(JsonStore):

    def __init__(self, namespace: str, base_dir: str | Path) -> None:
        super().__init__(namespace=namespace, base_dir=base_dir)

    async def upsert(self, data: dict[str, dict[str, Any]]) -> None:
        if not data:
            return
        for doc_data in data.values():
            doc_data.setdefault("file_path", "no-file-path")
            doc_data.setdefault("metadata", {})
            doc_data.setdefault("error_msg", None)
        await super().upsert(data)
        await self.index_done_callback()

    async def drop(self) -> dict[str, str]:
        return await super().drop()

    async def get_status_counts(self) -> dict[str, int]:
        counts: dict[str, int] = {s.value: 0 for s in DocStatus}
        if self._data is None:
            return counts
        for doc in self._data.values():
            status = doc.get("status", "")
            if status in counts:
                counts[status] += 1
        return counts

    async def get_docs_by_status(self, status: DocStatus) -> dict[str, DocProcessingStatus]:
        return await self.get_docs_by_statuses([status])

    async def get_docs_by_statuses(self, statuses: list[DocStatus]) -> dict[str, DocProcessingStatus]:
        if not statuses:
            return {}
        status_values = {s.value for s in statuses}
        result: dict[str, DocProcessingStatus] = {}
        if self._data is None:
            return result
        for doc_id, doc_data in self._data.items():
            if doc_data.get("status") not in status_values:
                continue
            try:
                data = doc_data.copy()
                if not data.get("file_path"):
                    data["file_path"] = "no-file-path"
                if "metadata" not in data:
                    data["metadata"] = {}
                if "error_msg" not in data:
                    data["error_msg"] = None
                if "doc_id" not in data:
                    data["doc_id"] = doc_id
                result[doc_id] = DocProcessingStatus(**data)
            except (KeyError, TypeError):
                continue
        return result

    async def get_all_status_counts(self) -> dict[str, int]:
        counts = await self.get_status_counts()
        counts["all"] = sum(counts.values())
        return counts

    async def get_docs_by_track_id(self, track_id: str) -> dict[str, DocProcessingStatus]:
        result: dict[str, DocProcessingStatus] = {}
        if self._data is None:
            return result
        for doc_id, doc_data in self._data.items():
            if doc_data.get("track_id") != track_id:
                continue
            try:
                data = doc_data.copy()
                if not data.get("file_path"):
                    data["file_path"] = "no-file-path"
                if "metadata" not in data:
                    data["metadata"] = {}
                if "error_msg" not in data:
                    data["error_msg"] = None
                if "doc_id" not in data:
                    data["doc_id"] = doc_id
                result[doc_id] = DocProcessingStatus(**data)
            except (KeyError, TypeError):
                continue
        return result

    async def get_doc_by_file_path(self, file_path: str) -> dict[str, Any] | None:
        if self._data is None:
            return None
        for doc_data in self._data.values():
            if doc_data.get("file_path") == file_path:
                return doc_data
        return None

    async def get_doc_by_file_basename(self, basename: str) -> tuple[str, dict[str, Any]] | None:
        if not basename or basename == "unknown_source":
            return None
        if self._data is None:
            return None
        for doc_id, doc_data in self._data.items():
            if doc_data.get("file_path") == basename:
                return doc_id, doc_data
        return None

    async def get_doc_by_content_hash(self, content_hash: str) -> tuple[str, dict[str, Any]] | None:
        if not content_hash:
            return None
        if self._data is None:
            return None
        for doc_id, doc_data in self._data.items():
            if doc_data.get("content_hash") == content_hash:
                return doc_id, doc_data
        return None

    async def get_docs_paginated(
        self,
        status_filter: DocStatus | None = None,
        status_filters: list[DocStatus] | None = None,
        page: int = 1,
        page_size: int = 50,
        sort_field: str = "updated_at",
        sort_direction: str = "desc",
    ) -> tuple[list[tuple[str, DocProcessingStatus]], int]:

        status_values = self._resolve_status_filter(status_filter, status_filters)

        if page < 1:
            page = 1
        if page_size < 10:
            page_size = 10
        elif page_size > 200:
            page_size = 200

        if sort_field not in ("created_at", "updated_at", "id", "file_path"):
            sort_field = "updated_at"
        if sort_direction.lower() not in ("asc", "desc"):
            sort_direction = "desc"

        all_docs: list[tuple[str, DocProcessingStatus]] = []
        if self._data is None:
            return [], 0

        for doc_id, doc_data in self._data.items():
            if status_values is not None and doc_data.get("status") not in status_values:
                continue
            try:
                data = doc_data.copy()
                if not data.get("file_path"):
                    data["file_path"] = "no-file-path"
                if "metadata" not in data:
                    data["metadata"] = {}
                if "error_msg" not in data:
                    data["error_msg"] = None
                if "doc_id" not in data:
                    data["doc_id"] = doc_id

                doc_status = DocProcessingStatus(**data)

                if sort_field == "id":
                    sort_key = doc_id
                else:
                    sort_key = getattr(doc_status, sort_field, "")
                doc_status._sort_key = sort_key

                all_docs.append((doc_id, doc_status))
            except (KeyError, TypeError):
                continue

        reverse_sort = sort_direction.lower() == "desc"
        all_docs.sort(key=lambda x: getattr(x[1], "_sort_key", ""), reverse=reverse_sort)

        for _, doc in all_docs:
            if hasattr(doc, "_sort_key"):
                delattr(doc, "_sort_key")

        total_count = len(all_docs)
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        paginated_docs = all_docs[start_idx:end_idx]

        return paginated_docs, total_count

    @staticmethod
    def _resolve_status_filter(
        status_filter: DocStatus | None,
        status_filters: list[DocStatus] | None,
    ) -> set[str] | None:
        if status_filters:
            return {s.value for s in status_filters}
        if status_filter is not None:
            return {status_filter.value}
        return None
