import json
from typing import Any

from core.embedding import BaseEmbedding
from core.sql_knowledge_base import SqlKnowledgeBase
from core.vector_storage import ScoredItem
from core.vector_storage.base import BaseVectorStorage


class QdrantSqlKnowledgeBase(SqlKnowledgeBase):
    COLLECTION_DDL = "sql_ddl"
    COLLECTION_DOC = "sql_doc"
    COLLECTION_EXAMPLE = "sql_example"

    def __init__(self, vector_store: BaseVectorStorage, embedding: BaseEmbedding):
        self._vs = vector_store
        self._emb = embedding

    def _to_filter(self, filter_dict: dict[str, Any] | None):
        if not filter_dict:
            return None
        from qdrant_client.models import Filter, FieldCondition, MatchValue
        conditions = [
            FieldCondition(key=k, match=MatchValue(value=v))
            for k, v in filter_dict.items()
        ]
        return Filter(must=conditions)

    async def ensure_collections(self) -> None:
        await self._vs.initialize()

    async def add_ddl(self, ddl: str, table_name: str = "", metadata: dict | None = None) -> str:
        vector = await self._emb.embed(ddl)
        meta = {"table_name": table_name, **(metadata or {})}
        return await self._vs.upsert(self.COLLECTION_DDL, ddl, vector, meta)

    async def add_documentation(self, content: str, topic: str = "", metadata: dict | None = None) -> str:
        vector = await self._emb.embed(content)
        meta = {"topic": topic, **(metadata or {})}
        return await self._vs.upsert(self.COLLECTION_DOC, content, vector, meta)

    async def add_example(self, question: str, sql: str, metadata: dict | None = None) -> str:
        text = json.dumps({"question": question, "sql": sql})
        vector = await self._emb.embed(question)
        meta = {"question": question, "sql": sql, **(metadata or {})}
        return await self._vs.upsert(self.COLLECTION_EXAMPLE, text, vector, meta)

    async def search_ddl(self, query: str, top_k: int = 10, filter: dict[str, Any] | None = None) -> list[ScoredItem]:
        vector = await self._emb.embed(query)
        return await self._vs.query(
            query_text=query,
            query_embedding=vector,
            top_k=top_k,
            filter=self._to_filter(filter),
        )

    async def search_documentation(self, query: str, top_k: int = 5, filter: dict[str, Any] | None = None) -> list[ScoredItem]:
        vector = await self._emb.embed(query)
        return await self._vs.query(
            query_text=query,
            query_embedding=vector,
            top_k=top_k,
            filter=self._to_filter(filter),
        )

    async def search_examples(self, query: str, top_k: int = 5, filter: dict[str, Any] | None = None) -> list[ScoredItem]:
        vector = await self._emb.embed(query)
        return await self._vs.query(
            query_text=query,
            query_embedding=vector,
            top_k=top_k,
            filter=self._to_filter(filter),
        )
