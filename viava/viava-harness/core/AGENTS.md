# AGENTS.md — core/

Tầng contracts — ABCs + pydantic models. Zero dependency ngoài Python stdlib.

## Quy tắc

- **Chỉ import từ `core/`** — không import từ `capabilities/`, `integrations/`, `tools/`, `harness_agents/`
- Mọi package trong `core/` **bắt buộc** phải có `__init__.py` + `models.py` + `base.py`
- `__init__.py` re-export toàn bộ public API
- `models.py` định nghĩa pydantic `BaseModel` — chỉ chứa data, không logic
- `base.py` định nghĩa `ABC` với `@abstractmethod` — là contract
- `base.py` **phải import và dùng** models từ `models.py` (không dùng `str`/`float` raw nếu đã có model)

## Các package

| Package | ABC | Models |
|---------|-----|--------|
| `embedding/` | `BaseEmbedding` | `EmbeddingResponse` |
| `graph/` | `BaseGraph` (kèm PPR) | `GraphNode`, `GraphEdge`, `PPRConfig` |
| `llm/` | `BaseLLM` | `LLMMessage`, `LLMInput`, `LLMOutput`, `LlmStreamChunk`, `FinishReason`, stream events, exceptions |
| `page_rank.py/` | `PersonalizedPageRankBase` | `PPRParam` |
| `rerank/` | `BaseReranker` | `RerankResult` |
| `session/` | `SessionBase` | `Session`, `Message`, `SessionSummary`, `TokenCounts`, `EndReason` |
| `sql_generator/` | `SqlGenerator` | `SqlOutput` |
| `sql_knowledge_base/` | `SqlKnowledgeBase` | `SqlKnowledgeResult` |
| `tool/` | `ToolBase[T]` | `ToolCall`, `ToolContext`, `ToolResult`, `ToolDefinition`, `ToolRejection`, `ToolEntry` |
| `user/` | `UserBase` | `User` |
| `vector_storage/` | `BaseVectorStore` | `CollectionConfig`, `DistanceMetric`, `SearchHit`, `SearchQuery` |

## Import nội bộ trong core

- `core.llm.models` import `core.tool` (ToolCall, ToolDefinition)
- `core.session.models` import `core.tool` (ToolCall)
- `core.tool.base` import `core.user.models` (User)
- `core.rerank.base` import `core.vector_storage.models` (SearchHit)
- `core.sql_knowledge_base.base` import `core.vector_storage` (SearchHit)
