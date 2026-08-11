import json
from abc import ABC, abstractmethod
from typing import Any

from core.vector_storage import ScoredItem

from .models import SqlKnowledgeResult


class SqlKnowledgeBase(ABC):
    @abstractmethod
    async def ensure_collections(self) -> None: ...

    @abstractmethod
    async def add_ddl(self, ddl: str, table_name: str = "", metadata: dict | None = None) -> str: ...

    @abstractmethod
    async def add_documentation(self, content: str, topic: str = "", metadata: dict | None = None) -> str: ...

    @abstractmethod
    async def add_example(self, question: str, sql: str, metadata: dict | None = None) -> str: ...

    @abstractmethod
    async def search_ddl(self, query: str, top_k: int = 10, filter: dict[str, Any] | None = None) -> list[ScoredItem]: ...

    @abstractmethod
    async def search_documentation(self, query: str, top_k: int = 5, filter: dict[str, Any] | None = None) -> list[ScoredItem]: ...

    @abstractmethod
    async def search_examples(self, query: str, top_k: int = 5, filter: dict[str, Any] | None = None) -> list[ScoredItem]: ...

    async def query(self, question: str, filter: dict[str, Any] | None = None) -> SqlKnowledgeResult:
        ddl_hits = await self.search_ddl(question, filter=filter)
        doc_hits = await self.search_documentation(question, filter=filter)
        ex_hits = await self.search_examples(question, filter=filter)

        examples = []
        for h in ex_hits:
            try:
                data = json.loads(h.content)
                examples.append({"question": data["question"], "sql": data["sql"]})
            except (json.JSONDecodeError, KeyError):
                pass

        return SqlKnowledgeResult(
            tables=[h.content for h in ddl_hits],
            additional_context=[h.content for h in doc_hits],
            question_sql_pairs=examples,
        )
