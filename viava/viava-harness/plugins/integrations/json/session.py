from __future__ import annotations

import json
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from core.session.base import SessionBase
from core.session.models import (
    EndReason,
    Message,
    Session,
    SessionSummary,
    SearchResult,
    TokenCounts,
)
from utils.paths import get_sessions_dir


def _now() -> float:
    return time.time()


def _msg_to_dict(msg: Message) -> dict[str, Any]:
    d: dict[str, Any] = {
        "role": msg.role,
        "content": msg.content,
        "session_id": msg.session_id,
        "timestamp": msg.timestamp.timestamp(),
    }
    if msg.model is not None:
        d["model"] = msg.model
    if msg.tool_calls is not None:
        d["tool_calls"] = [
            {"id": tc.id, "name": tc.name, "arguments": tc.arguments}
            for tc in msg.tool_calls
        ]
    if msg.tool_call_id is not None:
        d["tool_call_id"] = msg.tool_call_id
    if msg.token_count is not None:
        d["token_count"] = msg.token_count
    if msg.finish_reason is not None:
        d["finish_reason"] = msg.finish_reason
    if msg.reasoning_content is not None:
        d["reasoning_content"] = msg.reasoning_content
    return d


def _dict_to_msg(d: dict[str, Any]) -> Message:
    from core.tool.models import ToolCall

    tool_calls = None
    raw_tcs = d.get("tool_calls")
    if raw_tcs:
        tool_calls = [ToolCall(**tc) for tc in raw_tcs]

    return Message(
        session_id=d.get("session_id", d.get("sid", "")),
        role=d["role"],
        content=d["content"],
        model=d.get("model"),
        timestamp=datetime.fromtimestamp(d["timestamp"], tz=timezone.utc),
        tool_calls=tool_calls,
        tool_call_id=d.get("tool_call_id"),
        token_count=d.get("token_count"),
        finish_reason=d.get("finish_reason"),
        reasoning_content=d.get("reasoning_content"),
    )


def _session_to_dict(s: Session) -> dict[str, Any]:
    er = s.end_reason.value if s.end_reason else None
    return {
        "id": s.id,
        "cwd": s.cwd,
        "user_id": s.user_id,
        "model": s.model,
        "model_config": s.model_config,
        "system_prompt": s.system_prompt,
        "parent_session_id": s.parent_session_id,
        "end_reason": er,
        "started_at": s.started_at.timestamp(),
        "ended_at": s.ended_at.timestamp() if s.ended_at else None,
        "title": s.title,
        "message_count": s.message_count,
        "tool_call_count": s.tool_call_count,
        "input_tokens": s.input_tokens,
        "output_tokens": s.output_tokens,
        "cache_read_tokens": s.cache_read_tokens,
        "cache_write_tokens": s.cache_write_tokens,
        "reasoning_tokens": s.reasoning_tokens,
    }


def _dict_to_session(d: dict[str, Any]) -> Session:
    er = d.get("end_reason")
    end_reason = EndReason(er) if er else None

    return Session(
        id=d["id"],
        cwd=d["cwd"],
        user_id=d.get("user_id", "unknown"),
        model=d.get("model"),
        system_prompt=d.get("system_prompt"),
        parent_session_id=d.get("parent_session_id"),
        end_reason=end_reason,
        started_at=datetime.fromtimestamp(d["started_at"], tz=timezone.utc),
        ended_at=datetime.fromtimestamp(d["ended_at"], tz=timezone.utc) if d.get("ended_at") else None,
        title=d.get("title", "New Session"),
        message_count=d.get("message_count", 0),
        tool_call_count=d.get("tool_call_count", 0),
        input_tokens=d.get("input_tokens", 0),
        output_tokens=d.get("output_tokens", 0),
        cache_read_tokens=d.get("cache_read_tokens", 0),
        cache_write_tokens=d.get("cache_write_tokens", 0),
        reasoning_tokens=d.get("reasoning_tokens", 0),
        model_config=d.get("model_config", {}),
    )


def _session_to_summary(d: dict[str, Any]) -> SessionSummary:
    er = d.get("end_reason")
    end_reason = EndReason(er) if er else None
    return SessionSummary(
        session_id=d["id"],
        title=d.get("title", "New Session"),
        model=d.get("model"),
        message_count=d.get("message_count", 0),
        started_at=datetime.fromtimestamp(d["started_at"], tz=timezone.utc),
        ended_at=datetime.fromtimestamp(d["ended_at"], tz=timezone.utc) if d.get("ended_at") else None,
        end_reason=end_reason,
        input_tokens=d.get("input_tokens", 0),
        output_tokens=d.get("output_tokens", 0),
    )


class JsonSessionStore(SessionBase):

    def __init__(self, sessions_dir: str | Path | None = None) -> None:
        self._sessions_root = Path(sessions_dir) if sessions_dir else get_sessions_dir()
        self._meta_dir = self._sessions_root / "meta"
        self._meta_dir.mkdir(parents=True, exist_ok=True)

    @property
    def _index_path(self) -> Path:
        return self._sessions_root / "_index.json"

    def _get_session_path(self, session_id: str) -> Path:
        return self._meta_dir / f"session-{session_id}.json"

    def _load_index(self) -> dict[str, Any]:
        try:
            return json.loads(self._index_path.read_text(encoding="utf-8"))
        except (FileNotFoundError, json.JSONDecodeError):
            return {"sessions": {}, "version": 1}

    def _save_index(self, index: dict[str, Any]) -> None:
        self._index_path.write_text(
            json.dumps(index, indent=2, ensure_ascii=False) + "\n",
            encoding="utf-8",
        )

    def _update_index(self, session_id: str, metadata: dict[str, Any]) -> None:
        index = self._load_index()
        index.setdefault("sessions", {})
        existing = index["sessions"].get(session_id, {})
        existing.update(metadata)
        index["sessions"][session_id] = existing
        self._save_index(index)

    def _remove_from_index(self, session_id: str) -> None:
        index = self._load_index()
        index.get("sessions", {}).pop(session_id, None)
        self._save_index(index)

    def _read_session_data(self, session_id: str) -> dict[str, Any] | None: # lấy thông tin chi tiết của 1 session
        path = self._get_session_path(session_id)
        if not path.exists():
            return None
        return json.loads(path.read_text(encoding="utf-8"))

    def _write_session_data(self, session_id: str, data: dict[str, Any]) -> None:
        path = self._get_session_path(session_id)
        path.write_text(
            json.dumps(data, indent=2, ensure_ascii=False) + "\n",
            encoding="utf-8",
        )

    def _delete_session_file(self, session_id: str) -> bool:
        path = self._get_session_path(session_id)
        if path.exists():
            path.unlink()
            return True
        return False

    def _all_session_files(self) -> list[Path]:
        if not self._meta_dir.exists():
            return []
        return sorted(
            self._meta_dir.glob("session-*.json"),
            key=lambda p: p.stat().st_mtime,
            reverse=True,
        )

    async def create_session(
        self, session_id: str, cwd: str, *,
        user_id: str,
        model: str | None = None,
        model_config: dict | None = None,
        system_prompt: str | None = None,
        parent_session_id: str | None = None,
    ) -> Session:
        now = _now()
        session = Session(
            id=session_id,
            cwd=cwd,
            user_id=user_id,
            model=model,
            system_prompt=system_prompt,
            parent_session_id=parent_session_id,
            started_at=datetime.fromtimestamp(now, tz=timezone.utc),
            model_config=model_config or {},
        )
        data = _session_to_dict(session)
        data["messages"] = []
        self._write_session_data(session_id, data)
        self._update_index(session_id, {
            "id": session_id,
            "cwd": cwd,
            "user_id": user_id,
            "model": model,
            "parent_session_id": parent_session_id,
            "end_reason": None,
            "started_at": now,
            "ended_at": None,
            "title": "New Session",
            "message_count": 0,
            "tool_call_count": 0,
            "input_tokens": 0,
            "output_tokens": 0,
            "cache_read_tokens": 0,
            "cache_write_tokens": 0,
            "reasoning_tokens": 0,
            "has_delegate_from": "_delegate_from" in (model_config or {}),
            "has_branched_from": "_branched_from" in (model_config or {}),
        })
        return session

    async def get_session(self, session_id: str) -> Session | None:
        data = self._read_session_data(session_id)
        if data is None:
            return None
        return _dict_to_session(data)

    async def end_session(self, session_id: str, end_reason: EndReason) -> None:
        data = self._read_session_data(session_id)
        if data is None:
            return
        if data.get("ended_at") is not None:
            return
        data["ended_at"] = _now()
        data["end_reason"] = end_reason.value
        self._write_session_data(session_id, data)
        self._update_index(session_id, {"ended_at": data["ended_at"], "end_reason": end_reason.value})

    async def delete_session(self, session_id: str) -> bool:
        data = self._read_session_data(session_id)
        if data is None:
            return False
        for child_id in self._iter_delegate_children(session_id):
            self._delete_session_file(child_id)
            self._remove_from_index(child_id)
        for child_id in self._iter_orphan_children(session_id):
            child_data = self._read_session_data(child_id)
            if child_data:
                child_data["parent_session_id"] = None
                self._write_session_data(child_id, child_data)
                self._update_index(child_id, {"parent_session_id": None})
        self._delete_session_file(session_id)
        self._remove_from_index(session_id)
        return True

    def _iter_delegate_children(self, parent_session_id: str) -> list[str]:
        index = self._load_index()
        return [
            sid for sid, meta in index.get("sessions", {}).items()
            if meta.get("parent_session_id") == parent_session_id
            and meta.get("has_delegate_from")
        ]

    def _iter_orphan_children(self, parent_session_id: str) -> list[str]:
        index = self._load_index()
        return [
            sid for sid, meta in index.get("sessions", {}).items()
            if meta.get("parent_session_id") == parent_session_id
            and not meta.get("has_delegate_from")
        ]

    async def list_sessions(
        self, *, cwd: str | None = None, user_id: str | None = None,
        limit: int = 50, offset: int = 0,
        include_children: bool = False,
    ) -> list[SessionSummary]:
        index = self._load_index()
        all_sessions = index.get("sessions", {})
        results: list[SessionSummary] = []

        for sid, meta in all_sessions.items():
            if cwd is not None and meta.get("cwd") != cwd:
                continue
            if not include_children:
                if meta.get("parent_session_id") is not None:
                    if not meta.get("has_branched_from"):
                        continue
                if meta.get("has_delegate_from"):
                    continue
            if user_id is not None and meta.get("user_id") != user_id:
                continue

            results.append(_session_to_summary({
                "id": sid,
                "title": meta.get("title", "New Session"),
                "model": meta.get("model"),
                "message_count": meta.get("message_count", 0),
                "started_at": meta.get("started_at", 0),
                "ended_at": meta.get("ended_at"),
                "end_reason": meta.get("end_reason"),
                "input_tokens": meta.get("input_tokens", 0),
                "output_tokens": meta.get("output_tokens", 0),
            }))

        results.sort(key=lambda s: s.started_at, reverse=True)
        return results[offset:offset + limit]

    async def resolve_session_id(self, prefix: str) -> str | None:
        index = self._load_index()
        for sid in index.get("sessions", {}):
            if sid == prefix or sid.startswith(prefix):
                return sid
        return None

    async def append_message(self, session_id: str, message: Message) -> None:
        data = self._read_session_data(session_id)
        if data is None:
            return
        messages = data.setdefault("messages", [])
        msg_dict = _msg_to_dict(message)
        msg_dict["session_id"] = session_id
        messages.append(msg_dict)
        if message.tool_calls:
            data["tool_call_count"] = data.get("tool_call_count", 0) + 1
        data["message_count"] = len(messages)
        self._write_session_data(session_id, data)
        self._update_index(session_id, {
            "message_count": data["message_count"],
            "tool_call_count": data.get("tool_call_count", 0),
        })

    async def get_messages(
        self, session_id: str, *, limit: int = 1000, offset: int = 0,
    ) -> list[Message]:
        data = self._read_session_data(session_id)
        if data is None:
            return []
        raw_messages = data.get("messages", [])
        page = raw_messages[offset:offset + limit]
        msgs = [_dict_to_msg(m) for m in page]
        for m in msgs:
            if not m.session_id:
                m.session_id = session_id
        return msgs

    async def get_child_sessions(self, parent_session_id: str) -> list[Session]:
        index = self._load_index()
        children: list[Session] = []
        for sid, meta in index.get("sessions", {}).items():
            if meta.get("parent_session_id") == parent_session_id:
                data = self._read_session_data(sid)
                if data is not None:
                    children.append(_dict_to_session(data))
        children.sort(key=lambda s: s.started_at, reverse=True)
        return children

    async def get_compression_tip(self, session_id: str) -> str | None:
        index = self._load_index()
        current = session_id
        while True:
            children = [
                sid for sid, meta in index.get("sessions", {}).items()
                if meta.get("parent_session_id") == current
                and not meta.get("has_branched_from")
                and not meta.get("has_delegate_from")
            ]
            if not children:
                return current if current != session_id else None
            children.sort(
                key=lambda sid: index["sessions"][sid].get("started_at", 0),
                reverse=True,
            )
            child_id = children[0]
            child_meta = index["sessions"][child_id]
            if child_meta.get("end_reason") == "compression":
                current = child_id
            else:
                return child_id

    async def get_session_lineage(self, session_id: str) -> list[str]:
        index = self._load_index()
        lineage: list[str] = []
        current: str | None = session_id
        while current is not None:
            lineage.append(current)
            meta = index.get("sessions", {}).get(current)
            current = meta.get("parent_session_id") if meta else None
        lineage.reverse()
        return lineage

    async def update_token_counts(self, session_id: str, counts: TokenCounts) -> None:
        data = self._read_session_data(session_id)
        if data is None:
            return
        data["input_tokens"] = data.get("input_tokens", 0) + counts.input_tokens
        data["output_tokens"] = data.get("output_tokens", 0) + counts.output_tokens
        data["cache_read_tokens"] = data.get("cache_read_tokens", 0) + counts.cache_read_tokens
        data["cache_write_tokens"] = data.get("cache_write_tokens", 0) + counts.cache_write_tokens
        data["reasoning_tokens"] = data.get("reasoning_tokens", 0) + counts.reasoning_tokens
        self._write_session_data(session_id, data)
        self._update_index(session_id, {
            "input_tokens": data["input_tokens"],
            "output_tokens": data["output_tokens"],
            "cache_read_tokens": data["cache_read_tokens"],
            "cache_write_tokens": data["cache_write_tokens"],
            "reasoning_tokens": data["reasoning_tokens"],
        })

    async def search_messages(
        self, query: str, *, session_id: str | None = None, limit: int = 20,
    ) -> list[SearchResult]:
        q = query.lower()
        results: list[SearchResult] = []

        for path in self._all_session_files():
            try:
                data = json.loads(path.read_text(encoding="utf-8"))
            except (FileNotFoundError, json.JSONDecodeError):
                continue
            sid = data.get("id", "")
            if session_id is not None and sid != session_id:
                continue
            for msg in data.get("messages", []):
                content = msg.get("content", "")
                if q in content.lower():
                    m = _dict_to_msg(msg)
                    if not m.session_id:
                        m.session_id = sid
                    results.append(SearchResult(
                        session_id=sid,
                        message=m,
                        rank=float(content.count(q)),
                    ))

        results.sort(key=lambda r: r.rank, reverse=True)
        return results[:limit]

    async def search_sessions(
        self, query: str, *, limit: int = 20,
    ) -> list[SessionSummary]:
        q = query.lower()
        index = self._load_index()
        matched: list[SessionSummary] = []

        for sid, meta in index.get("sessions", {}).items():
            if q in sid.lower() or (meta.get("title") and q in meta["title"].lower()):
                matched.append(_session_to_summary({
                    "id": sid,
                    "title": meta.get("title", "New Session"),
                    "model": meta.get("model"),
                    "message_count": meta.get("message_count", 0),
                    "started_at": meta.get("started_at", 0),
                    "ended_at": meta.get("ended_at"),
                    "end_reason": meta.get("end_reason"),
                    "input_tokens": meta.get("input_tokens", 0),
                    "output_tokens": meta.get("output_tokens", 0),
                }))

        matched.sort(key=lambda s: s.started_at, reverse=True)
        return matched[:limit]

    async def update_session_meta(
        self, session_id: str, *, model: str | None = None,
        title: str | None = None, cwd: str | None = None,
        **kwargs,
    ) -> None:
        data = self._read_session_data(session_id)
        if data is None:
            return
        changed: dict[str, Any] = {}
        if model is not None:
            data["model"] = model
            changed["model"] = model
        if title is not None:
            data["title"] = title
            changed["title"] = title
        if cwd is not None:
            data["cwd"] = cwd
            changed["cwd"] = cwd
        for key, val in kwargs.items():
            data.setdefault("model_config", {})[key] = val
            changed[f"model_config.{key}"] = val
        self._write_session_data(session_id, data)
        self._update_index(session_id, changed)

    async def reopen_session(self, session_id: str) -> None:
        data = self._read_session_data(session_id)
        if data is None:
            return
        data["ended_at"] = None
        data["end_reason"] = None
        self._write_session_data(session_id, data)
        self._update_index(session_id, {"ended_at": None, "end_reason": None})

    async def close(self) -> None:
        pass

    