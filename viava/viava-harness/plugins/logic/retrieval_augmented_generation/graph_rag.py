# TODO: Đổi tất cả target -> destination, tgt -> dst
import asyncio
import traceback
import json
from typing import Any
from datetime import datetime, timezone
from collections import defaultdict

from core.chunk_strategy import BaseChunkStrategy
from core.doc_status import DocProcessingStatus, DocStatus, DocStatusStorage
from core.embedding import BaseEmbedding
from core.graph_storage import BaseGraphStorage, GraphEdge, GraphNode, KnowledgeGraph
from core.llm import BaseLLM, LLMInput, LLMMessage
from core.rerank import BaseReranker
from core.store import BaseStore
from core.vector_storage import BaseVectorStorage, ScoredItem

from capabilities.information_extraction import BaseExtractor
from capabilities.retrieval_augmented_generation import (
    BaseRAG,
    DocChunk,
    DocInsert,
    GenerationOutput,
    GenerationParam,
    RAGDeleteResult,
    RetrievalContext,
    RetrievalParam,
)

from utils.uitls import compute_mdhash_id, generate_track_id, count_tokens

from .uitls import sanitize_text_for_encoding
from .models import KeywordExtraction
from .prompts import (
    GENERATION_CONTEXT_PROMPT,
    GENERATION_PROMPT,
    KEYWORD_EXTRACT_EXAMPLES,
    KEYWORD_EXTRACT_PROMPT,
)


def _round_robin_merge(
    list_a: list[dict[str, Any]], list_b: list[dict[str, Any]], key: str | tuple[str, ...]
) -> list[dict[str, Any]]:
    seen: set[Any] = set()
    result: list[dict[str, Any]] = []
    for i in range(max(len(list_a), len(list_b))):
        for lst in (list_a, list_b):
            if i < len(lst):
                if isinstance(key, str):
                    k = lst[i][key]
                else:
                    k = tuple(lst[i][k] for k in key)
                if k not in seen:
                    seen.add(k)
                    result.append(lst[i])
    return result


def _truncate_by_tokens(items: list[dict[str, Any]], key_fn: Any, max_tokens: int) -> list[dict[str, Any]]:
    if max_tokens <= 0:
        return []
    tokens = 0
    for i, item in enumerate(items):
        tokens += count_tokens(key_fn(item))
        if tokens > max_tokens:
            return items[:i]
    return items


def _weighted_polling(items: list[dict[str, Any]], max_per_item: int, min_per_item: int) -> list[str]:
    n = len(items)
    if n == 0:
        return []
    if n == 1:
        return items[0]["sorted_chunks"][:max_per_item]

    expected: list[int] = []
    for i in range(n):
        ratio = i / (n - 1)
        expected.append(int(round(max_per_item - ratio * (max_per_item - min_per_item))))

    selected: list[str] = []
    used: list[int] = []

    remaining = 0
    for i, item in enumerate(items):
        chunks: list[str] = item["sorted_chunks"]
        take = min(expected[i], len(chunks))
        selected.extend(chunks[:take])
        used.append(take)
        left = expected[i] - take
        if left > 0:
            remaining += left

    for _ in range(remaining):
        allocated = False
        for i, item in enumerate(items):
            chunks: list[str] = item["sorted_chunks"]
            if used[i] < len(chunks):
                selected.append(chunks[used[i]])
                used[i] += 1
                allocated = True
                break
        if not allocated:
            break

    return selected

class GraphRAG(BaseRAG):
    def __init__(
        self,
        llm: BaseLLM,
        extractor: BaseExtractor,
        embedding: BaseEmbedding,
        entities_vdb: BaseVectorStorage,
        relationships_vdb: BaseVectorStorage,
        chunks_vdb: BaseVectorStorage,
        chunk_strategy: BaseChunkStrategy,
        graph: BaseGraphStorage,
        full_docs: BaseStore,
        text_chunks: BaseStore,
        entity_chunks: BaseStore,
        relation_chunks: BaseStore,
        full_entities: BaseStore,
        full_relations: BaseStore,
        doc_status: DocStatusStorage,
        reranker: BaseReranker | None = None,
        delimiter: str = "<SEP>",
        max_parallel_insert: int = 3,
        llm_model_max_async: int = 4,

    ):
        self.llm = llm
        self.extractor = extractor
        self.embedding = embedding
        self.entities_vdb = entities_vdb
        self.relationships_vdb = relationships_vdb
        self.chunks_vdb = chunks_vdb
        self.chunk_strategy = chunk_strategy
        self.graph = graph
        self.full_docs = full_docs
        self.text_chunks = text_chunks
        self.entity_chunks = entity_chunks
        self.relation_chunks = relation_chunks
        self.full_entities = full_entities
        self.full_relations = full_relations
        self.doc_status = doc_status
        self.reranker = reranker
        self.delimiter = delimiter
        self.max_parallel_insert = max_parallel_insert
        self.llm_model_max_async = llm_model_max_async


    @staticmethod
    def _merge_source_ids(
        existing_ids: list[str],
        new_ids: list[str]
    ) -> list[str]:
        """Gộp hai danh sách source_id với dedup có thứ tự.

        Giữ thứ tự chèn: existing IDs trước, new IDs sau.
        Không loại bỏ trùng lặp(Giữ theo thứ tự).

        Args:
            existing_ids: Source chunk IDs đã lưu trước đó.
            new_ids: Source chunk IDs mới từ extraction hiện tại.

        Returns:
            Danh sách đã dedup, giữ thứ tự existing rồi mới đến new.
        """

        result: list[str] = []
        for sid in existing_ids:
            result.append(sid)

        for sid in new_ids:
            result.append(sid)

        return result


    async def _upsert_doc_status(
        self,
        doc_id: str,
        status: DocStatus,
        **kwargs: Any,
    ) -> None:
        """Cập nhật doc_status nguyên tử: đọc → merge → upsert."""
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

    # ============================================================
    # Ingest
    # ============================================================
    async def ainsert(self, doc_insert: DocInsert) -> str:
        """Insert documents với checkpoint support — inline processing.

        Full pipeline:
          1. Enqueue (normalize + validate + dedup + store)
          2. Process (chunk + extract per chunk)
          3. Merge (accumulate + merge nodes + merge edges)
          4. Finalize (doc_status → PROCESSED + flush all storages)
        """

        track_id = await self._enqueue_documents(doc_insert)

        # Đọc tất cả doc chưa hoàn thành (mới + cũ), ưu tiên mới nhất trước
        inflight = await self.doc_status.get_docs_by_statuses(
            [DocStatus.PENDING, DocStatus.FAILED, DocStatus.PROCESSING]
        )
        # Sắp xếp theo updated_at giảm dần — doc mới cập nhật được xử lý trước
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
                per_chunk_extractions = await self._process_documents([doc_id])

                if not per_chunk_extractions:
                    failed_docs[doc_id] = "no chunks extracted"
                    continue

                await self._merge_into_graph(per_chunk_extractions, doc_id)

                doc_chunk_counts[doc_id] = len(per_chunk_extractions)
            except Exception as e:
                traceback.print_exc()
                failed_docs[doc_id] = str(e)

        # Flush tất cả storages — chỉ khi flush thành công mới ghi PROCESSED
        flush_failed = False
        for storage in [
            self.entities_vdb,
            self.relationships_vdb,
            self.chunks_vdb,
            self.graph,
            self.full_docs,
            self.text_chunks,
            self.entity_chunks,
            self.relation_chunks,
            self.full_entities,
            self.full_relations,
            self.doc_status,
        ]:
            try:
                await storage.index_done_callback()
            except Exception:
                traceback.print_exc()
                flush_failed = True

        # Ghi trạng thái cuối cùng: chỉ PROCESSED nếu xử lý + flush đều OK
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

    async def ainsert_custom_chunks(self, full_text: str, chunks: list[DocChunk], doc_id: str | None = None) -> str:
        ...

    async def _enqueue_documents(self, doc_insert: DocInsert) -> str:
        """Normalize, validate, dedup, store full_docs + doc_status.

        Returns:
            (track_id, list of unique doc_ids that were actually inserted)
        """
        track_id = doc_insert.track_id
        if not track_id:
            track_id = generate_track_id("insert")


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
                raise ValueError(
                    "IDS phải là duy nhất (unique)"
                )


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
        duplicate_attempts: list[dict[str, Any]] = []

        for i, doc in enumerate(contents):
            # Cleand content
            cleaned_content = sanitize_text_for_encoding(doc)
            content_hash = compute_mdhash_id(cleaned_content or "", prefix="")

            if ids is not None:
                doc_id = ids[i]

            else:
                doc_id = compute_mdhash_id(content= cleaned_content, prefix="doc-")

            file_path = file_paths[i]

            if file_path != "unknown_source" and file_path in source_to_doc_id:
                # duplicate_attempts.append(
                #     {
                #         "doc_id": doc_id,
                #         "original_doc_id": source_to_doc_id[file_path_canonical],
                #         "file_path": file_path_canonical,
                #         "content_length": body_length,
                #         "existing_status": "batch_duplicate",
                #         "existing_track_id": "",
                #         "duplicate_kind": "filename",
                #     }
                # )
                # return
                continue

            if content_hash in content_hash_to_doc_id:
                # duplicate_attempts.append(
                #     {
                #         {
                #         "doc_id": doc_id,
                #         "original_doc_id": content_hash_to_doc_id[content_hash],
                #         "file_path": file_path_canonical,
                #         "content_length": body_length,
                #         "existing_status": "batch_duplicate",
                #         "existing_track_id": "",
                #         "duplicate_kind": "content_hash",
                #     }
                #     }
                # )
                # return
                continue

            if file_path != "unknown_source":
                source_to_doc_id[file_path] = doc_id
            content_hash_to_doc_id[content_hash] = doc_id

            contents_dict[doc_id] = {
                "content": cleaned_content,
                "file_path": file_path,
                "content_hash": content_hash,
                "domain": doc_insert.domain or "",
            }



        if not contents_dict:
            return track_id

        # Filter already-known doc_ids
        all_new_ids = set(contents_dict.keys())
        unique_ids = await self.full_docs.filter_keys(all_new_ids)

        if not unique_ids:
            return track_id

        unique_ids_list: list[str] = []

        # Store full_docs
        full_docs_data: dict[str, dict[str, Any]] = {}
        for doc_id in unique_ids:
            full_docs_data[doc_id] = contents_dict[doc_id]
            unique_ids_list.append(doc_id)

        if full_docs_data:
            await self.full_docs.upsert(full_docs_data)

        # Store doc_status (PENDING)
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
                "entities_count": 0,
                "relations_count": 0,
                "domain": data.get("domain", ""),
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }

        await self.doc_status.upsert(status_data)

        return track_id

    async def _process_documents(
        self,
        doc_ids: list[str],
    ) -> list[
        tuple[
            dict[
                str,
                list[
                    dict[str, Any]
                ]
            ],
            dict[
                tuple[
                    str,
                    str
                ],
                list[
                    dict[str, Any]
                ]
            ]
        ]
    ]:
        per_chunk_extractions: list = []
        for doc_id in doc_ids:
            await self._upsert_doc_status(doc_id, DocStatus.PROCESSING)
            content_data = await self.full_docs.get_by_id(doc_id)
            if not content_data:
                continue
            content = content_data.get("content", "")
            domain = content_data.get("domain", "")

            chunk_result = await self.chunk_strategy.chunk(content)
            if not chunk_result.chunks:
                continue

            chunks_data: dict[str, dict[str, Any]] = {}
            chunk_ids: list[str] = []

            file_path = content_data.get("file_path", "unknown_source")

            for chunk in chunk_result.chunks:
                chunk_id = compute_mdhash_id(chunk.content, prefix="chunk-")
                chunk_ids.append(chunk_id)
                chunks_data[chunk_id] = {
                    "content": chunk.content,
                    "full_doc_id": doc_id,
                    "chunk_order_index": chunk.index,
                    "tokens": chunk.token_count,
                    "file_path": file_path,
                    "source_id": chunk_id,
                    "domain": domain,
                }
      
            await self.text_chunks.upsert(chunks_data)
            await self.chunks_vdb.upsert(chunks_data)

            semaphore = asyncio.Semaphore(self.llm_model_max_async)

            async def _extract_one_chunk(chunk_id: str, chunk_content: str):
                async with semaphore:
                    extraction_result = await self.extractor.extract(chunk_content)
                    return chunk_id, extraction_result


            tasks = [
                _extract_one_chunk(cid, chunks_data[cid]["content"])
                for cid in chunk_ids
            ]
            results = await asyncio.gather(*tasks, return_exceptions=True)

            # Xây dựng các tuple per_chunk_extractions

            for result in results:
                if isinstance(result, BaseException):
                    continue
                chunk_id, extraction_result = result

                maybe_nodes: dict[str, list[dict[str, Any]]] = {}
                for entity in extraction_result.entities:
                    name = entity.entity_name
                    if name not in maybe_nodes:
                        maybe_nodes[name] = []

                    maybe_nodes[name].append({
                        "entity_name": name,
                        "entity_type": entity.entity_type,
                        "description": entity.entity_description,
                        "source_id": chunk_id,
                        "file_path": file_path,
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                    })

                maybe_edges: dict[tuple[str, str], list[dict[str, Any]]] = {}
                for rel in extraction_result.relationships:
                    key = (rel.source_entity, rel.target_entity)
                    if key not in maybe_edges:
                        maybe_edges[key] = []

                    maybe_edges[key].append({
                        "source": rel.source_entity,
                        "target": rel.target_entity,
                        "description": rel.relationship_description,
                        "keywords": rel.relationship_keywords,
                        "weight": 1.0,
                        "source_id": chunk_id,
                        "file_path": file_path,
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                    })

                per_chunk_extractions.append((maybe_nodes, maybe_edges))

        return per_chunk_extractions

    async def _merge_nodes_then_upsert(
        self,
        entity_name: str,
        entities_list: list[dict[str, Any]],
        domain: str = "",
    ) -> None:
        """Gộp các bản ghi entity đã tích lũy từ tất cả chunks vào graph.

        Cho một entity_name:
        - Gộp source_ids với node đã tồn tại
        - Cập nhật entity_chunks tracking
        - Dedup descriptions, nối bằng delimiter (không dùng LLM)
        - Xác định entity_type theo majority vote
        - Upsert vào graph + entities_vdb
        """

        node_id = f"{domain}{self.delimiter}{entity_name}" if domain else entity_name

        # Lấy node + chunk tracking hiện có
        existing_node = await self.graph.get_node(node_id)
        existing_chunk_data = await self.entity_chunks.get_by_id(entity_name)
        existing_source_ids: list[str] = (
            existing_chunk_data.get("chunk_ids", [])
            if existing_chunk_data
            else []
        )

        # Thu thập source_ids mới
        new_source_ids = [
            e["source_id"]
            for e in entities_list
            if e.get("source_id") and e.get("source_id") not in existing_source_ids
        ]

        full_source_ids = self._merge_source_ids(
            existing_source_ids,
            new_source_ids,
        )

        # Cập nhật entity_chunks
        ent_chunk_payload: dict[str, Any] = {
            "chunk_ids": full_source_ids,
            "count": len(full_source_ids),
        }

        if domain:
            ent_chunk_payload["domain"] = domain

        await self.entity_chunks.upsert({
            node_id: ent_chunk_payload,
        })


        # Dedup descriptions (giữ bản đầu tiên cho mỗi text duy nhất)
        descs: list[str] = []
        for e in entities_list:
            d = e.get("description", "")
            descs.append(d)

        if existing_node and existing_node.description:
            descs.insert(0, existing_node.description)


        description = self.delimiter.join(descs)

        # Xác định entity_type (biểu quyết đa số)
        types = [
            e.get("entity_type", "Other")     # Lấy entity_type từ mỗi entity dict
            for e in entities_list
            if e.get("entity_type")            # Bỏ qua nếu không có
        ]
        # types = ["Person", "Person", "Organization"]

        if types:
            entity_type = max(set(types), key=types.count)
            # set(types) = {"Person", "Organization"}
            # types.count("Person") = 2
            # types.count("Organization") = 1
            # → chọn "Person" (xuất hiện nhiều nhất)
        elif existing_node:
            entity_type = existing_node.entity_type   # Giữ loại cũ nếu có
        else:
            entity_type = "Other"                     # Fallback

        # Xây dựng và upsert GraphNode
        source_id_str = self.delimiter.join(full_source_ids)
        node_properties: dict[str, Any] = {}
        if domain:
            node_properties["domain"] = domain
            node_properties["display_name"] = entity_name

        node = GraphNode(
            id=node_id,
            entity_type=entity_type,
            description=description,
            source_id=source_id_str,
            properties=node_properties,
        )
        await self.graph.upsert_node(node_id, node)

        # Upsert vào entities_vdb
        entity_vdb_id = compute_mdhash_id(node_id, prefix="ent-")
        entity_payload: dict[str, Any] = {
            "entity_name": node_id,
            "content": f"{entity_name}\n{description}",
            "source_id": source_id_str,
            "description": description,
            "entity_type": entity_type,
            "file_path": entities_list[0].get("file_path", "unknown_source")
                if entities_list else "unknown_source",
            "domain": domain,
        }
        if domain:
            entity_payload["display_name"] = entity_name

        await self.entities_vdb.upsert({
            entity_vdb_id: entity_payload,
        })

    async def _merge_edges_then_upsert(
        self,
        src_name: str,
        tgt_name: str,
        edges_list: list[dict[str, Any]],
        domain: str = "",
    ) -> None:
        """Gộp các bản ghi relation đã tích lũy từ tất cả chunks vào graph.

        Cho một cặp (src, tgt):
        - Gộp source_ids với edge đã tồn tại
        - Cập nhật relation_chunks tracking
        - Tính weight, gộp keywords
        - Dedup descriptions, nối bằng delimiter
        - Đảm bảo entity đầu cuối tồn tại
        - Upsert vào graph + relationships_vdb
        """

        if domain:
            scoped_src = f"{domain}{self.delimiter}{src_name}"
            scoped_tgt = f"{domain}{self.delimiter}{tgt_name}"
            storage_key = f"{domain}{self.delimiter}{src_name}->{tgt_name}"
        else:
            scoped_src = src_name
            scoped_tgt = tgt_name
            storage_key = f"{src_name}->{tgt_name}"


        # Lấy edge + chunk tracking hiện có
        existing_edge = await self.graph.get_edge(scoped_src, scoped_tgt)
        existing_chunk_data = await self.relation_chunks.get_by_id(storage_key)
        existing_source_ids: list[str] = (
            existing_chunk_data.get("chunk_ids", [])
            if existing_chunk_data
            else []
        )

        # Thu thập source_ids mới
        new_source_ids = [
            e["source_id"]
            for e in edges_list
            if e.get("source_id") and e.get("source_id") not in existing_source_ids
        ]

        full_source_ids = self._merge_source_ids(
            existing_source_ids,
            new_source_ids,
        )

        # Cập nhật relation_chunks
        rel_chunk_payload: dict[str, Any] = {
            "chunk_ids": full_source_ids,
            "count": len(full_source_ids),
        }
        if domain:
            rel_chunk_payload["domain"] = domain

        await self.relation_chunks.upsert({
            storage_key: rel_chunk_payload,
        })

        # Tính weight (tổng tất cả)
        total_weight = sum(e.get("weight", 1.0) for e in edges_list)
        if existing_edge:
            total_weight += existing_edge.weight

        #  Gộp keywords (nối duy nhất, phân cách bằng dấu phẩy)
        all_keywords: list[str] = []
        for e in edges_list:
            kws = e.get("keywords", "")
            if isinstance(kws, str):
                for kw in kws.split(","):
                    kw = kw.strip()
                    if kw and kw not in all_keywords:
                        all_keywords.append(kw)
        if existing_edge:
            for kw in existing_edge.keywords.split(","):
                kw = kw.strip()
                if kw and kw not in all_keywords:
                    all_keywords.append(kw)
        keywords = ", ".join(all_keywords)

        # Dedup descriptions + nối
        descs: list[str] = []
        for e in edges_list:
            d = e.get("description", "")
            descs.append(d)
        if existing_edge and existing_edge.description:
            descs.insert(0, existing_edge.description)
        description = self.delimiter.join(descs)

        # Đảm bảo entity đầu cuối tồn tại
        for name in [scoped_src, scoped_tgt]:
            if not await self.graph.has_node(name):
                stub_node = GraphNode(
                    id=name,
                    entity_type="UNKNOWN",
                    description="",
                    source_id="",
                )
                await self.graph.upsert_node(name, stub_node)

        # Xây dựng và upsert GraphEdge
        source_id_str = self.delimiter.join(full_source_ids)
        edge_properties: dict[str, Any] = {}
        if domain:
            edge_properties["domain"] = domain

        edge = GraphEdge(
            id=storage_key,
            source=scoped_src,
            destination=scoped_tgt,
            edge_type="fact",
            description=description,
            keywords=keywords,
            source_id=source_id_str,
            weight=total_weight,
            properties=edge_properties,
        )
        await self.graph.upsert_edge(scoped_src, scoped_tgt, edge)

        # 6i. Upsert vào relationships_vdb
        rel_vdb_id = compute_mdhash_id(storage_key, prefix="rel-")
        rel_payload: dict[str, Any] = {
            "src_id": scoped_src,
            "tgt_id": scoped_tgt,
            "source_id": source_id_str,
            "content": f"{keywords}\t{src_name}\n{tgt_name}\n{description}",
            "keywords": keywords,
            "description": description,
            "weight": total_weight,
            "file_path": edges_list[0].get("file_path", "unknown_source")
                if edges_list else "unknown_source",
            "domain": domain,
        }
        if domain:
            rel_payload["display_src"] = src_name
            rel_payload["display_tgt"] = tgt_name

        await self.relationships_vdb.upsert({
            rel_vdb_id: rel_payload,
        })

    async def _merge_into_graph(
        self,
        per_chunk_extractions: list[tuple[dict[str, list[dict[str, Any]]], dict[tuple[str, str], list[dict[str, Any]]]]],
        doc_id: str,
    ) -> None:
        """Session 4 orchestrator: thu thập candidates, tích lũy, gộp.

        Phase 0: Recovery anchors (full_entities, full_relations)
        Phase 1: Tích lũy tất cả entities/relations từ các chunks
        Phase 2: Gộp từng entity → graph + entities_vdb
        Phase 3: Gộp từng relation → graph + relationships_vdb
        """

        content_data = await self.full_docs.get_by_id(doc_id)
        domain = content_data.get("domain", "") if content_data else ""

        # Phase 0: Thu thập candidates + lưu recovery anchors
        all_entity_names: set[str] = set()
        all_relation_pairs: set[tuple[str, str]] = set()

        for maybe_nodes, maybe_edges in per_chunk_extractions:
            all_entity_names.update(maybe_nodes.keys())
            for src, tgt in maybe_edges.keys():
                all_relation_pairs.add(tuple(sorted([src, tgt])))

        await self.full_entities.upsert({
            doc_id: {
                "entity_names": list(all_entity_names),
                "count": len(all_entity_names),
                "domain": domain,
            }
        })
        await self.full_relations.upsert({
            doc_id: {
                "relation_pairs": [
                    list(pair) for pair in all_relation_pairs
                ],
                "count": len(all_relation_pairs),
                "domain": domain,
            }
        })

        # Phase 1: Tích lũy tất cả entities và relations từ các chunks
        all_nodes: dict[str, list[dict[str, Any]]] = defaultdict(list)
        all_edges: dict[tuple[str, str], list[dict[str, Any]]] = defaultdict(list)

        for maybe_nodes, maybe_edges in per_chunk_extractions:
            for entity_name, entities in maybe_nodes.items():
                all_nodes[entity_name].extend(entities)
            for edge_key, edges in maybe_edges.items():
                sorted_key = tuple(sorted(edge_key))
                all_edges[sorted_key].extend(edges)

        # Phase 2: Xử lý entities
        for entity_name, entities_list in all_nodes.items():
            await self._merge_nodes_then_upsert(entity_name, entities_list, domain)

        # Phase 3: Xử lý relations
        for (src_name, tgt_name), edges_list in all_edges.items():
            await self._merge_edges_then_upsert(src_name, tgt_name, edges_list, domain)

    async def _extract_keywords(self, query: str) -> tuple[list[str], list[str]]:
        prompt = KEYWORD_EXTRACT_PROMPT.format(
            query=query,
            examples=KEYWORD_EXTRACT_EXAMPLES,
            language="tiếng Việt",
        )

        try:
            result = await self.llm.chat(
                LLMInput(
                    messages=[LLMMessage(role="user", content=prompt)],
                    output_parser=KeywordExtraction(),
                    tools=[],
                    user_id="retrieval",
                    stream=False,
                )
            )

            if isinstance(result.content, KeywordExtraction):
                return result.content.hl_keywords, result.content.ll_keywords
        except Exception as e:
            print(f"Error in _extract_keywords: {e}")
            traceback.print_exc()

        return [], []

    async def _search_entities(
        self, keywords_str: str, ll_embedding: list[float] | None, top_k: int, domain: str | None = None,
    ) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
        results = await self.entities_vdb.query(
            keywords_str, top_k,
            query_embedding=ll_embedding,
            filter={"domain": domain} if domain else None,
        )
        if not results:
            return [], []

        entity_names = [r.metadata["entity_name"] for r in results]
        nodes_dict = await self.graph.get_nodes_batch(entity_names)

        entities: list[dict[str, Any]] = []
        for r in results:
            node = nodes_dict.get(r.metadata["entity_name"])
            if node is None:
                continue
            entities.append({
                "entity_name": node.id,
                "display_name": node.properties.get("display_name", node.id)
                    if node.properties else node.id,
                "entity_type": node.entity_type,
                "description": node.description,
                "source_id": node.source_id,
                "score": r.score,
                "file_path": r.metadata.get("file_path", ""),
            })

        relations = await self._get_edges_for_entities(entity_names)
        return entities, relations

    async def _get_edges_for_entities(self, entity_names: list[str]) -> list[dict[str, Any]]:
        edges_per_node = await self.graph.get_nodes_edges_batch(entity_names)

        all_pairs: set[tuple[str, str]] = set()
        for edges in edges_per_node.values():
            for src, tgt in edges:
                all_pairs.add(tuple(sorted([src, tgt])))

        if not all_pairs:
            return []

        pairs_list = list(all_pairs)

        edge_data, edge_degrees = await asyncio.gather(
            self.graph.get_edges_batch([{"src": s, "tgt": t} for s, t in pairs_list]),
            self.graph.edge_degrees_batch(pairs_list),
        )

        # Batch-resolve display names for all edge endpoints
        all_endpoints: set[str] = set()
        for s, t in pairs_list:
            all_endpoints.add(s)
            all_endpoints.add(t)
        nodes_dict = await self.graph.get_nodes_batch(list(all_endpoints))

        def _display(node_id: str) -> str:
            node = nodes_dict.get(node_id)
            if node and node.properties:
                return node.properties.get("display_name", node_id)
            return node_id

        relations: list[dict[str, Any]] = []
        for s, t in pairs_list:
            edge = edge_data.get((s, t))
            if edge is None:
                continue
            relations.append({
                "src_id": edge.source,
                "tgt_id": edge.destination,
                "display_src": _display(edge.source),
                "display_tgt": _display(edge.destination),
                "description": edge.description,
                "keywords": edge.keywords,
                "weight": edge.weight,
                "source_id": edge.source_id,
                "rank": edge_degrees.get((s, t), 0),
            })

        relations.sort(key=lambda r: (r["rank"], r["weight"]), reverse=True)
        return relations

    async def _search_relations(
        self, keywords_str: str, hl_embedding: list[float] | None, top_k: int, domain: str | None = None
    ) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
        results = await self.relationships_vdb.query(
            keywords_str, top_k,
            query_embedding=hl_embedding,
            filter={"domain": domain} if domain else None,
        )
        if not results:
            return [], []

        edge_pairs = [{"src": r.metadata["src_id"], "tgt": r.metadata["tgt_id"]} for r in results]
        edge_data = await self.graph.get_edges_batch(edge_pairs)

        relations: list[dict[str, Any]] = []
        for r in results:
            pair = (r.metadata["src_id"], r.metadata["tgt_id"])
            edge = edge_data.get(pair)
            if edge is None:
                continue
            rel = {
                "src_id": edge.source,
                "tgt_id": edge.destination,
                "description": edge.description,
                "keywords": edge.keywords,
                "weight": edge.weight,
                "source_id": edge.source_id,
                "score": r.score,
                "file_path": r.metadata.get("file_path", ""),
            }
            display_src = r.metadata.get("display_src")
            if display_src:
                rel["display_src"] = display_src
                rel["display_tgt"] = r.metadata.get("display_tgt", "")
            relations.append(rel)

        entities = await self._get_entities_for_edges(relations)
        return relations, entities

    async def _get_entities_for_edges(self, relations: list[dict[str, Any]]) -> list[dict[str, Any]]:
        entity_names: list[str] = []
        seen: set[str] = set()
        for r in relations:
            for name in (r["src_id"], r["tgt_id"]):
                if name not in seen:
                    entity_names.append(name)
                    seen.add(name)

        if not entity_names:
            return []

        nodes_dict = await self.graph.get_nodes_batch(entity_names)

        entities: list[dict[str, Any]] = []
        for name in entity_names:
            node = nodes_dict.get(name)
            if node is None:
                continue
            display_name = node.properties.get("display_name", node.id) if node.properties else node.id
            entities.append({
                "entity_name": node.id,
                "display_name": display_name,
                "entity_type": node.entity_type,
                "description": node.description,
                "source_id": node.source_id,
            })
        return entities

    async def _search_chunks(
        self, query: str, query_embedding: list[float] | None, chunk_top_k: int, domain: str | None = None
    ) -> list[dict[str, Any]]:
        results = await self.chunks_vdb.query(
            query, chunk_top_k,
            query_embedding=query_embedding,
            filter={"domain": domain} if domain else None,
        )
        return [
            {
                # "chunk_id": r.id,  {'chunk_id': 'a26d05decf51737107d311983a2d16f3'
                "content": r.content,
                "score": r.score,
                "full_doc_id": r.metadata.get("full_doc_id", ""),
                "created_at": r.metadata.get("created_at", None),
                "file_path": r.metadata.get("file_path", "unknown_source"),
                "source_type": "vector",  # Mark the source type
                "chunk_id": r.metadata.get("source_id"),  #  {'chunk_id': 'chunk-a26d05decf51737107d311983a2d16f3'
                 
            }
            for r in results
        ]

    async def _perform_kg_search(
        self, query: str, hl_keywords: list[str], ll_keywords: list[str], param: RetrievalParam,
    ) -> dict[str, Any]:
        query_emb = None
        hl_emb = None
        ll_emb = None

        texts: list[str] = []
        purposes: list[str] = []

        if query:
            texts.append(query)
            purposes.append("query")
        if hl_keywords:
            texts.append(", ".join(hl_keywords))
            purposes.append("hl")
        if ll_keywords:
            texts.append(", ".join(ll_keywords))
            purposes.append("ll")

        if texts:
            embeddings = await self.embedding.embed_batch(texts)
            for i, purpose in enumerate(purposes):
                if purpose == "query":
                    query_emb = embeddings[i]
                elif purpose == "hl":
                    hl_emb = embeddings[i]
                elif purpose == "ll":
                    ll_emb = embeddings[i]

        domain = param.domain

        local_entities: list[dict[str, Any]] = []
        local_relations: list[dict[str, Any]] = []
        if ll_keywords:
            ll_str = ", ".join(ll_keywords)
            local_entities, local_relations = await self._search_entities(
                ll_str, ll_emb, param.top_k, domain=domain
            )

        global_relations: list[dict[str, Any]] = []
        global_entities: list[dict[str, Any]] = []
        if hl_keywords:
            hl_str = ", ".join(hl_keywords)
            global_relations, global_entities = await self._search_relations(
                hl_str, hl_emb, param.top_k, domain=domain
            )

        vector_chunks = await self._search_chunks(query, query_emb, param.chunk_top_k, domain=domain)

        final_entities = _round_robin_merge(local_entities, global_entities, "entity_name")
        final_relations = _round_robin_merge(local_relations, global_relations, ("src_id", "tgt_id"))

        return {
            "final_entities": final_entities,
            "final_relations": final_relations,
            "vector_chunks": vector_chunks,
        }

    async def _apply_token_truncation(
        self, search_result: dict[str, Any], param: RetrievalParam,
    ) -> dict[str, Any]:
        final_entities = search_result["final_entities"]
        final_relations = search_result["final_relations"]

        entity_id_to_original: dict[str, dict[str, Any]] = {}
        relation_id_to_original: dict[tuple[str, str], dict[str, Any]] = {}

        entities_context: list[dict[str, Any]] = []
        for entity in final_entities:
            name = entity["entity_name"]
            entity_id_to_original[name] = entity
            entities_context.append({
                "entity": name,
                "type": entity.get("entity_type", "UNKNOWN"),
                "description": entity.get("description", "UNKNOWN"),
            })

        relations_context: list[dict[str, Any]] = []
        for rel in final_relations:
            src, tgt = rel["src_id"], rel["tgt_id"]
            key = (src, tgt)
            relation_id_to_original[key] = rel
            relations_context.append({
                "entity1": src,
                "entity2": tgt,
                "description": rel.get("description", "UNKNOWN"),
            })

        entities_context = _truncate_by_tokens(
            entities_context,
            key_fn=lambda e: json.dumps(e, ensure_ascii=False),
            max_tokens=param.max_entity_tokens,
        )

        relations_context = _truncate_by_tokens(
            relations_context,
            key_fn=lambda r: json.dumps(r, ensure_ascii=False),
            max_tokens=param.max_relation_tokens,
        )

        surviving_names = {e["entity"] for e in entities_context}
        filtered_entities = [e for e in final_entities if e["entity_name"] in surviving_names]
        filtered_entity_id_to_original = {
            k: v for k, v in entity_id_to_original.items() if k in surviving_names
        }

        surviving_pairs = {(r["entity1"], r["entity2"]) for r in relations_context}
        filtered_relations = [
            r for r in final_relations
            if (r["src_id"], r["tgt_id"]) in surviving_pairs
        ]
        filtered_relation_id_to_original = {
            k: v for k, v in relation_id_to_original.items() if k in surviving_pairs
        }

        return {
            "entities_context": entities_context,
            "relations_context": relations_context,
            "filtered_entities": filtered_entities,
            "filtered_relations": filtered_relations,
            "entity_id_to_original": filtered_entity_id_to_original,
            "relation_id_to_original": filtered_relation_id_to_original,
        }

    async def _get_chunks_for_entities(self, entities: list[dict[str, Any]]) -> list[dict[str, Any]]:
        if not entities:
            return []

        entities_with_chunks: list[dict[str, Any]] = []
        chunk_occurrence: dict[str, int] = {}

        for entity in entities:
            source_id = entity.get("source_id", "")
            if not source_id:
                continue
            chunk_ids = [cid for cid in source_id.split(self.delimiter) if cid]
            if not chunk_ids:
                continue

            deduped: list[str] = []
            for cid in chunk_ids:
                chunk_occurrence[cid] = chunk_occurrence.get(cid, 0) + 1
                if chunk_occurrence[cid] == 1:
                    deduped.append(cid)

            entities_with_chunks.append({
                "entity_name": entity["entity_name"],
                "chunks": deduped,
            })

        if not entities_with_chunks:
            return []

        for info in entities_with_chunks:
            info["sorted_chunks"] = sorted(
                info["chunks"],
                key=lambda cid: chunk_occurrence.get(cid, 0),
                reverse=True,
            )

        selected_ids = _weighted_polling(entities_with_chunks, max_per_item=10, min_per_item=2)
        if not selected_ids:
            return []

        unique_ids = list(dict.fromkeys(selected_ids))
        chunk_data_list = await self.text_chunks.get_by_ids(unique_ids)

        result: list[dict[str, Any]] = []
        for cid, data in zip(unique_ids, chunk_data_list):
            if data and "content" in data:
                result.append({
                    "chunk_id": cid,
                    "content": data["content"],
                    "file_path": data.get("file_path", ""),
                    "full_doc_id": data.get("full_doc_id", ""),
                    "chunk_order_index": data.get("chunk_order_index", 0),
                })
        return result

    async def _get_chunks_for_relations(
        self, relations: list[dict[str, Any]], entity_chunks: list[dict[str, Any]]
    ) -> list[dict[str, Any]]:
        if not relations:
            return []

        entity_chunk_ids = {c["chunk_id"] for c in entity_chunks}

        relations_with_chunks: list[dict[str, Any]] = []
        chunk_occurrence: dict[str, int] = {}

        for rel in relations:
            source_id = rel.get("source_id", "")
            if not source_id:
                continue
            chunk_ids = [cid for cid in source_id.split(self.delimiter) if cid]
            if not chunk_ids:
                continue

            deduped: list[str] = []
            for cid in chunk_ids:
                if cid in entity_chunk_ids:
                    continue
                chunk_occurrence[cid] = chunk_occurrence.get(cid, 0) + 1
                if chunk_occurrence[cid] == 1:
                    deduped.append(cid)

            if not deduped:
                continue

            relations_with_chunks.append({
                "relation_key": (rel["src_id"], rel["tgt_id"]),
                "chunks": deduped,
            })

        if not relations_with_chunks:
            return []

        for info in relations_with_chunks:
            info["sorted_chunks"] = sorted(
                info["chunks"],
                key=lambda cid: chunk_occurrence.get(cid, 0),
                reverse=True,
            )

        selected_ids = _weighted_polling(relations_with_chunks, max_per_item=10, min_per_item=2)
        if not selected_ids:
            return []

        unique_ids = list(dict.fromkeys(selected_ids))
        chunk_data_list = await self.text_chunks.get_by_ids(unique_ids)

        result: list[dict[str, Any]] = []
        for cid, data in zip(unique_ids, chunk_data_list):
            if data and "content" in data:
                result.append({
                    "chunk_id": cid,
                    "content": data["content"],
                    "file_path": data.get("file_path", ""),
                    "full_doc_id": data.get("full_doc_id", ""),
                    "chunk_order_index": data.get("chunk_order_index", 0),
                })
        return result

    async def _merge_all_chunks(
        self,
        filtered_entities: list[dict[str, Any]],
        filtered_relations: list[dict[str, Any]],
        vector_chunks: list[dict[str, Any]],
    ) -> list[dict[str, Any]]:
        entity_chunks = await self._get_chunks_for_entities(filtered_entities)
        relation_chunks = await self._get_chunks_for_relations(filtered_relations, entity_chunks)

        merged: list[dict[str, Any]] = []
        seen: set[str] = set()

        for i in range(max(len(vector_chunks), len(entity_chunks), len(relation_chunks))):
            for source in (vector_chunks, entity_chunks, relation_chunks):
                if i < len(source):
                    cid = source[i].get("chunk_id") or source[i].get("id")
                    if cid and cid not in seen:
                        seen.add(cid)
                        merged.append(source[i])

        return merged

    async def _build_final_result(
        self,
        truncation_result: dict[str, Any],
        merged_chunks: list[dict[str, Any]],
        query: str,
        param: RetrievalParam,
        hl_keywords: list[str],
        ll_keywords: list[str],
    ) -> RetrievalContext:
        chunks = list(merged_chunks)

        if param.enable_rerank and self.reranker and chunks:
            candidates = [
                ScoredItem(id=c.get("chunk_id", ""), content=c.get("content", ""), score=0.0)
                for c in chunks
            ]
            reranked = await self.reranker.rerank(query, candidates, len(candidates))
            score_map = {r.id: r.score for r in reranked}
            chunks.sort(key=lambda c: score_map.get(c.get("chunk_id", ""), 0), reverse=True)

        entities_ctx = truncation_result["entities_context"]
        relations_ctx = truncation_result["relations_context"]

        entities_tokens = count_tokens(json.dumps(entities_ctx, ensure_ascii=False)) if entities_ctx else 0
        relations_tokens = count_tokens(json.dumps(relations_ctx, ensure_ascii=False)) if relations_ctx else 0
        query_tokens = count_tokens(query)
        buffer = 200

        available_chunk_tokens = param.max_total_tokens - entities_tokens - relations_tokens - query_tokens - buffer
        if available_chunk_tokens < 0:
            available_chunk_tokens = 0

        chunks = _truncate_by_tokens(
            chunks,
            key_fn=lambda c: c.get("content", ""),
            max_tokens=available_chunk_tokens,
        )

        references: list[str] = []
        if param.include_references and chunks:
            for i, chunk in enumerate(chunks):
                ref_id = f"R{i + 1}"
                chunk["reference_id"] = ref_id
                file_path = chunk.get("file_path", "")
                references.append(f"[{ref_id}] {file_path}")

        entities_graph: list[GraphNode] = []
        for entity in truncation_result["filtered_entities"]:
            entities_graph.append(GraphNode(
                id=entity.get("display_name", entity["entity_name"]),
                entity_type=entity.get("entity_type", "UNKNOWN"),
                description=entity.get("description", ""),
                source_id=entity.get("source_id", ""),
                properties=entity.get("properties", {}),
            ))

        relations_graph: list[GraphEdge] = []
        for rel in truncation_result["filtered_relations"]:
            display_src = rel.get("display_src", rel["src_id"])
            display_tgt = rel.get("display_tgt", rel["tgt_id"])
            relations_graph.append(GraphEdge(
                id=f"{display_src}-{display_tgt}",
                source=display_src,
                destination=display_tgt,
                edge_type="fact",
                description=rel.get("description", ""),
                keywords=rel.get("keywords", ""),
                source_id=rel.get("source_id", ""),
                weight=rel.get("weight", 1.0),
                properties=rel.get("properties", {}),
            ))

        return RetrievalContext(
            entities=entities_graph,
            relations=relations_graph,
            chunks=chunks,
            references=references,
            metadata={
                "keywords": {
                    "hl_keywords": hl_keywords,
                    "ll_keywords": ll_keywords,
                },
                "processing_info": {
                    "entity_count": len(entities_graph),
                    "relation_count": len(relations_graph),
                    "chunk_count": len(chunks),
                    "total_entities_tokens": entities_tokens,
                    "total_relations_tokens": relations_tokens,
                    "total_chunks_tokens": count_tokens(json.dumps(chunks, ensure_ascii=False)),
                },
            },
        )

    async def aretrieve(self, query: str, param: RetrievalParam ) -> RetrievalContext:
        if not query or not query.strip():
            return RetrievalContext(
                metadata={"status": "failure", "message": "empty query"}
            )

        hl_keywords, ll_keywords = await self._extract_keywords(query)

        if not hl_keywords:
            hl_keywords = [query]

        if not ll_keywords:
            ll_keywords = [query]


        search_result = await self._perform_kg_search(query, hl_keywords, ll_keywords, param)

        if not search_result["final_entities"] and not search_result["final_relations"]:
            if not search_result["vector_chunks"]:
                return RetrievalContext(
                    metadata={
                        "status": "failure",
                        "message": "no results found",
                        "keywords": {"hl_keywords": hl_keywords, "ll_keywords": ll_keywords},
                        "processing_info": {"entity_count": 0, "relation_count": 0, "chunk_count": 0},
                    }
                )



        truncation_result = await self._apply_token_truncation(search_result, param)


        merged_chunks = await self._merge_all_chunks(
            filtered_entities=truncation_result["filtered_entities"],
            filtered_relations=truncation_result["filtered_relations"],
            vector_chunks=search_result["vector_chunks"],
        )

        retrieval_context = await self._build_final_result(
            truncation_result=truncation_result,
            merged_chunks=merged_chunks,
            query=query,
            param=param,
            hl_keywords=hl_keywords,
            ll_keywords=ll_keywords,
        )

        return retrieval_context

    # ============================================================
    # Generation
    # ============================================================

    async def agenerate(
        self,
        query: str,
        context: RetrievalContext,
        param: GenerationParam = GenerationParam(),
    ) -> GenerationOutput:
        entities_lines: list[str] = []
        for e in context.entities:
            entities_lines.append(
                json.dumps({
                    "entity": e.id,
                    "type": e.entity_type,
                    "description": e.description,
                }, ensure_ascii=False)
            )
        entities_str = "\n".join(entities_lines)

        relations_lines: list[str] = []
        for r in context.relations:
            relations_lines.append(
                json.dumps({
                    "entity1": r.source,
                    "entity2": r.destination,
                    "description": r.description,
                    "keywords": r.keywords,
                }, ensure_ascii=False)
            )
        relations_str = "\n".join(relations_lines)

        chunks_lines: list[str] = []
        for c in context.chunks:
            entry: dict[str, Any] = {"content": c.get("content", "")}
            ref = c.get("reference_id")
            if ref:
                entry["reference_id"] = ref
            chunks_lines.append(json.dumps(entry, ensure_ascii=False))
        text_chunks_str = "\n".join(chunks_lines)

        reference_list_str = "\n".join(context.references) if context.references else ""

        context_data = GENERATION_CONTEXT_PROMPT.format(
            entities_str=entities_str or "[]",
            relations_str=relations_str or "[]",
            text_chunks_str=text_chunks_str or "[]",
            reference_list_str=reference_list_str,
        )

        system_prompt = GENERATION_PROMPT.format(
            response_type=param.response_type,
            user_prompt=param.user_prompt or "",
            context_data=context_data,
        )

        result = await self.llm.chat(
            LLMInput(
                messages=[
                    LLMMessage(role="system", content=system_prompt),
                    LLMMessage(role="user", content=query),
                ],
                tools=[],
                user_id="retrieval",
                stream=False,
            )
        )

        return GenerationOutput(
            content=result.content or "",
            raw_context=context,
        )

    # ============================================================
    # Status
    # ============================================================

    async def aget_doc_status(self, doc_id: str) -> DocProcessingStatus | None:
        raw = await self.doc_status.get_by_id(doc_id)
        if raw is None:
            return None
        return DocProcessingStatus(**raw)

    async def aget_docs_by_track_id(self, track_id: str) -> list[DocProcessingStatus]:
        return list((await self.doc_status.get_docs_by_track_id(track_id)).values())

    async def aget_processing_summary(self) -> dict[str, int]:
        return await self.doc_status.get_status_counts()

    async def adelete_by_doc(self, doc_id: str) -> RAGDeleteResult:
        raise ...

    async def adelete_by_entity(self, entity_name: str) -> RAGDeleteResult:
        raise ...

    async def adelete_by_relation(self, source: str, target: str) -> RAGDeleteResult:
        raise ...

    async def acreate_entity(self, entity: GraphNode) -> GraphNode:
        ...
    async def aedit_entity(self, entity_name: str, entity: GraphNode) -> GraphNode:
        ...

    async def acreate_relation(self, edge: GraphEdge) -> GraphEdge:
        ...

    async def aedit_relation(self, source: str, target: str, edge: GraphEdge) -> GraphEdge:
        """Sửa relation — merge GraphEdge mới vào relation hiện có."""
        ...

    async def amerge_entities(self) -> dict[str, Any]:
        ...

    async def amerge_relationships(self) -> dict[str, Any]:
        ...

    async def get_knowledge_graph(self, node_label: str, max_depth: int = 3, max_nodes: int = 1000) -> KnowledgeGraph:
        return await self.graph.get_knowledge_graph(
            node_label=node_label, 
            max_depth=max_depth, 
            max_nodes=max_nodes
        )

    async def get_entity_info(self, entity_name: str) -> GraphNode | None:
        return await self.graph.get_node(entity_name)

    async def get_relation_info(self, source: str, target: str) -> GraphEdge | None:
        return await self.graph.get_edge(source, target)

    async def get_graph_labels(self) -> list[str]:
        return await self.graph.get_all_labels()

    async def initialize(self) -> None:
        await self.entities_vdb.initialize()
        await self.relationships_vdb.initialize()
        await self.chunks_vdb.initialize()
        await self.graph.initialize()
        await self.full_docs.initialize()
        await self.text_chunks.initialize()
        await self.entity_chunks.initialize()
        await self.relation_chunks.initialize()
        await self.full_entities.initialize()
        await self.full_relations.initialize()
        await self.doc_status.initialize()

    async def finalize(self) -> None:
        for storage in [
            self.entities_vdb,
            self.relationships_vdb,
            self.chunks_vdb,
            self.graph,
            self.full_docs,
            self.text_chunks,
            self.entity_chunks,
            self.relation_chunks,
            self.full_entities,
            self.full_relations,
            self.doc_status,
        ]:
            await storage.index_done_callback()
            await storage.finalize()