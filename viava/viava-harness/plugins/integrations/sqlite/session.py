import asyncio
import json
import random
import sqlite3
import time
from pathlib import Path
from typing import Any

import aiosqlite

from core.session.base import SessionBase
from core.session.models import (
    EndReason,
    Message,
    Session,
    SessionSummary,
    SearchResult,
    TokenCounts,
)


_SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    cwd TEXT NOT NULL,
    user_id TEXT,
    model TEXT,
    model_config TEXT,
    system_prompt TEXT,
    parent_session_id TEXT REFERENCES sessions(id),
    end_reason TEXT,
    started_at REAL NOT NULL,
    ended_at REAL,
    title TEXT NOT NULL DEFAULT 'New Session',
    message_count INTEGER NOT NULL DEFAULT 0,
    tool_call_count INTEGER NOT NULL DEFAULT 0,
    input_tokens INTEGER NOT NULL DEFAULT 0,
    output_tokens INTEGER NOT NULL DEFAULT 0,
    cache_read_tokens INTEGER NOT NULL DEFAULT 0,
    cache_write_tokens INTEGER NOT NULL DEFAULT 0,
    reasoning_tokens INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_sessions_parent ON sessions(parent_session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_cwd ON sessions(cwd);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL REFERENCES sessions(id),
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    model TEXT,
    tool_calls TEXT,
    tool_call_id TEXT,
    tool_name TEXT,
    token_count INTEGER,
    finish_reason TEXT,
    reasoning_content TEXT,
    timestamp REAL NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id);

CREATE VIRTUAL TABLE IF NOT EXISTS messages_fts USING fts5(
    content, role, session_id, content=external_content, content_rowid=id
);

CREATE TRIGGER IF NOT EXISTS messages_ai AFTER INSERT ON messages BEGIN
    INSERT INTO messages_fts(rowid, content, role, session_id)
    VALUES (new.id, new.content, new.role, new.session_id);
END;

CREATE TRIGGER IF NOT EXISTS messages_ad AFTER DELETE ON messages BEGIN
    INSERT INTO messages_fts(messages_fts, rowid, content, role, session_id)
    VALUES ('delete', old.id, old.content, old.role, old.session_id);
END;

CREATE TRIGGER IF NOT EXISTS messages_au AFTER UPDATE ON messages BEGIN
    INSERT INTO messages_fts(messages_fts, rowid, content, role, session_id)
    VALUES ('delete', old.id, old.content, old.role, old.session_id);
    INSERT INTO messages_fts(rowid, content, role, session_id)
    VALUES (new.id, new.content, new.role, new.session_id);
END;
"""


def _now() -> float:
    return time.time()


def _row_to_session(row: dict[str, Any]) -> Session:
    model_config_raw = row.get("model_config")
    if isinstance(model_config_raw, str):
        model_config = json.loads(model_config_raw)
    else:
        model_config = {}

    end_reason_raw = row.get("end_reason")
    end_reason = EndReason(end_reason_raw) if end_reason_raw else None

    from datetime import datetime, timezone

    return Session(
        id=row["id"],
        cwd=row["cwd"],
        user_id=row.get("user_id"),
        model=row.get("model"),
        system_prompt=row.get("system_prompt"),
        parent_session_id=row.get("parent_session_id"),
        end_reason=end_reason,
        started_at=datetime.fromtimestamp(row["started_at"], tz=timezone.utc),
        ended_at=datetime.fromtimestamp(row["ended_at"], tz=timezone.utc) if row.get("ended_at") else None,
        title=row["title"],
        message_count=row["message_count"],
        tool_call_count=row["tool_call_count"],
        input_tokens=row["input_tokens"],
        output_tokens=row["output_tokens"],
        cache_read_tokens=row["cache_read_tokens"],
        cache_write_tokens=row["cache_write_tokens"],
        reasoning_tokens=row["reasoning_tokens"],
        model_config=model_config,
    )


def _row_to_message(row: dict[str, Any]) -> Message:
    from datetime import datetime, timezone

    tool_calls_raw = row.get("tool_calls")
    tool_calls = None
    if tool_calls_raw:
        raw_list = json.loads(tool_calls_raw)
        from core.tool.models import ToolCall
        tool_calls = [ToolCall(**tc) for tc in raw_list]

    return Message(
        role=row["role"],
        content=row["content"],
        model=row.get("model"),
        timestamp=datetime.fromtimestamp(row["timestamp"], tz=timezone.utc),
        tool_calls=tool_calls,
        tool_call_id=row.get("tool_call_id"),
        token_count=row.get("token_count"),
        finish_reason=row.get("finish_reason"),
        reasoning_content=row.get("reasoning_content"),
    )


def _row_to_summary(row: dict[str, Any]) -> SessionSummary:
    from datetime import datetime, timezone

    end_reason_raw = row.get("end_reason")
    end_reason = EndReason(end_reason_raw) if end_reason_raw else None

    return SessionSummary(
        session_id=row["id"],
        title=row["title"],
        model=row.get("model"),
        message_count=row["message_count"],
        started_at=datetime.fromtimestamp(row["started_at"], tz=timezone.utc),
        ended_at=datetime.fromtimestamp(row["ended_at"], tz=timezone.utc) if row.get("ended_at") else None,
        end_reason=end_reason,
        input_tokens=row["input_tokens"],
        output_tokens=row["output_tokens"],
    )


class SqliteSessionStore(SessionBase):

    _WRITE_MAX_RETRIES = 15
    _WRITE_RETRY_MIN_S = 0.020
    _WRITE_RETRY_MAX_S = 0.150

    def __init__(self, db_path: str | Path = "state.db") -> None:
        self._db_path = Path(db_path)
        self._conn: aiosqlite.Connection | None = None
        self._write_lock = asyncio.Lock()

    async def _get_conn(self) -> aiosqlite.Connection:
        if self._conn is None:
            self._conn = await aiosqlite.connect(str(self._db_path))
            self._conn.row_factory = aiosqlite.Row
            await self._conn.execute("PRAGMA journal_mode=WAL")
            await self._conn.execute("PRAGMA foreign_keys=ON")
            await self._conn.executescript(_SCHEMA_SQL)
            await self._conn.commit()
        return self._conn

    async def _execute_write(self, sql: str, params: tuple | None = None) -> aiosqlite.Cursor:
        conn = await self._get_conn()
        for attempt in range(self._WRITE_MAX_RETRIES):
            try:
                async with self._write_lock:
                    await conn.execute("BEGIN IMMEDIATE")
                    try:
                        cursor = await conn.execute(sql, params or ())
                        await conn.commit()
                        return cursor
                    except Exception:
                        await conn.rollback()
                        raise
            except aiosqlite.OperationalError:
                delay = random.uniform(self._WRITE_RETRY_MIN_S, self._WRITE_RETRY_MAX_S)
                await asyncio.sleep(delay)
        raise RuntimeError(f"Write failed after {self._WRITE_MAX_RETRIES} retries")

    async def _execute_read(self, sql: str, params: tuple | None = None) -> aiosqlite.Cursor:
        conn = await self._get_conn()
        return await conn.execute(sql, params or ())

    # --- Lifecycle ---

    async def create_session(
        self, session_id: str, cwd: str, *,
        user_id: str | None = None,
        model: str | None = None,
        model_config: dict | None = None,
        system_prompt: str | None = None,
        parent_session_id: str | None = None,
    ) -> Session:
        model_config_json = json.dumps(model_config) if model_config else None
        await self._execute_write(
            """INSERT INTO sessions (id, cwd, user_id, model, model_config, system_prompt,
               parent_session_id, started_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (session_id, cwd, user_id, model, model_config_json, system_prompt,
             parent_session_id, _now()),
        )
        return await self.get_session(session_id)  # type: ignore[return-value]

    async def get_session(self, session_id: str) -> Session | None:
        cursor = await self._execute_read(
            "SELECT * FROM sessions WHERE id = ?", (session_id,)
        )
        row = await cursor.fetchone()
        if row is None:
            return None
        return _row_to_session(dict(row))

    async def end_session(self, session_id: str, end_reason: EndReason) -> None:
        await self._execute_write(
            """UPDATE sessions SET ended_at = COALESCE(ended_at, ?),
               end_reason = COALESCE(end_reason, ?)
               WHERE id = ?""",
            (_now(), end_reason.value, session_id),
        )

    async def delete_session(self, session_id: str) -> bool:
        conn = await self._get_conn()
        async with self._write_lock:
            await conn.execute("BEGIN IMMEDIATE")
            try:
                cursor = await conn.execute(
                    "SELECT id FROM sessions WHERE parent_session_id = ?"
                    " AND json_extract(COALESCE(model_config, '{}'), '$._delegate_from') IS NOT NULL",
                    (session_id,),
                )
                delegate_ids = [row["id"] async for row in cursor]

                for did in delegate_ids:
                    await conn.execute("DELETE FROM messages WHERE session_id = ?", (did,))
                    await conn.execute("DELETE FROM sessions WHERE id = ?", (did,))

                await conn.execute(
                    "UPDATE sessions SET parent_session_id = NULL WHERE parent_session_id = ?",
                    (session_id,),
                )
                await conn.execute("DELETE FROM messages WHERE session_id = ?", (session_id,))
                cursor = await conn.execute("DELETE FROM sessions WHERE id = ?", (session_id,))
                await conn.commit()
                return cursor.rowcount > 0
            except Exception:
                await conn.rollback()
                raise

    async def list_sessions(
        self, *, cwd: str | None = None, user_id: str | None = None,
        limit: int = 50, offset: int = 0,
        include_children: bool = False,
    ) -> list[SessionSummary]:
        where_clauses = []
        params: list[Any] = []

        if not include_children:
            where_clauses.append(
                "(s.parent_session_id IS NULL"
                " OR EXISTS (SELECT 1 FROM sessions p"
                "            WHERE p.id = s.parent_session_id"
                "            AND p.end_reason = 'branched')"
                " OR json_extract(COALESCE(s.model_config, '{}'), '$._branched_from') IS NOT NULL)"
            )
            where_clauses.append(
                "json_extract(COALESCE(s.model_config, '{}'), '$._delegate_from') IS NULL"
            )

        if cwd is not None:
            where_clauses.append("s.cwd = ?")
            params.append(cwd)

        if user_id is not None:
            where_clauses.append("s.user_id = ?")
            params.append(user_id)

        where_sql = " AND ".join(where_clauses) if where_clauses else "1=1"
        sql = (
            f"SELECT s.id, s.title, s.model, s.message_count, s.started_at,"
            f" s.ended_at, s.end_reason, s.input_tokens, s.output_tokens"
            f" FROM sessions s"
            f" WHERE {where_sql}"
            f" ORDER BY s.started_at DESC"
            f" LIMIT ? OFFSET ?"
        )
        params.extend([limit, offset])

        cursor = await self._execute_read(sql, tuple(params))
        rows = await cursor.fetchall()
        return [_row_to_summary(dict(r)) for r in rows]

    async def resolve_session_id(self, prefix: str) -> str | None:
        cursor = await self._execute_read(
            "SELECT id FROM sessions WHERE id = ? OR id LIKE ? ORDER BY"
            " CASE WHEN id = ? THEN 0 ELSE 1 END, started_at DESC LIMIT 1",
            (prefix, f"{prefix}%", prefix),
        )
        row = await cursor.fetchone()
        return row["id"] if row else None

    # --- Messages ---

    async def append_message(self, session_id: str, message: Message) -> None:
        tool_calls_json = None
        if message.tool_calls:
            tool_calls_json = json.dumps([
                {"id": tc.id, "name": tc.name, "args": tc.args}
                for tc in message.tool_calls
            ])
        tool_name = message.tool_calls[0].name if message.tool_calls else None

        conn = await self._get_conn()
        async with self._write_lock:
            await conn.execute("BEGIN IMMEDIATE")
            try:
                await conn.execute(
                    """INSERT INTO messages (session_id, role, content, model,
                       tool_calls, tool_call_id, tool_name, token_count,
                       finish_reason, reasoning_content, timestamp)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    (session_id, message.role, message.content, message.model,
                     tool_calls_json, message.tool_call_id, tool_name,
                     message.token_count, message.finish_reason,
                     message.reasoning_content, _now()),
                )
                tool_call_count_inc = 1 if message.tool_calls else 0
                await conn.execute(
                    """UPDATE sessions SET message_count = message_count + 1,
                       tool_call_count = tool_call_count + ?
                       WHERE id = ?""",
                    (tool_call_count_inc, session_id),
                )
                await conn.commit()
            except Exception:
                await conn.rollback()
                raise

    async def get_messages(
        self, session_id: str, *, limit: int = 1000, offset: int = 0,
    ) -> list[Message]:
        cursor = await self._execute_read(
            """SELECT * FROM messages WHERE session_id = ?
               ORDER BY id ASC LIMIT ? OFFSET ?""",
            (session_id, limit, offset),
        )
        rows = await cursor.fetchall()
        return [_row_to_message(dict(r)) for r in rows]

    # --- Lineage ---

    async def get_child_sessions(self, parent_session_id: str) -> list[Session]:
        cursor = await self._execute_read(
            "SELECT * FROM sessions WHERE parent_session_id = ? ORDER BY started_at DESC",
            (parent_session_id,),
        )
        rows = await cursor.fetchall()
        return [_row_to_session(dict(r)) for r in rows]

    async def get_compression_tip(self, session_id: str) -> str | None:
        current = session_id
        while True:
            cursor = await self._execute_read(
                """SELECT s.id, s.end_reason, s.model_config FROM sessions s
                   WHERE s.parent_session_id = ?
                     AND json_extract(COALESCE(s.model_config, '{}'), '$._branched_from') IS NULL
                     AND json_extract(COALESCE(s.model_config, '{}'), '$._delegate_from') IS NULL
                   ORDER BY s.started_at DESC LIMIT 1""",
                (current,),
            )
            row = await cursor.fetchone()
            if row is None:
                return current if current != session_id else None
            d = dict(row)
            if d.get("end_reason") == "compression":
                current = d["id"]
            else:
                return d["id"]

    async def get_session_lineage(self, session_id: str) -> list[str]:
        lineage: list[str] = []
        current: str | None = session_id
        while current is not None:
            lineage.append(current)
            cursor = await self._execute_read(
                "SELECT parent_session_id FROM sessions WHERE id = ?", (current,)
            )
            row = await cursor.fetchone()
            current = row["parent_session_id"] if row else None
        lineage.reverse()
        return lineage

    # --- Token ---

    async def update_token_counts(self, session_id: str, counts: TokenCounts) -> None:
        await self._execute_write(
            """UPDATE sessions SET
               input_tokens = input_tokens + ?,
               output_tokens = output_tokens + ?,
               cache_read_tokens = cache_read_tokens + ?,
               cache_write_tokens = cache_write_tokens + ?,
               reasoning_tokens = reasoning_tokens + ?
               WHERE id = ?""",
            (counts.input_tokens, counts.output_tokens, counts.cache_read_tokens,
             counts.cache_write_tokens, counts.reasoning_tokens, session_id),
        )

    # --- Search ---

    async def search_messages(
        self, query: str, *, session_id: str | None = None, limit: int = 20,
    ) -> list[SearchResult]:
        if session_id:
            cursor = await self._execute_read(
                """SELECT m.*, fts.rank FROM messages m
                   JOIN messages_fts fts ON m.id = fts.rowid
                   WHERE messages_fts MATCH ? AND m.session_id = ?
                   ORDER BY fts.rank LIMIT ?""",
                (query, session_id, limit),
            )
        else:
            cursor = await self._execute_read(
                """SELECT m.*, fts.rank FROM messages m
                   JOIN messages_fts fts ON m.id = fts.rowid
                   WHERE messages_fts MATCH ?
                   ORDER BY fts.rank LIMIT ?""",
                (query, limit),
            )
        rows = await cursor.fetchall()
        results: list[SearchResult] = []
        for r in rows:
            d = dict(r)
            rank = d.pop("rank", 0.0)
            results.append(SearchResult(session_id=d["session_id"], message=_row_to_message(d), rank=rank))
        return results

    async def search_sessions(
        self, query: str, *, limit: int = 20,
    ) -> list[SessionSummary]:
        cursor = await self._execute_read(
            """SELECT DISTINCT s.id, s.title, s.model, s.message_count,
               s.started_at, s.ended_at, s.end_reason, s.input_tokens, s.output_tokens
               FROM sessions s
               JOIN messages m ON m.session_id = s.id
               JOIN messages_fts fts ON m.id = fts.rowid
               WHERE messages_fts MATCH ?
               ORDER BY s.started_at DESC LIMIT ?""",
            (query, limit),
        )
        rows = await cursor.fetchall()
        return [_row_to_summary(dict(r)) for r in rows]

    # --- Meta ---

    async def update_session_meta(
        self, session_id: str, *, model: str | None = None,
        title: str | None = None, cwd: str | None = None,
        **kwargs,
    ) -> None:
        sets: list[str] = []
        params: list[Any] = []
        if model is not None:
            sets.append("model = ?")
            params.append(model)
        if title is not None:
            sets.append("title = ?")
            params.append(title)
        if cwd is not None:
            sets.append("cwd = ?")
            params.append(cwd)
        for key, val in kwargs.items():
            col = f"json_extract(model_config, '$.{key}')"
            sets.append(f"model_config = json_set(COALESCE(model_config, '{{}}'), '$.{key}', ?)")
            params.append(json.dumps(val) if not isinstance(val, str) else val)
        if not sets:
            return
        params.append(session_id)
        await self._execute_write(
            f"UPDATE sessions SET {', '.join(sets)} WHERE id = ?",
            tuple(params),
        )

    async def reopen_session(self, session_id: str) -> None:
        await self._execute_write(
            "UPDATE sessions SET ended_at = NULL, end_reason = NULL WHERE id = ?",
            (session_id,),
        )

    async def close(self) -> None:
        if self._conn is not None:
            await self._conn.close()
            self._conn = None
