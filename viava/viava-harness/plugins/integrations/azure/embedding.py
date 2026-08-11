from __future__ import annotations

import asyncio
import hashlib
import json
import time
from pathlib import Path

import aiosqlite

from core.embedding import BaseEmbedding
from core.llm.exception import LLMInvalidResponseError
from utils.paths import get_data_dir

from .client import AzureOpenAIEmbeddingClient


class AzureOpenAIEmbedding(BaseEmbedding):
    def __init__(
        self,
        client: AzureOpenAIEmbeddingClient,
        cache_path: str | Path | None = None,
        max_concurrent_batches: int = 5,
        model_name: str = "text-embedding-3-small",
        embedding_dim: int | None = None,
    ):
        self._client = client
        self._model_name = model_name
        self._embedding_dim = embedding_dim
        self._cache_path = (
            Path(cache_path)
            if cache_path
            else get_data_dir() / "azure_embedding_cache.db"
        )
        self._conn: aiosqlite.Connection | None = None
        self._semaphore = asyncio.Semaphore(max_concurrent_batches)

    @property
    def model_name(self) -> str:
        return self._model_name

    @property
    def embedding_dim(self) -> int:
        if self._embedding_dim is not None:
            return self._embedding_dim
        dims = {
            "text-embedding-3-small": 1536,
            "text-embedding-3-large": 3072,
            "text-embedding-ada-002": 1536,
        }
        return dims.get(self._model_name, 1536)

    async def _cache_conn(self) -> aiosqlite.Connection:
        if self._conn is None:
            self._conn = await aiosqlite.connect(str(self._cache_path))
            self._conn.row_factory = aiosqlite.Row
            await self._conn.execute("PRAGMA journal_mode=WAL")
            await self._conn.execute(
                "CREATE TABLE IF NOT EXISTS cache ("
                "  key TEXT PRIMARY KEY,"
                "  value TEXT NOT NULL,"
                "  created_at REAL NOT NULL"
                ")"
            )
            await self._conn.commit()
        return self._conn

    def _hash(self, text: str) -> str:
        return hashlib.sha256(text.encode("utf-8")).hexdigest()

    async def _cache_get(self, key: str) -> list[float] | None:
        conn = await self._cache_conn()
        cursor = await conn.execute("SELECT value FROM cache WHERE key = ?", (key,))
        row = await cursor.fetchone()
        if row:
            return json.loads(row["value"])
        return None

    async def _cache_set(self, key: str, value: list[float]) -> None:
        conn = await self._cache_conn()
        await conn.execute(
            "INSERT OR REPLACE INTO cache (key, value, created_at) VALUES (?, ?, ?)",
            (key, json.dumps(value), time.time()),
        )
        await conn.commit()

    async def embed(self, text: str) -> list[float]:
        key = self._hash(text)
        cached = await self._cache_get(key)
        if cached is not None:
            return cached
        data = await self._client.embed({"input": text})
        result = self._parse(data)[0]
        await self._cache_set(key, result)
        return result

    async def embed_batch(self, texts: list[str]) -> list[list[float]]:
        async with self._semaphore:
            keys = [self._hash(t) for t in texts]
            results: list[list[float] | None] = [None] * len(texts)
            uncached_indices: list[int] = []
            uncached_texts: list[str] = []

            for i, key in enumerate(keys):
                cached = await self._cache_get(key)
                if cached is not None:
                    results[i] = cached
                else:
                    uncached_indices.append(i)
                    uncached_texts.append(texts[i])

            if uncached_texts:
                data = await self._client.embed({"input": uncached_texts})
                parsed = self._parse(data)
                for idx, vec in zip(uncached_indices, parsed):
                    results[idx] = vec
                    await self._cache_set(keys[idx], vec)

            return [r for r in results if r is not None]

    def _parse(self, data: dict) -> list[list[float]]:
        try:
            sorted_data = sorted(data["data"], key=lambda x: x["index"])
            return [item["embedding"] for item in sorted_data]
        except (KeyError, IndexError) as e:
            raise LLMInvalidResponseError(
                f"Failed to parse embedding response: {e}", cause=e
            )
