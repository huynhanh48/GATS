import asyncio
import hashlib
import uuid

from pydantic import BaseModel, Field
from typing import Any

from qdrant_client import AsyncQdrantClient, models

from core.embedding import BaseEmbedding
from core.vector_storage import BaseVectorStorage, ScoredItem


def _to_qdrant_id(point_id: str, *, prefix: str = "") -> str:
    """Chuyển string ID thành deterministic UUID cho Qdrant

    Đảm bảo: cùng point_id + prefix → cùng UUID (idempotent upsert).
    """
    hashed = hashlib.sha256((prefix + point_id).encode()).digest()
    return uuid.UUID(bytes=hashed[:16]).hex

class _PendingDoc(BaseModel):
    """Bản ghi đang chờ flush — lưu trong buffer trước khi ghi xuống Qdrant"""

    payload: dict[str, Any] = Field(default_factory=dict)
    """Payload gốc gồm: content, _id, và metadata khác"""

    vector: list[float] | None = None
    """Embedding vector — None = chưa được tính, sẽ embed khi flush"""

class QdrantVectorStorage(BaseVectorStorage):
    """Triển khai BaseVectorStorage với Qdrant backend (async)

    Mỗi instance quản lý 1 Qdrant collection, xác định bởi namespace.
    Dùng write-behind pattern: upsert/delete ghi vào buffer in-memory,
    index_done_callback() flush batch xuống Qdrant.
    Embedding được defer đến lúc flush để gom batch.
    """

    def __init__(
        self,
        embedding: BaseEmbedding,
        namespace: str,
        *,
        url: str | None = None,
        host: str | None = None,
        port: int | None = None,
        api_key: str | None = None,
        location: str | None = None,
        path: str | None = None,
        max_batch_size: int = 64,
    ) -> None:
        self._embedding = embedding
        self._namespace = namespace
        self._url = url
        self._host = host
        self._port = port
        self._api_key = api_key
        self._location = location
        self._path = path
        self._max_batch_size = max_batch_size

        self._client: AsyncQdrantClient | None = None
        self._pending_upserts: dict[str, _PendingDoc] = {}
        self._pending_deletes: set[str] = set()
        self._flush_lock = asyncio.Lock()
        self._initialized = False

        self._validate_embedding()

        suffix = self._build_collection_suffix()
        self._collection_name = (
            f"harness_vdb_{namespace}_{suffix}" if suffix else namespace
        )

    @property
    def embedding(self) -> BaseEmbedding:
        return self._embedding


    def _build_client(self) -> AsyncQdrantClient:
        kwargs: dict[str, Any] = {
            "api_key": self._api_key,
            "check_compatibility": False,
        }
        if self._location:
            kwargs["location"] = self._location
        elif self._path:
            kwargs["path"] = self._path
        elif self._url:
            kwargs["url"] = self._url
        else:
            kwargs["host"] = self._host
            kwargs["port"] = self._port
        return AsyncQdrantClient(**kwargs)
    
    def _to_qdrant_filter(
        self, filter_dict: dict[str, Any] | None
    ) -> models.Filter | None:
        """Chuyển dict filter → Qdrant Filter (key-value equality)"""
        if not filter_dict:
            return None
        conditions = [
            models.FieldCondition(
                key=k,
                match=models.MatchValue(value=v),
            )
            for k, v in filter_dict.items()
        ]
        return models.Filter(must=conditions)
    


    async def initialize(self) -> None:
        """Khởi tạo — tạo AsyncQdrantClient, tạo collection nếu chưa tồn tại"""
        if self._initialized:
            return

        self._client = self._build_client()

        if not await self._client.collection_exists(self._collection_name):
            await self._client.create_collection(
                collection_name=self._collection_name,
                vectors_config=models.VectorParams(
                    size=self._embedding.embedding_dim,
                    distance=models.Distance.COSINE,
                ),
            )

        if not self._path:
            await self._client.create_payload_index(
                collection_name=self._collection_name,
                field_name="domain",
                field_schema=models.PayloadSchemaType.KEYWORD,
            )

        self._initialized = True

    
    async def finalize(self) -> None:
        """Dọn dẹp — flush buffer cuối + đóng client"""
        try:
            await self._flush_pending_ops()
        finally:
            if self._client is not None:
                await self._client.close()
                self._client = None


    async def index_done_callback(self) -> None:
        """Flush buffer xuống Qdrant"""
        await self._flush_pending_ops()

    
    async def drop_pending_index_ops(self) -> None:
        """Hủy buffer khi batch indexing lỗi"""
        async with self._flush_lock:
            self._pending_upserts.clear()
            self._pending_deletes.clear()

    async def drop(self) -> dict[str, str]:
        """Xoá toàn bộ dữ liệu — clear buffer + xoá collection"""
        try:
            async with self._flush_lock:
                self._pending_upserts.clear()
                self._pending_deletes.clear()

            if self._client is not None:
                if await self._client.collection_exists(self._collection_name):
                    await self._client.delete_collection(self._collection_name)

            return {"status": "success", "message": "data dropped"}
        except Exception as e:
            return {"status": "error", "message": str(e)}
        
    async def _flush_pending_ops(self) -> None:
        """Flush toàn bộ pending upserts + deletes xuống Qdrant

        Gồm 3 bước trong 1 lock:
          1. Embed batch những doc chưa có vector
          2. Upsert point vào Qdrant
          3. Xoá pending deletes khỏi Qdrant

        Nếu lỗi ở bất kỳ bước nào → raise, giữ nguyên buffer → retry lần flush sau.
        """
        async with self._flush_lock:
            if not self._pending_upserts and not self._pending_deletes:
                return
            if self._client is None:
                return

            pending_upserts = dict(self._pending_upserts)
            pending_deletes = set(self._pending_deletes)

            # 1. Embed batch — chỉ những doc chưa có vector
            docs_to_embed = [
                (doc_id, pdoc)
                for doc_id, pdoc in pending_upserts.items()
                if pdoc.vector is None
            ]

            if docs_to_embed:
                contents = [pdoc.payload["content"] for _, pdoc in docs_to_embed]
                vectors = await self._embedding.embed_batch(contents)
                if len(vectors) != len(docs_to_embed):
                    raise RuntimeError(
                        f"Embedding count mismatch: expected {len(docs_to_embed)}, "
                        f"got {len(vectors)}"
                    )
                for (doc_id, pdoc), vec in zip(docs_to_embed, vectors):
                    pdoc.vector = vec

            # 2. Upsert points vào Qdrant
            points: list[models.PointStruct] = []
            committed_ids: list[str] = []
            for doc_id, pdoc in pending_upserts.items():
                if pdoc.vector is None:
                    continue
                committed_ids.append(doc_id)
                points.append(
                    models.PointStruct(
                        id=_to_qdrant_id(doc_id),
                        vector=pdoc.vector,
                        payload=pdoc.payload,
                    )
                )

            if points:
                batch_size = max(self._max_batch_size, 1)
                for i in range(0, len(points), batch_size):
                    batch = points[i : i + batch_size]
                    await self._client.upsert(
                        collection_name=self._collection_name,
                        points=batch,
                        wait=True,
                    )

            # 3. Xoá pending deletes khỏi Qdrant
            if pending_deletes:
                qdrant_delete_ids = [
                    _to_qdrant_id(doc_id) for doc_id in pending_deletes
                ]
                await self._client.delete(
                    collection_name=self._collection_name,
                    points_selector=models.PointIdsList(points=qdrant_delete_ids),
                )

            # 4. Cleanup buffer — chỉ xoá những gì đã commit thành công
            for doc_id in committed_ids:
                self._pending_upserts.pop(doc_id, None)
            self._pending_deletes -= pending_deletes

    async def upsert(self, data: dict[str, dict[str, Any]]) -> None:
        """Buffer batch upsert — không embed ngay, chờ flush"""
        if not data:
            return

        pending: list[tuple[str, _PendingDoc]] = []
        for doc_id, entry in data.items():
            vector = entry.get("vector", None)

            payload: dict[str, Any] = {
                "_id": doc_id,
                **{k: v for k, v in entry.items() if k not in ("vector")},
            }

            pending.append((doc_id, _PendingDoc(payload=payload, vector=vector)))

        async with self._flush_lock:
            for doc_id, pdoc in pending:
                self._pending_deletes.discard(doc_id)
                self._pending_upserts[doc_id] = pdoc


    async def delete(self, ids: list[str]) -> None:
        """Buffer batch delete — không xoá khỏi Qdrant ngay, chờ flush"""
        if not ids:
            return

        async with self._flush_lock:
            for doc_id in ids:
                self._pending_upserts.pop(doc_id, None)
                self._pending_deletes.add(doc_id)


    async def query(
        self,
        query_text: str,
        top_k: int,
        *,
        query_embedding: list[float] | None = None,
        filter: dict[str, Any] | None = None,
    ) -> list[ScoredItem]:
        """Tìm kiếm ngữ nghĩa — chỉ đọc từ Qdrant server-side, không merge buffer"""
        if query_embedding is not None:
            embedding = query_embedding
        else:
            embedding = await self._embedding.embed(query_text)

        if self._client is None:
            return []

        qdrant_filter = self._to_qdrant_filter(filter)

        results = await self._client.query_points(
            collection_name=self._collection_name,
            query=embedding,
            limit=top_k,
            with_payload=True,
            query_filter=qdrant_filter,
        )

        return [
            ScoredItem(
                id=str(r.id),
                content=r.payload.get("content", ""),
                score=r.score,
                metadata={
                    k: v
                    for k, v in (r.payload or {}).items()
                    if k not in ("content", "_id")
                },
            )
            for r in results.points
        ]
    


    async def get_by_id(self, id: str) -> dict[str, Any] | None:
        """Lấy payload — check buffer trước (read-your-writes), fallback Qdrant"""
        async with self._flush_lock:
            if id in self._pending_deletes:
                return None
            pending = self._pending_upserts.get(id)
            if pending is not None:
                return dict(pending.payload)

        if self._client is None:
            return None

        qdrant_id = _to_qdrant_id(id)
        results = await self._client.retrieve(
            collection_name=self._collection_name,
            ids=[qdrant_id],
            with_payload=True,
        )

        if not results:
            return None

        return dict(results[0].payload)
    

    async def get_by_ids(self, ids: list[str]) -> list[dict[str, Any]]:
        """Lấy payload của nhiều ID — read-your-writes"""
        if not ids:
            return []

        result: list[dict[str, Any]] = []
        qdrant_ids: list[str] = []

        async with self._flush_lock:
            for doc_id in ids:
                if doc_id in self._pending_deletes:
                    continue
                pending = self._pending_upserts.get(doc_id)
                if pending is not None:
                    result.append(dict(pending.payload))
                else:
                    qdrant_ids.append(doc_id)

        if qdrant_ids and self._client is not None:
            qdrant_uuids = [_to_qdrant_id(doc_id) for doc_id in qdrant_ids]
            points = await self._client.retrieve(
                collection_name=self._collection_name,
                ids=qdrant_uuids,
                with_payload=True,
            )
            for point in points:
                result.append(dict(point.payload or {}))

        return result
    

    async def get_vectors_by_ids(self, ids: list[str]) -> dict[str, list[float]]:
        """Lấy vector — check buffer trước, lazy-embed nếu cần, fallback Qdrant"""
        if not ids:
            return {}

        result: dict[str, list[float]] = {}
        remaining: list[str] = []

        async with self._flush_lock:
            docs_to_embed: list[tuple[str, _PendingDoc]] = []
            for doc_id in ids:
                if doc_id in self._pending_deletes:
                    continue
                pending = self._pending_upserts.get(doc_id)
                if pending is not None:
                    if pending.vector is not None:
                        result[doc_id] = pending.vector
                    else:
                        docs_to_embed.append((doc_id, pending))
                else:
                    remaining.append(doc_id)

            if docs_to_embed:
                contents = [pdoc.payload["content"] for _, pdoc in docs_to_embed]
                vectors = await self._embedding.embed_batch(contents)
                for (doc_id, pdoc), vec in zip(docs_to_embed, vectors):
                    pdoc.vector = vec
                    result[doc_id] = vec

        if remaining and self._client is not None:
            qdrant_id_to_doc_id = {
                _to_qdrant_id(doc_id): doc_id for doc_id in remaining
            }
            points = await self._client.retrieve(
                collection_name=self._collection_name,
                ids=list(qdrant_id_to_doc_id.keys()),
                with_vectors=True,
                with_payload=True,
            )
            for point in points:
                if point and point.vector:
                    doc_id = qdrant_id_to_doc_id.get(str(point.id))
                    if doc_id:
                        result[doc_id] = (
                            point.vector.tolist()
                            if hasattr(point.vector, "tolist")
                            else list(point.vector)
                        )

        return result
    


    async def delete_entity(self, entity_name: str) -> None:
        """Buffer delete entity — hash tên entity → ID, ghi vào buffer"""
        entity_id = _to_qdrant_id(entity_name, prefix="ent-")
        async with self._flush_lock:
            self._pending_upserts.pop(entity_id, None)
            self._pending_deletes.add(entity_id)

    async def delete_entity_relation(self, entity_name: str) -> None:
        """Xoá toàn bộ relation của entity — scroll + delete server-side + prune buffer"""
        async with self._flush_lock:
            to_prune = [
                k
                for k, v in self._pending_upserts.items()
                if v.payload.get("src_id") == entity_name
                or v.payload.get("tgt_id") == entity_name
            ]
            for k in to_prune:
                self._pending_upserts.pop(k, None)

            if self._client is None:
                return

            relation_filter = models.Filter(
                should=[
                    models.FieldCondition(
                        key="src_id",
                        match=models.MatchValue(value=entity_name),
                    ),
                    models.FieldCondition(
                        key="tgt_id",
                        match=models.MatchValue(value=entity_name),
                    ),
                ]
            )

            offset: str | int | None = None
            while True:
                points, next_offset = await self._client.scroll(
                    collection_name=self._collection_name,
                    scroll_filter=relation_filter,
                    with_payload=False,
                    with_vectors=False,
                    limit=1000,
                    offset=offset,
                )

                if not points:
                    break

                ids_to_delete = [point.id for point in points]
                await self._client.delete(
                    collection_name=self._collection_name,
                    points_selector=models.PointIdsList(points=ids_to_delete),
                )

                if next_offset is None:
                    break
                offset = next_offset