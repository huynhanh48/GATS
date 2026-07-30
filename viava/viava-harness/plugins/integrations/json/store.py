from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from core.store import BaseStore


def _load_json(path: Path) -> dict[str, Any] | None:
    try:
        content = path.read_text(encoding="utf-8")
        return json.loads(content)
    except (FileNotFoundError, json.JSONDecodeError):
        return None


def _write_json(data: dict[str, Any], path: Path) -> None:
    path.write_text(
        json.dumps(data, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )


class JsonStore(BaseStore):

    def __init__(self, namespace: str, base_dir: str | Path) -> None:
        self._namespace = namespace
        self._base_dir = Path(base_dir)
        self._file_path = self._base_dir / f"{namespace}.json"
        self._data: dict[str, dict[str, Any]] | None = None
        self._dirty: bool = False

    async def initialize(self) -> None:
        self._base_dir.mkdir(parents=True, exist_ok=True)
        loaded = _load_json(self._file_path)
        self._data = loaded if loaded is not None else {}
        self._dirty = False

    async def finalize(self) -> None:
        await self.index_done_callback()

    async def index_done_callback(self) -> None:
        if self._dirty and self._data is not None:
            _write_json(self._data, self._file_path)
            self._dirty = False

    async def upsert(self, data: dict[str, dict[str, Any]]) -> None:
        if not data:
            return
        if self._data is None:
            raise RuntimeError("JsonStore not initialized — call initialize() first")
        self._data.update(data)
        self._dirty = True

    async def get_by_id(self, id: str) -> dict[str, Any] | None:
        if self._data is None:
            return None
        result = self._data.get(id)
        if result is not None:
            return dict(result)
        return None

    async def get_by_ids(self, ids: list[str]) -> list[dict[str, Any]]:
        if self._data is None:
            return []
        results: list[dict[str, Any]] = []
        for id in ids:
            data = self._data.get(id)
            if data is not None:
                results.append(dict(data))
        return results

    async def delete(self, ids: list[str]) -> None:
        if not ids or self._data is None:
            return
        any_deleted = False
        for id in ids:
            if id in self._data:
                del self._data[id]
                any_deleted = True
        if any_deleted:
            self._dirty = True

    async def filter_keys(self, keys: set[str]) -> set[str]:
        if self._data is None:
            return keys
        return keys - set(self._data.keys())

    async def is_empty(self) -> bool:
        if self._data is None:
            return True
        return len(self._data) == 0

    async def drop(self) -> dict[str, str]:
        try:
            if self._data is not None:
                self._data.clear()
            self._dirty = True
            await self.index_done_callback()
            return {"status": "success", "message": "data dropped"}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    async def drop_pending_index_ops(self) -> None:
        return None
