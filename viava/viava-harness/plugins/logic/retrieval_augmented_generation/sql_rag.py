import asyncio
import traceback
from typing import Any
from datetime import datetime, timezone

from core.chunk_strategy import BaseChunkStrategy
from core.doc_status import DocProcessingStatus, DocStatus, DocStatusStorage
from core.embedding import BaseEmbedding
from core.llm import BaseLLM, LLMInput, LLMMessage
from core.rerank import BaseReranker
from core.store import BaseStore
from core.vector_storage import BaseVectorStorage

from capabilities.retrieval_augmented_generation import (
    BaseRAG,
    DocChunk,
    DocInsert,
    GenerationOutput,
    GenerationParam,
    RetrievalContext,
    RetrievalParam,
)

from utils.uitls import compute_mdhash_id, generate_track_id, count_tokens

from .uitls import sanitize_text_for_encoding
from .prompts import SQL_GENERATION_PROMPT


class SQLRAG(BaseRAG):
    def __init__(
        self,
        llm: BaseLLM,
        embedding: BaseEmbedding,
        ddl_vdb: BaseVectorStorage,
        doc_vdb: BaseVectorStorage,
        sql_example_vdb: BaseVectorStorage,
        chunk_strategy: BaseChunkStrategy,
        full_docs: BaseStore,
        ddl_chunks: BaseStore,
        doc_chunks: BaseStore,
        sql_example_chunks: BaseStore,
        doc_status: DocStatusStorage,
        reranker: BaseReranker | None = None,
        top_k: int = 40,
        chunk_top_k: int = 20,
        llm_model_max_async: int = 4,
    ):
        self.llm = llm
        self.embedding = embedding
        self.ddl_vdb = ddl_vdb
        self.doc_vdb = doc_vdb
        self.sql_example_vdb = sql_example_vdb
        self.chunk_strategy = chunk_strategy
        self.full_docs = full_docs
        self.ddl_chunks = ddl_chunks
        self.doc_chunks = doc_chunks
        self.sql_example_chunks = sql_example_chunks
        self.doc_status = doc_status
        self.reranker = reranker
        self.top_k = top_k
        self.chunk_top_k = chunk_top_k
        self.llm_model_max_async = llm_model_max_async

    async def _upsert_doc_status(
        self,
        doc_id: str,
        status: DocStatus,
        **kwargs: Any,
    ) -> None:
        existing = await self.doc_status.get_by_id(doc_id)
        if existing:
            merged = {**existing, "status": str(status.value), **kwargs}
        else:
            now = datetime.now(timezone.utc).isoformat()
            merged = {
                "doc_id": doc_id,
                "status": str(status.value),
                "track_id": "",
                "file_path": "unknown_source",
                "created_at": now,
                "updated_at": now,
                **kwargs,
            }
        merged["updated_at"] = datetime.now(timezone.utc).isoformat()
        await self.doc_status.upsert({doc_id: merged})

    def _get_category_vdb(self, category: str) -> BaseVectorStorage:
        mapping = {
            "ddl": self.ddl_vdb,
            "documentation": self.doc_vdb,
            "sql_example": self.sql_example_vdb,
        }
        if category not in mapping:
            raise ValueError(
                f"Category khong hop le: {category}. "
                f"Phai la mot trong: {list(mapping.keys())}"
            )
        return mapping[category]

    def _get_category_store(self, category: str) -> BaseStore:
        mapping = {
            "ddl": self.ddl_chunks,
            "documentation": self.doc_chunks,
            "sql_example": self.sql_example_chunks,
        }
        if category not in mapping:
            raise ValueError(
                f"Category khong hop le: {category}. "
                f"Phai la mot trong: {list(mapping.keys())}"
            )
        return mapping[category]

    async def _enqueue_documents(self, doc_insert: DocInsert) -> str:
        track_id = doc_insert.track_id
        if not track_id:
            track_id = generate_track_id("insert")

        domain = f"SQL:{doc_insert.domain}" if doc_insert.domain else ""

        raw_category = doc_insert.category

        contents = doc_insert.contents
        if isinstance(contents, str):
            contents = [contents]

        ids = doc_insert.ids
        if ids is not None:
            if isinstance(ids, str):
                ids = [ids] * len(contents)
            elif len(ids) != len(contents):
                raise ValueError(
                    f"Số lượng IDs ({len(ids)}) không khớp số lượng documents ({len(contents)})"
                )
            if len(set(ids)) != len(ids) and len(set(ids)) != 1:
                raise ValueError("IDS phải là duy nhất (unique)")

        file_paths = doc_insert.file_paths
        if file_paths is not None:
            if isinstance(file_paths, str):
                file_paths = [file_paths] * len(contents)
            elif len(file_paths) != len(contents):
                raise ValueError(
                    f"Số lượng file_paths ({len(file_paths)}) không khớp số lượng documents ({len(contents)})"
                )
            file_paths = [
                path.strip() if isinstance(path, str) else "unknown_source"
                for path in file_paths
            ]
        else:
            file_paths = ["unknown_source"] * len(contents)

        contents_dict: dict[str, dict[str, Any]] = {}
        source_to_doc_id: dict[str, str] = {}
        content_hash_to_doc_id: dict[str, str] = {}

        for i, doc in enumerate(contents):
            cleaned_content = sanitize_text_for_encoding(doc)
            content_hash = compute_mdhash_id(cleaned_content or "", prefix="")

            if ids is not None:
                doc_id = ids[i]
            else:
                doc_id = compute_mdhash_id(content=cleaned_content, prefix="doc-")

            file_path = file_paths[i]

            if isinstance(raw_category, dict):
                category = raw_category.get(file_path, "documentation")
            else:
                category = raw_category

            valid_categories = {"ddl", "documentation", "sql_example"}
            if category not in valid_categories:
                raise ValueError(
                    f"Category không hợp lệ: {category}. "
                    f"Phải là một trong: {valid_categories}"
                )

            if file_path != "unknown_source" and file_path in source_to_doc_id:
                continue

            if content_hash in content_hash_to_doc_id:
                continue

            if file_path != "unknown_source":
                source_to_doc_id[file_path] = doc_id
            content_hash_to_doc_id[content_hash] = doc_id

            contents_dict[doc_id] = {
                "content": cleaned_content,
                "file_path": file_path,
                "content_hash": content_hash,
                "category": category,
                "domain": domain,
            }

        if not contents_dict:
            return track_id

        all_new_ids = set(contents_dict.keys())
        unique_ids = await self.full_docs.filter_keys(all_new_ids)

        if not unique_ids:
            return track_id

        unique_ids_list: list[str] = []

        full_docs_data: dict[str, dict[str, Any]] = {}
        for doc_id in unique_ids:
            full_docs_data[doc_id] = contents_dict[doc_id]
            unique_ids_list.append(doc_id)

        if full_docs_data:
            await self.full_docs.upsert(full_docs_data)

        status_data: dict[str, dict[str, Any]] = {}
        for doc_id in unique_ids_list:
            data = contents_dict[doc_id]
            status_data[doc_id] = {
                "doc_id": doc_id,
                "status": str(DocStatus.PENDING.value),
                "track_id": track_id,
                "file_path": data["file_path"],
                "content_summary": data["content"][:200],
                "content_length": len(data["content"]),
                "content_hash": data.get("content_hash"),
                "chunks_count": 0,
                "domain": data.get("domain", ""),
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }

        await self.doc_status.upsert(status_data)

        return track_id

    async def _process_documents(self, doc_ids: list[str]) -> dict[str, int]:
        doc_chunk_counts: dict[str, int] = {}
        for doc_id in doc_ids:
            await self._upsert_doc_status(doc_id, DocStatus.PROCESSING)
            content_data = await self.full_docs.get_by_id(doc_id)
            if not content_data:
                continue
            content = content_data.get("content", "")
            category = content_data.get("category", "documentation")
            domain = content_data.get("domain", "")

            chunk_result = await self.chunk_strategy.chunk(content, category=category)
            if not chunk_result.chunks:
                continue

            chunks_data: dict[str, dict[str, Any]] = {}
            vdb_data: dict[str, dict[str, Any]] = {}
            file_path = content_data.get("file_path", "unknown_source")

            for chunk in chunk_result.chunks:
                chunk_id = compute_mdhash_id(chunk.content, prefix="chunk-")
                chunks_data[chunk_id] = {
                    "content": chunk.content,
                    "full_doc_id": doc_id,
                    "tokens": chunk.token_count,
                    "chunk_order_index": chunk.index,
                    "file_path": file_path,
                    "domain": domain,
                }
                vdb_data[chunk_id] = {
                    "content": chunk.content,
                    "full_doc_id": doc_id,
                    "category": category,
                    "file_path": file_path,
                    "domain": domain,
                }

            await self._get_category_store(category).upsert(chunks_data)

            target_vdb = self._get_category_vdb(category)
            await target_vdb.upsert(vdb_data)

            doc_chunk_counts[doc_id] = len(chunks_data)

        return doc_chunk_counts

    async def ainsert(self, doc_insert: DocInsert) -> str:
        track_id = await self._enqueue_documents(doc_insert)

        inflight = await self.doc_status.get_docs_by_statuses(
            [DocStatus.PENDING, DocStatus.FAILED, DocStatus.PROCESSING]
        )
        all_doc_ids = sorted(
            inflight.keys(),
            key=lambda did: inflight[did].updated_at or "",
            reverse=True,
        )

        if not all_doc_ids:
            return track_id

        failed_docs: dict[str, str] = {}
        doc_chunk_counts: dict[str, int] = {}
        for doc_id in all_doc_ids:
            try:
                chunk_counts = await self._process_documents([doc_id])
                doc_chunk_counts.update(chunk_counts)
                if doc_id not in chunk_counts:
                    failed_docs[doc_id] = "no chunks produced"
            except Exception as e:
                traceback.print_exc()
                failed_docs[doc_id] = str(e)

        flush_failed = False
        for storage in [
            self.ddl_vdb,
            self.doc_vdb,
            self.sql_example_vdb,
            self.full_docs,
            self.ddl_chunks,
            self.doc_chunks,
            self.sql_example_chunks,
            self.doc_status,
        ]:
            try:
                await storage.index_done_callback()
            except Exception:
                traceback.print_exc()
                flush_failed = True

        for doc_id in all_doc_ids:
            error_msg = failed_docs.get(doc_id)
            if error_msg:
                await self._upsert_doc_status(
                    doc_id,
                    DocStatus.FAILED,
                    error=error_msg,
                )
            elif flush_failed:
                await self._upsert_doc_status(
                    doc_id,
                    DocStatus.FAILED,
                    error="flush storage failed",
                )
            else:
                await self._upsert_doc_status(
                    doc_id,
                    DocStatus.PROCESSED,
                    chunks_count=doc_chunk_counts.get(doc_id, 0),
                )

        return track_id

    async def aretrieve(
        self, query: str, param: RetrievalParam = RetrievalParam()
    ) -> RetrievalContext:
        query_vector = await self.embedding.embed(query)

        domain_filter = {"domain": f"SQL:{param.domain}"} if param.domain else None

        ddl_task = self.ddl_vdb.query(
            query_text=query,
            top_k=param.chunk_top_k,
            query_embedding=query_vector,
            filter=domain_filter,
        )
        doc_task = self.doc_vdb.query(
            query_text=query,
            top_k=param.chunk_top_k,
            query_embedding=query_vector,
            filter=domain_filter,
        )
        example_task = self.sql_example_vdb.query(
            query_text=query,
            top_k=param.chunk_top_k,
            query_embedding=query_vector,
            filter=domain_filter,
        )

        ddl_results, doc_results, example_results = await asyncio.gather(
            ddl_task, doc_task, example_task
        )

        all_chunks: list[dict[str, Any]] = []

        for item in ddl_results:
            all_chunks.append({
                "id": item.id,
                "content": item.content,
                "score": item.score,
                "category": "ddl",
            })

        for item in doc_results:
            all_chunks.append({
                "id": item.id,
                "content": item.content,
                "score": item.score,
                "category": "documentation",
            })

        for item in example_results:
            all_chunks.append({
                "id": item.id,
                "content": item.content,
                "score": item.score,
                "category": "sql_example",
            })

        if not all_chunks:
            return RetrievalContext()

        if self.reranker is not None and param.enable_rerank:
            from core.vector_storage import ScoredItem
            scored = [
                ScoredItem(
                    id=c["id"],
                    content=c["content"],
                    score=c["score"],
                    metadata={"category": c["category"]},
                )
                for c in all_chunks
            ]
            scored = await self.reranker.rerank(query=query, candidates=scored, top_k=param.chunk_top_k)
            all_chunks = [
                {
                    "id": s.id,
                    "content": s.content,
                    "score": s.score,
                    "category": s.metadata.get("category", ""),
                }
                for s in scored
            ]
        else:
            all_chunks.sort(key=lambda x: x["score"], reverse=True)
            all_chunks = all_chunks[:param.chunk_top_k]

        if param.max_total_tokens > 0 and all_chunks:
            tokens = 0
            truncated: list[dict[str, Any]] = []
            for c in all_chunks:
                t = count_tokens(c["content"])
                if tokens + t > param.max_total_tokens:
                    break
                tokens += t
                truncated.append(c)
            all_chunks = truncated

        return RetrievalContext(chunks=all_chunks)

    async def agenerate(
        self,
        query: str,
        context: RetrievalContext,
        param: GenerationParam = GenerationParam(),
    ) -> GenerationOutput:
        ddl_chunks = [c for c in context.chunks if c.get("category") == "ddl"]
        doc_chunks = [c for c in context.chunks if c.get("category") == "documentation"]
        example_chunks = [c for c in context.chunks if c.get("category") == "sql_example"]

        schema_context = ""
        if ddl_chunks:
            schema_lines = [f"```sql\n{c['content']}\n```" for c in ddl_chunks]
            schema_context = "### Schema (DDL)\n\n" + "\n\n".join(schema_lines)

        tai_lieu_context = ""
        if doc_chunks:
            doc_lines = [c["content"] for c in doc_chunks]
            tai_lieu_context = "### Tài liệu\n\n" + "\n\n".join(doc_lines)

        vi_du_context = ""
        if example_chunks:
            example_lines = [f"```sql\n{c['content']}\n```" for c in example_chunks]
            vi_du_context = "### Ví dụ SQL\n\n" + "\n\n".join(example_lines)

        system_prompt = SQL_GENERATION_PROMPT.format(
            schema_context=schema_context or "(Không có schema)",
            tai_lieu_context=tai_lieu_context or "(Không có tài liệu)",
            vi_du_context=vi_du_context or "(Không có ví dụ)",
        )

        user_query = param.user_prompt or query

        result = await self.llm.chat(
            LLMInput(
                messages=[
                    LLMMessage(role="system", content=system_prompt),
                    LLMMessage(role="user", content=user_query),
                ],
                tools=[],
                user_id="sqlrag",
                stream=False,
            )
        )

        return GenerationOutput(
            content=result.content or "",
            raw_context=context,
        )

    async def ainsert_custom_chunks(
        self, full_text: str, chunks: list[DocChunk], doc_id: str | None = None
    ) -> str:
        ...

    async def amerge_entities(self) -> dict[str, Any]:
        return {}

    async def amerge_relationships(self) -> dict[str, Any]:
        return {}

    async def aget_doc_status(self, doc_id: str) -> DocProcessingStatus | None:
        raw = await self.doc_status.get_by_id(doc_id)
        if raw is None:
            return None
        return DocProcessingStatus(**raw)

    async def aget_docs_by_track_id(self, track_id: str) -> list[DocProcessingStatus]:
        return list((await self.doc_status.get_docs_by_track_id(track_id)).values())

    async def aget_processing_summary(self) -> dict[str, int]:
        return await self.doc_status.get_status_counts()

    async def initialize(self) -> None:
        await self.ddl_vdb.initialize()
        await self.doc_vdb.initialize()
        await self.sql_example_vdb.initialize()
        await self.full_docs.initialize()
        await self.ddl_chunks.initialize()
        await self.doc_chunks.initialize()
        await self.sql_example_chunks.initialize()
        await self.doc_status.initialize()

    async def finalize(self) -> None:
        for storage in [
            self.ddl_vdb,
            self.doc_vdb,
            self.sql_example_vdb,
            self.full_docs,
            self.ddl_chunks,
            self.doc_chunks,
            self.sql_example_chunks,
            self.doc_status,
        ]:
            await storage.index_done_callback()
            await storage.finalize()
